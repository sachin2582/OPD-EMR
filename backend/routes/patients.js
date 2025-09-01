const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { runQuery, getRow, getAll } = require('../database/database');

const router = express.Router();

// Generate sequential patient ID starting from 1
async function generatePatientId() {
  try {
    const result = await getRow('SELECT MAX(patientId) as maxId FROM patients');
    const nextId = (result && result.maxId) ? result.maxId + 1 : 1;
    return nextId;
  } catch (error) {
    console.error('Error generating patient ID:', error);
    // Fallback: get count of patients and add 1
    const result = await getRow('SELECT COUNT(*) as count FROM patients');
    return (result && result.count) ? result.count + 1 : 1;
  }
}

// GET all patients with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM patients WHERE 1=1';
    let params = [];
    
    if (search) {
      sql += ` AND (firstName LIKE ? OR lastName LIKE ? OR patientId LIKE ? OR phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    
    sql += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const patients = await getAll(sql, params);
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM patients WHERE 1=1';
    let countParams = [];
    
    if (search) {
      countSql += ` AND (firstName LIKE ? OR lastName LIKE ? OR patientId LIKE ? OR phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      countSql += ` AND status = ?`;
      countParams.push(status);
    }
    
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;
    
    res.json({
      patients,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await getRow(
      'SELECT * FROM patients WHERE id = ? OR patientId = ?',
      [id, id]
    );
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST create new patient
router.post('/', async (req, res) => {
  console.log('🔵 [BACKEND] POST /api/patients - Request received');
  console.log('📥 [BACKEND] Request body:', JSON.stringify(req.body, null, 2));
  console.log('📥 [BACKEND] Request headers:', req.headers);
  
  try {
    const {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      age,
      gender,
      bloodGroup,
      phone,
      email,
      address,
      emergencyContact,
      emergencyPhone,
      medicalHistory,
      allergies,
      familyHistory,
      lifestyle,
      numberOfChildren,
      vitalSigns,
      chiefComplaint
    } = req.body;
    
    console.log('🔍 [BACKEND] Extracted fields:');
    console.log('  - firstName:', firstName);
    console.log('  - lastName:', lastName);
    console.log('  - dateOfBirth:', dateOfBirth);
    console.log('  - age:', age);
    console.log('  - gender:', gender);
    console.log('  - phone:', phone);
    console.log('  - address:', address);
    
    // Enhanced validation with detailed logging
    const requiredFields = { firstName, lastName, dateOfBirth, age, gender, phone, address };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      console.log('❌ [BACKEND] Validation failed - Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields: missingFields,
        message: `Required fields missing: ${missingFields.join(', ')}`
      });
    }
    
    console.log('✅ [BACKEND] All required fields present');
    
    // Check if phone number already exists
    console.log('🔍 [BACKEND] Checking for existing patient with phone:', phone);
    const existingPatient = await getRow('SELECT id, firstName, lastName FROM patients WHERE phone = ?', [phone]);
    if (existingPatient) {
      console.log('❌ [BACKEND] Phone number already exists for patient:', existingPatient);
      return res.status(400).json({ 
        error: 'Phone number already registered',
        existingPatient: { id: existingPatient.id, name: `${existingPatient.firstName} ${existingPatient.lastName}` }
      });
    }
    
    console.log('✅ [BACKEND] Phone number is unique');
    
    // Generate patient ID
    console.log('🔄 [BACKEND] Generating patient ID...');
    const patientId = await generatePatientId();
    console.log('✅ [BACKEND] Generated patient ID:', patientId);
    
    // Prepare vital signs
    const vitalSignsJson = vitalSigns ? JSON.stringify(vitalSigns) : null;
    console.log('📊 [BACKEND] Vital signs JSON:', vitalSignsJson);
    
    // Database insertion
    console.log('💾 [BACKEND] Inserting patient into database...');
    const insertQuery = `
      INSERT INTO patients (
        patientId, firstName, middleName, lastName, dateOfBirth, age, gender,
        bloodGroup, phone, email, address, emergencyContact, emergencyPhone,
        medicalHistory, allergies, familyHistory, lifestyle, numberOfChildren,
        vitalSigns, chiefComplaint
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      patientId, firstName, middleName, lastName, dateOfBirth, age, gender,
      bloodGroup, phone, email, address, emergencyContact, emergencyPhone,
      medicalHistory, allergies, familyHistory, lifestyle, numberOfChildren,
      vitalSignsJson, chiefComplaint
    ];
    
    console.log('📝 [BACKEND] SQL Query:', insertQuery);
    console.log('📝 [BACKEND] Parameters:', insertParams);
    
    const result = await runQuery(insertQuery, insertParams);
    console.log('✅ [BACKEND] Database insert successful!');
    console.log('📊 [BACKEND] Insert result:', result);
    
    // Get the created patient
    console.log('🔍 [BACKEND] Fetching created patient with ID:', result.id);
    const newPatient = await getRow('SELECT * FROM patients WHERE id = ?', [result.id]);
    
    if (!newPatient) {
      console.log('❌ [BACKEND] Failed to fetch created patient!');
      return res.status(500).json({ error: 'Patient created but could not be retrieved' });
    }
    
    console.log('✅ [BACKEND] Patient created and retrieved successfully!');
    console.log('📋 [BACKEND] Created patient:', JSON.stringify(newPatient, null, 2));
    
    const response = {
      message: 'Patient created successfully',
      patient: newPatient,
      insertedId: result.id,
      patientId: newPatient.patientId
    };
    
    console.log('📤 [BACKEND] Sending response:', JSON.stringify(response, null, 2));
    res.status(201).json(response);
    
  } catch (error) {
    console.log('❌ [BACKEND] Error creating patient:');
    console.log('❌ [BACKEND] Error message:', error.message);
    console.log('❌ [BACKEND] Error stack:', error.stack);
    console.log('❌ [BACKEND] Error code:', error.code);
    
    // Detailed error response
    const errorResponse = {
      error: 'Failed to create patient',
      details: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 [BACKEND] Sending error response:', JSON.stringify(errorResponse, null, 2));
    res.status(500).json(errorResponse);
  }
});

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if patient exists
    const existingPatient = await getRow('SELECT id FROM patients WHERE id = ? OR patientId = ?', [id, id]);
    if (!existingPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Check if phone number is being changed and if it conflicts with another patient
    if (updateData.phone && updateData.phone !== existingPatient.phone) {
      const phoneConflict = await getRow('SELECT id FROM patients WHERE phone = ? AND id != ?', [updateData.phone, existingPatient.id]);
      if (phoneConflict) {
        return res.status(400).json({ error: 'Phone number already registered with another patient' });
      }
    }
    
    // Prepare update fields
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'patientId' && key !== 'createdAt') {
        if (key === 'vitalSigns' && updateData[key]) {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(existingPatient.id);
    
    const sql = `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`;
    await runQuery(sql, values);
    
    // Get updated patient
    const updatedPatient = await getRow('SELECT * FROM patients WHERE id = ?', [existingPatient.id]);
    
    res.json({
      message: 'Patient updated successfully',
      patient: updatedPatient
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// DELETE patient (soft delete by updating status)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if patient exists
    const existingPatient = await getRow('SELECT id FROM patients WHERE id = ? OR patientId = ?', [id, id]);
    if (!existingPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Check if patient has active prescriptions or bills
    const activePrescriptions = await getRow(
      'SELECT COUNT(*) as count FROM prescriptions WHERE patientId = ? AND status = "active"',
      [existingPatient.id]
    );
    
    const pendingBills = await getRow(
      'SELECT COUNT(*) as count FROM billing WHERE patientId = ? AND paymentStatus = "pending"',
      [existingPatient.id]
    );
    
    if (activePrescriptions.count > 0 || pendingBills.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete patient with active prescriptions or pending bills' 
      });
    }
    
    // Soft delete by updating status
    await runQuery(
      'UPDATE patients SET status = "inactive", updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [existingPatient.id]
    );
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// GET patient statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalPatients = await getRow('SELECT COUNT(*) as count FROM patients');
    const activePatients = await getRow('SELECT COUNT(*) as count FROM patients WHERE status = "active" OR status IS NULL');
    const newPatientsToday = await getRow(
      'SELECT COUNT(*) as count FROM patients WHERE DATE(createdAt) = DATE("now")'
    );
    const newPatientsThisWeek = await getRow(
      'SELECT COUNT(*) as count FROM patients WHERE DATE(createdAt) >= DATE("now", "-7 days")'
    );
    const newPatientsThisMonth = await getRow(
      'SELECT COUNT(*) as count FROM patients WHERE DATE(createdAt) >= DATE("now", "-30 days")'
    );
    
    res.json({
      total: totalPatients.count,
      active: activePatients.count,
      newToday: newPatientsToday.count,
      newThisWeek: newPatientsThisWeek.count,
      newThisMonth: newPatientsThisMonth.count
    });
  } catch (error) {
    console.error('Error fetching patient statistics:', error);
    res.status(500).json({ error: 'Failed to fetch patient statistics' });
  }
});

// GET patient by phone number (for quick lookup)
router.get('/lookup/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const patient = await getRow('SELECT * FROM patients WHERE phone = ?', [phone]);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error looking up patient:', error);
    res.status(500).json({ error: 'Failed to lookup patient' });
  }
});

module.exports = router;
