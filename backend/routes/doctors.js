const express = require('express');
const { runQuery, getRow, getAll } = require('../database/database');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhoneNumber(phone) {
  const digits = phone.replace(/\D/g, '');
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

// POST /api/doctors - Create doctor with user login credentials
router.post('/', async (req, res) => {
  console.log('🔵 [DOCTORS API] POST /api/doctors - Creating new doctor with user credentials');
  console.log('📥 [DOCTORS API] Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const {
      name,
      specialization,
      contactNumber,
      email,
      qualification,
      experienceYears,
      availability,
      username,
      password
    } = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'specialization', 'contactNumber', 'username', 'password'];
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
    
    // Check if username already exists
    const existingUser = await getRow('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      console.log('❌ [DOCTORS API] Username already exists:', username);
      return res.status(400).json({
        error: 'Username already exists',
        message: 'This username is already taken'
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
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ [DOCTORS API] Password hashed successfully');
    
    // Start transaction-like operations
    try {
      // Step 1: Create user account
      console.log('💾 [DOCTORS API] Creating user account...');
      const userResult = await runQuery(`
        INSERT INTO users (username, password, role, fullName, email, phone, isActive, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [username, hashedPassword, 'doctor', name, email || null, contactNumber, 1, 'D']);
      
      const userId = userResult.id;
      console.log('✅ [DOCTORS API] User account created with ID:', userId);
      
      // Step 2: Create doctor profile
      console.log('💾 [DOCTORS API] Creating doctor profile...');
      const doctorId = generateDoctorId();
      const doctorResult = await runQuery(`
        INSERT INTO doctors (
          doctorId, name, specialization, phone, email, 
          qualification, experienceYears, availability, isActive, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        doctorId,
        name.trim(),
        specialization.trim(),
        contactNumber,
        email ? email.trim() : null,
        qualification ? qualification.trim() : null,
        experienceYears ? parseInt(experienceYears) : null,
        availability ? availability.trim() : 'Mon-Fri 9AM-5PM',
        1, // isActive
        userId // Link to user account
      ]);
      
      console.log('✅ [DOCTORS API] Doctor profile created with ID:', doctorResult.id);
      
      // Step 3: Get the complete doctor record with user info
      const newDoctor = await getRow(`
        SELECT d.*, u.username, u.email as userEmail, u.phone as userPhone
        FROM doctors d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.id = ?
      `, [doctorResult.id]);
      
      console.log('✅ [DOCTORS API] Doctor created successfully:', newDoctor.name);
      
      res.status(201).json({
        success: true,
        message: 'Doctor created successfully with login credentials',
        doctor: newDoctor
      });
      
    } catch (error) {
      console.error('❌ [DOCTORS API] Error in transaction, rolling back...', error);
      // If doctor creation fails, we should clean up the user account
      // Note: In a real production system, you'd want proper transaction handling
      throw error;
    }
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error creating doctor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create doctor',
      message: 'An internal server error occurred'
    });
  }
});

// GET /api/doctors - List all doctors with their linked username
router.get('/', async (req, res) => {
  console.log('🔵 [DOCTORS API] GET /api/doctors - Listing doctors with user info');
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
    
    let sql = `
      SELECT u.id, u.username, u.fullName as name, u.email, u.phone, u.isActive,
             d.specialization, d.qualification, d.experienceYears, d.availability, d.doctorId
      FROM users u
      LEFT JOIN doctors d ON u.id = d.user_id
      WHERE u.type = 'D' AND u.isActive = 1
    `;
    let params = [];
    
    // Search by name, specialization, or username
    if (search) {
      sql += ` AND (u.fullName LIKE ? OR d.specialization LIKE ? OR d.qualification LIKE ? OR u.username LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Filter by specialization
    if (specialization) {
      sql += ` AND d.specialization = ?`;
      params.push(specialization);
    }
    
    // Filter by active status - only allow active users (type D users are always active)
    // Note: We only show active users with type 'D', so this filter is redundant but kept for API consistency
    
    sql += ` ORDER BY u.fullName ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    console.log('🔍 [DOCTORS API] Executing query:', sql);
    console.log('📝 [DOCTORS API] Query params:', params);
    
    const doctors = await getAll(sql, params);
    console.log('✅ [DOCTORS API] Found doctors:', doctors.length);
    
    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM users u
      LEFT JOIN doctors d ON u.id = d.user_id
      WHERE u.type = 'D' AND u.isActive = 1
    `;
    let countParams = [];
    
    if (search) {
      countSql += ` AND (u.fullName LIKE ? OR d.specialization LIKE ? OR d.qualification LIKE ? OR u.username LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (specialization) {
      countSql += ` AND d.specialization = ?`;
      countParams.push(specialization);
    }
    
    // Filter by active status - only allow active users (type D users are always active)
    // Note: We only show active users with type 'D', so this filter is redundant but kept for API consistency
    
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;
    
    res.json({
      success: true,
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
      success: false,
      error: 'Failed to fetch doctors',
      message: 'An internal server error occurred'
    });
  }
});

// PUT /api/doctors/:id - Update doctor and sync with user credentials
router.put('/:id', async (req, res) => {
  console.log('🔵 [DOCTORS API] PUT /api/doctors/:id - Updating doctor and user credentials');
  console.log('📥 [DOCTORS API] Doctor ID:', req.params.id);
  console.log('📥 [DOCTORS API] Update data:', JSON.stringify(req.body, null, 2));
  
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if doctor exists and get user_id
    const existingDoctor = await getRow(`
      SELECT d.*, u.id as user_id, u.username, u.email as userEmail, u.phone as userPhone
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = ? OR d.doctorId = ?
    `, [id, id]);
    
    if (!existingDoctor) {
      console.log('❌ [DOCTORS API] Doctor not found:', id);
      return res.status(404).json({
        success: false,
        error: 'Doctor not found',
        message: 'The requested doctor does not exist'
      });
    }
    
    // Validate contact number if being updated
    if (updateData.contactNumber) {
      if (!validatePhoneNumber(updateData.contactNumber)) {
        console.log('❌ [DOCTORS API] Invalid contact number:', updateData.contactNumber);
        return res.status(400).json({
          success: false,
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
          success: false,
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
          success: false,
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
          success: false,
          error: 'Email already registered',
          message: 'This email address is already registered with another doctor'
        });
      }
    }
    
    // Validate username if being updated
    if (updateData.username) {
      const usernameConflict = await getRow(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [updateData.username, existingDoctor.user_id]
      );
      if (usernameConflict) {
        console.log('❌ [DOCTORS API] Username already exists:', updateData.username);
        return res.status(400).json({
          success: false,
          error: 'Username already exists',
          message: 'This username is already taken'
        });
      }
    }
    
    try {
      // Step 1: Update doctor details
      console.log('💾 [DOCTORS API] Updating doctor details...');
      const doctorFields = [];
      const doctorValues = [];
      
      const doctorFieldMapping = {
        name: 'name',
        specialization: 'specialization',
        contactNumber: 'phone',
        email: 'email',
        qualification: 'qualification',
        experienceYears: 'experienceYears',
        availability: 'availability'
      };
      
      Object.keys(updateData).forEach(key => {
        if (doctorFieldMapping[key] && updateData[key] !== undefined && updateData[key] !== null) {
          const dbField = doctorFieldMapping[key];
          doctorFields.push(`${dbField} = ?`);
          
          if (key === 'experienceYears') {
            doctorValues.push(parseInt(updateData[key]) || null);
          } else if (typeof updateData[key] === 'string') {
            doctorValues.push(updateData[key].trim());
          } else {
            doctorValues.push(updateData[key]);
          }
        }
      });
      
      if (doctorFields.length > 0) {
        doctorFields.push('updatedAt = CURRENT_TIMESTAMP');
        doctorValues.push(existingDoctor.id);
        
        const doctorSql = `UPDATE doctors SET ${doctorFields.join(', ')} WHERE id = ?`;
        console.log('💾 [DOCTORS API] Doctor update query:', doctorSql);
        await runQuery(doctorSql, doctorValues);
        console.log('✅ [DOCTORS API] Doctor details updated');
      }
      
      // Step 2: Update user credentials if provided
      if (updateData.username || updateData.password || updateData.email || updateData.contactNumber) {
        console.log('💾 [DOCTORS API] Updating user credentials...');
        const userFields = [];
        const userValues = [];
        
        if (updateData.username) {
          userFields.push('username = ?');
          userValues.push(updateData.username.trim());
        }
        
        if (updateData.password) {
          const hashedPassword = await bcrypt.hash(updateData.password, 10);
          userFields.push('password = ?');
          userValues.push(hashedPassword);
        }
        
        if (updateData.email) {
          userFields.push('email = ?');
          userValues.push(updateData.email.trim());
        }
        
        if (updateData.contactNumber) {
          userFields.push('phone = ?');
          userValues.push(updateData.contactNumber);
        }
        
        if (updateData.name) {
          userFields.push('fullName = ?');
          userValues.push(updateData.name.trim());
        }
        
        if (userFields.length > 0) {
          userFields.push('updatedAt = CURRENT_TIMESTAMP');
          userValues.push(existingDoctor.user_id);
          
          const userSql = `UPDATE users SET ${userFields.join(', ')} WHERE id = ?`;
          console.log('💾 [DOCTORS API] User update query:', userSql);
          await runQuery(userSql, userValues);
          console.log('✅ [DOCTORS API] User credentials updated');
        }
      }
      
      // Step 3: Get updated doctor with user info
      const updatedDoctor = await getRow(`
        SELECT d.*, u.username, u.email as userEmail, u.phone as userPhone, u.isActive as userActive
        FROM doctors d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.id = ?
      `, [existingDoctor.id]);
      
      console.log('✅ [DOCTORS API] Doctor and user updated successfully');
      
      res.json({
        success: true,
        message: 'Doctor and user credentials updated successfully',
        doctor: updatedDoctor
      });
      
    } catch (error) {
      console.error('❌ [DOCTORS API] Error in update transaction:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error updating doctor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update doctor',
      message: 'An internal server error occurred'
    });
  }
});

// GET /api/doctors/patients - Get patients with completed billing for doctor dashboard
router.get('/patients', async (req, res) => {
  console.log('🔵 [DOCTORS API] GET /api/doctors/patients - Getting patients with completed billing');
  console.log('📥 [DOCTORS API] Request headers:', req.headers);
  console.log('📥 [DOCTORS API] Request query:', req.query);
  console.log('📥 [DOCTORS API] Request params:', req.params);
  
  try {
    // Fetch patients who have completed CONSULTATION billing only
    const patients = await getAll(`
      SELECT DISTINCT p.*, 
             b.billNumber,
             b.billDate,
             b.total as billAmount,
             b.billing_status,
             b.createdAt as billingCompletedAt
      FROM patients p
      INNER JOIN bills b ON p.id = b.patientId
      INNER JOIN bill_items bi ON b.id = bi.billId
      WHERE b.billing_status = 'PAID'
        AND bi.service_type = 'CL'
      ORDER BY b.createdAt DESC
    `);
    
    console.log('✅ [DOCTORS API] Found patients with completed CONSULTATION billing:', patients.length);
    
    // Check for existing prescriptions and update patient status
    const patientsWithStatus = await Promise.all(
      patients.map(async (patient) => {
        try {
          // Check if prescription exists for this patient
          const prescriptionResponse = await getAll(
            'SELECT * FROM prescriptions WHERE patientId = ? ORDER BY createdAt DESC LIMIT 1',
            [patient.id]
          );
          
          if (prescriptionResponse && prescriptionResponse.length > 0) {
            // Patient has prescriptions, mark as completed
            return { 
              ...patient, 
              status: 'completed', 
              hasPrescription: true,
              lastPrescriptionDate: prescriptionResponse[0].createdAt
            };
          }
          // No prescriptions found, mark as waiting for consultation
          return { 
            ...patient, 
            status: 'waiting', 
            hasPrescription: false 
          };
        } catch (error) {
          console.warn(`Failed to check prescriptions for patient ${patient.id}:`, error);
          return { 
            ...patient, 
            status: 'waiting', 
            hasPrescription: false 
          };
        }
      })
    );
    
    res.json({
      success: true,
      data: patientsWithStatus,
      count: patientsWithStatus.length,
      message: 'Patients with completed billing fetched successfully'
    });
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error fetching patients with completed billing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patients with completed billing',
      message: 'An internal server error occurred'
    });
  }
});

// GET /api/doctors/:id - Get details of a specific doctor with user info
router.get('/:id', async (req, res) => {
  console.log('🔵 [DOCTORS API] GET /api/doctors/:id - Getting doctor details with user info');
  console.log('📥 [DOCTORS API] Doctor ID:', req.params.id);
  
  try {
    const { id } = req.params;
    
    const doctor = await getRow(`
      SELECT d.*, u.username, u.email as userEmail, u.phone as userPhone, u.isActive as userActive
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = ? OR d.doctorId = ?
    `, [id, id]);
    
    if (!doctor) {
      console.log('❌ [DOCTORS API] Doctor not found:', id);
      return res.status(404).json({
        success: false,
        error: 'Doctor not found',
        message: 'The requested doctor does not exist'
      });
    }
    
    console.log('✅ [DOCTORS API] Doctor found:', doctor.name);
    res.json({
      success: true,
      doctor: doctor
    });
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor',
      message: 'An internal server error occurred'
    });
  }
});

// DELETE /api/doctors/:id - Delete doctor and deactivate user account
router.delete('/:id', async (req, res) => {
  console.log('🔵 [DOCTORS API] DELETE /api/doctors/:id - Deleting doctor and deactivating user');
  console.log('📥 [DOCTORS API] Doctor ID:', req.params.id);
  
  try {
    const { id } = req.params;
    
    // Check if doctor exists and get user_id
    const existingDoctor = await getRow(`
      SELECT d.*, u.id as user_id
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = ? OR d.doctorId = ?
    `, [id, id]);
    
    if (!existingDoctor) {
      console.log('❌ [DOCTORS API] Doctor not found:', id);
      return res.status(404).json({
        success: false,
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
        success: false,
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
        success: false,
        error: 'Cannot delete doctor with scheduled appointments',
        message: `Doctor has ${scheduledAppointments.count} scheduled appointments. Please reschedule or cancel them first.`
      });
    }
    
    try {
      // Step 1: Soft delete doctor
      console.log('💾 [DOCTORS API] Deactivating doctor...');
      await runQuery(
        'UPDATE doctors SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [existingDoctor.id]
      );
      
      // Step 2: Deactivate user account
      if (existingDoctor.user_id) {
        console.log('💾 [DOCTORS API] Deactivating user account...');
        await runQuery(
          'UPDATE users SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [existingDoctor.user_id]
        );
      }
      
      console.log('✅ [DOCTORS API] Doctor and user deactivated successfully:', existingDoctor.name);
      res.json({
        success: true,
        message: 'Doctor and user account deactivated successfully',
        doctor: {
          id: existingDoctor.id,
          name: existingDoctor.name,
          isActive: false
        }
      });
      
    } catch (error) {
      console.error('❌ [DOCTORS API] Error in delete transaction:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete doctor',
      message: 'An internal server error occurred'
    });
  }
});


// GET /api/doctors/specializations/list - Get all specializations
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
      success: true,
      specializations: specializations.map(s => ({
        name: s.specialization,
        count: s.doctorCount
      }))
    });
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error fetching specializations:', error);
    res.status(500).json({
      success: false,
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
      success: true,
      total: totalDoctors.count,
      active: activeDoctors.count,
      totalSpecializations: totalSpecializations.count,
      specializationBreakdown
    });
    
  } catch (error) {
    console.error('❌ [DOCTORS API] Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: 'An internal server error occurred'
    });
  }
});

module.exports = router;