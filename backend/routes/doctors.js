const express = require('express');
const { runQuery, getRow, getAll } = require('../database/database');

const router = express.Router();

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhoneNumber(phone) {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Check if it's exactly 10 digits
  return digits.length === 10;
}

function validateRequiredFields(data, requiredFields) {
  const missingFields = [];
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  });
  return missingFields;
}

// Generate unique doctor ID
function generateDoctorId() {
  return `DOC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
}

// POST /api/doctors - Add new doctor
router.post('/', async (req, res) => {
  console.log('🔵 [DOCTORS API] POST /api/doctors - Creating new doctor');
  console.log('📥 [DOCTORS API] Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const {
      name,
      specialization,
      contactNumber,
      email,
      qualification,
      experienceYears,
      availability
    } = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'specialization', 'contactNumber'];
    const missingFields = validateRequiredFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      console.log('❌ [DOCTORS API] Missing required fields:', missingFields);
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields: missingFields,
        message: `Required fields missing: ${missingFields.join(', ')}`
      });
    }
    
    // Validate contact number (10 digits)
    if (!validatePhoneNumber(contactNumber)) {
      console.log('❌ [DOCTORS API] Invalid contact number:', contactNumber);
      return res.status(400).json({
        error: 'Invalid contact number',
        message: 'Contact number must be exactly 10 digits'
      });
    }
    
    // Validate email format if provided
    if (email && !validateEmail(email)) {
      console.log('❌ [DOCTORS API] Invalid email format:', email);
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }
    
    // Check if email already exists
    if (email) {
      const existingEmail = await getRow('SELECT id FROM doctors WHERE email = ?', [email]);
      if (existingEmail) {
        console.log('❌ [DOCTORS API] Email already exists:', email);
        return res.status(400).json({
          error: 'Email already registered',
          message: 'This email address is already registered with another doctor'
        });
      }
    }
    
    // Check if contact number already exists
    const existingPhone = await getRow('SELECT id FROM doctors WHERE phone = ?', [contactNumber]);
    if (existingPhone) {
      console.log('❌ [DOCTORS API] Contact number already exists:', contactNumber);
      return res.status(400).json({
        error: 'Contact number already registered',
        message: 'This contact number is already registered with another doctor'
      });
    }
    
    // Generate doctor ID
    const doctorId = generateDoctorId();
    console.log('✅ [DOCTORS API] Generated doctor ID:', doctorId);
    
    // Insert new doctor
    const insertQuery = `
      INSERT INTO doctors (
        doctorId, name, specialization, phone, email, 
        qualification, experienceYears, availability, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      doctorId,
      name.trim(),
      specialization.trim(),
      contactNumber,
      email ? email.trim() : null,
      qualification ? qualification.trim() : null,
      experienceYears ? parseInt(experienceYears) : null,
      availability ? availability.trim() : 'Mon-Fri 9AM-5PM',
      1 // isActive
    ];
    
    console.log('💾 [DOCTORS API] Inserting doctor with params:', insertParams);
    const result = await runQuery(insertQuery, insertParams);
    console.log('✅ [DOCTORS API] Doctor inserted successfully, ID:', result.id);
    
    // Get the created doctor
    const newDoctor = await getRow('SELECT * FROM doctors WHERE id = ?', [result.id]);
    console.log('✅ [DOCTORS API] Created doctor:', newDoctor);
    
    res.status(201).json({
      message: 'Doctor created successfully',
      doctor: newDoctor
    });
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error creating doctor:', error);
    res.status(500).json({
      error: 'Failed to create doctor',
      message: 'An internal server error occurred'
    });
  }
});

// GET /api/doctors - List all doctors with search and pagination
router.get('/', async (req, res) => {
  console.log('🔵 [DOCTORS API] GET /api/doctors - Listing doctors');
  console.log('📥 [DOCTORS API] Query params:', req.query);
  
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      specialization = '',
      isActive = 'true'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM doctors WHERE 1=1';
    let params = [];
    
    // Search by name or specialization
    if (search) {
      sql += ` AND (name LIKE ? OR specialization LIKE ? OR qualification LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Filter by specialization
    if (specialization) {
      sql += ` AND specialization = ?`;
      params.push(specialization);
    }
    
    // Filter by active status
    if (isActive !== '') {
      sql += ` AND isActive = ?`;
      params.push(isActive === 'true' ? 1 : 0);
    }
    
    sql += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    console.log('🔍 [DOCTORS API] Executing query:', sql);
    console.log('📝 [DOCTORS API] Query params:', params);
    
    const doctors = await getAll(sql, params);
    console.log('✅ [DOCTORS API] Found doctors:', doctors.length);
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM doctors WHERE 1=1';
    let countParams = [];
    
    if (search) {
      countSql += ` AND (name LIKE ? OR specialization LIKE ? OR qualification LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (specialization) {
      countSql += ` AND specialization = ?`;
      countParams.push(specialization);
    }
    
    if (isActive !== '') {
      countSql += ` AND isActive = ?`;
      countParams.push(isActive === 'true' ? 1 : 0);
    }
    
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;
    
    res.json({
      doctors,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error fetching doctors:', error);
    res.status(500).json({
      error: 'Failed to fetch doctors',
      message: 'An internal server error occurred'
    });
  }
});

// GET /api/doctors/:id - Get details of a specific doctor
router.get('/:id', async (req, res) => {
  console.log('🔵 [DOCTORS API] GET /api/doctors/:id - Getting doctor details');
  console.log('📥 [DOCTORS API] Doctor ID:', req.params.id);
  
  try {
    const { id } = req.params;
    
    const doctor = await getRow(
      'SELECT * FROM doctors WHERE id = ? OR doctorId = ?',
      [id, id]
    );
    
    if (!doctor) {
      console.log('❌ [DOCTORS API] Doctor not found:', id);
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'The requested doctor does not exist'
      });
    }
    
    console.log('✅ [DOCTORS API] Doctor found:', doctor.name);
    res.json(doctor);
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error fetching doctor:', error);
    res.status(500).json({
      error: 'Failed to fetch doctor',
      message: 'An internal server error occurred'
    });
  }
});

// PUT /api/doctors/:id - Update doctor details
router.put('/:id', async (req, res) => {
  console.log('🔵 [DOCTORS API] PUT /api/doctors/:id - Updating doctor');
  console.log('📥 [DOCTORS API] Doctor ID:', req.params.id);
  console.log('📥 [DOCTORS API] Update data:', JSON.stringify(req.body, null, 2));
  
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if doctor exists
    const existingDoctor = await getRow(
      'SELECT * FROM doctors WHERE id = ? OR doctorId = ?',
      [id, id]
    );
    
    if (!existingDoctor) {
      console.log('❌ [DOCTORS API] Doctor not found:', id);
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'The requested doctor does not exist'
      });
    }
    
    // Validate contact number if being updated
    if (updateData.contactNumber) {
      if (!validatePhoneNumber(updateData.contactNumber)) {
        console.log('❌ [DOCTORS API] Invalid contact number:', updateData.contactNumber);
        return res.status(400).json({
          error: 'Invalid contact number',
          message: 'Contact number must be exactly 10 digits'
        });
      }
      
      // Check if contact number is already used by another doctor
      const phoneConflict = await getRow(
        'SELECT id FROM doctors WHERE phone = ? AND id != ?',
        [updateData.contactNumber, existingDoctor.id]
      );
      if (phoneConflict) {
        console.log('❌ [DOCTORS API] Contact number already exists:', updateData.contactNumber);
        return res.status(400).json({
          error: 'Contact number already registered',
          message: 'This contact number is already registered with another doctor'
        });
      }
    }
    
    // Validate email if being updated
    if (updateData.email) {
      if (!validateEmail(updateData.email)) {
        console.log('❌ [DOCTORS API] Invalid email format:', updateData.email);
        return res.status(400).json({
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        });
      }
      
      // Check if email is already used by another doctor
      const emailConflict = await getRow(
        'SELECT id FROM doctors WHERE email = ? AND id != ?',
        [updateData.email, existingDoctor.id]
      );
      if (emailConflict) {
        console.log('❌ [DOCTORS API] Email already exists:', updateData.email);
        return res.status(400).json({
          error: 'Email already registered',
          message: 'This email address is already registered with another doctor'
        });
      }
    }
    
    // Prepare update fields
    const fields = [];
    const values = [];
    
    // Map frontend field names to database field names
    const fieldMapping = {
      name: 'name',
      specialization: 'specialization',
      contactNumber: 'phone',
      email: 'email',
      qualification: 'qualification',
      experienceYears: 'experienceYears',
      availability: 'availability'
    };
    
    Object.keys(updateData).forEach(key => {
      if (fieldMapping[key] && updateData[key] !== undefined && updateData[key] !== null) {
        const dbField = fieldMapping[key];
        fields.push(`${dbField} = ?`);
        
        // Handle special cases
        if (key === 'experienceYears') {
          values.push(parseInt(updateData[key]) || null);
        } else if (typeof updateData[key] === 'string') {
          values.push(updateData[key].trim());
        } else {
          values.push(updateData[key]);
        }
      }
    });
    
    if (fields.length === 0) {
      console.log('❌ [DOCTORS API] No valid fields to update');
      return res.status(400).json({
        error: 'No valid fields to update',
        message: 'Please provide valid fields to update'
      });
    }
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(existingDoctor.id);
    
    const sql = `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`;
    console.log('💾 [DOCTORS API] Update query:', sql);
    console.log('📝 [DOCTORS API] Update params:', values);
    
    await runQuery(sql, values);
    console.log('✅ [DOCTORS API] Doctor updated successfully');
    
    // Get updated doctor
    const updatedDoctor = await getRow('SELECT * FROM doctors WHERE id = ?', [existingDoctor.id]);
    console.log('✅ [DOCTORS API] Updated doctor:', updatedDoctor.name);
    
    res.json({
      message: 'Doctor updated successfully',
      doctor: updatedDoctor
    });
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error updating doctor:', error);
    res.status(500).json({
      error: 'Failed to update doctor',
      message: 'An internal server error occurred'
    });
  }
});

// DELETE /api/doctors/:id - Delete doctor (soft delete)
router.delete('/:id', async (req, res) => {
  console.log('🔵 [DOCTORS API] DELETE /api/doctors/:id - Deleting doctor');
  console.log('📥 [DOCTORS API] Doctor ID:', req.params.id);
  
  try {
    const { id } = req.params;
    
    // Check if doctor exists
    const existingDoctor = await getRow(
      'SELECT * FROM doctors WHERE id = ? OR doctorId = ?',
      [id, id]
    );
    
    if (!existingDoctor) {
      console.log('❌ [DOCTORS API] Doctor not found:', id);
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'The requested doctor does not exist'
      });
    }
    
    // Check if doctor has active prescriptions
    const activePrescriptions = await getRow(
      'SELECT COUNT(*) as count FROM prescriptions WHERE doctorId = ? AND status = "active"',
      [existingDoctor.id]
    );
    
    if (activePrescriptions.count > 0) {
      console.log('❌ [DOCTORS API] Doctor has active prescriptions:', activePrescriptions.count);
      return res.status(400).json({
        error: 'Cannot delete doctor with active prescriptions',
        message: `Doctor has ${activePrescriptions.count} active prescriptions. Please complete or cancel them first.`
      });
    }
    
    // Check if doctor has scheduled appointments
    const scheduledAppointments = await getRow(
      'SELECT COUNT(*) as count FROM appointments WHERE doctorId = ? AND status IN ("scheduled", "confirmed")',
      [existingDoctor.id]
    );
    
    if (scheduledAppointments.count > 0) {
      console.log('❌ [DOCTORS API] Doctor has scheduled appointments:', scheduledAppointments.count);
      return res.status(400).json({
        error: 'Cannot delete doctor with scheduled appointments',
        message: `Doctor has ${scheduledAppointments.count} scheduled appointments. Please reschedule or cancel them first.`
      });
    }
    
    // Soft delete by updating isActive
    await runQuery(
      'UPDATE doctors SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [existingDoctor.id]
    );
    
    console.log('✅ [DOCTORS API] Doctor deleted successfully:', existingDoctor.name);
    res.json({
      message: 'Doctor deleted successfully',
      doctor: {
        id: existingDoctor.id,
        name: existingDoctor.name,
        isActive: false
      }
    });
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error deleting doctor:', error);
    res.status(500).json({
      error: 'Failed to delete doctor',
      message: 'An internal server error occurred'
    });
  }
});

// GET /api/doctors/specializations - Get all specializations
router.get('/specializations/list', async (req, res) => {
  console.log('🔵 [DOCTORS API] GET /api/doctors/specializations - Getting specializations list');
  
  try {
    const specializations = await getAll(`
      SELECT DISTINCT specialization, COUNT(*) as doctorCount
      FROM doctors 
      WHERE isActive = 1 AND specialization IS NOT NULL
      GROUP BY specialization
      ORDER BY specialization ASC
    `);
    
    console.log('✅ [DOCTORS API] Found specializations:', specializations.length);
    res.json({
      specializations: specializations.map(s => ({
        name: s.specialization,
        count: s.doctorCount
      }))
    });
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error fetching specializations:', error);
    res.status(500).json({
      error: 'Failed to fetch specializations',
      message: 'An internal server error occurred'
    });
  }
});

// GET /api/doctors/stats/overview - Get doctor statistics
router.get('/stats/overview', async (req, res) => {
  console.log('🔵 [DOCTORS API] GET /api/doctors/stats/overview - Getting statistics');
  
  try {
    const totalDoctors = await getRow('SELECT COUNT(*) as count FROM doctors');
    const activeDoctors = await getRow('SELECT COUNT(*) as count FROM doctors WHERE isActive = 1');
    const totalSpecializations = await getRow('SELECT COUNT(DISTINCT specialization) as count FROM doctors WHERE isActive = 1');
    
    // Get specialization breakdown
    const specializationBreakdown = await getAll(`
      SELECT 
        specialization,
        COUNT(*) as doctorCount
      FROM doctors 
      WHERE isActive = 1 AND specialization IS NOT NULL
      GROUP BY specialization
      ORDER BY doctorCount DESC
      LIMIT 10
    `);
    
    console.log('✅ [DOCTORS API] Statistics retrieved successfully');
    res.json({
      total: totalDoctors.count,
      active: activeDoctors.count,
      totalSpecializations: totalSpecializations.count,
      specializationBreakdown
    });
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error fetching statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'An internal server error occurred'
    });
  }
});

module.exports = router;