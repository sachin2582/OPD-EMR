const express = require('express');
const { runQuery, getRow, getAll } = require('../database/database');

const router = express.Router();

// Generate unique doctor ID
function generateDoctorId() {
  return `DOC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
}

// GET all doctors
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', department = '', isActive = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM doctors WHERE 1=1';
    let params = [];
    
    if (search) {
      sql += ` AND (name LIKE ? OR specialization LIKE ? OR license LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (department) {
      sql += ` AND department = ?`;
      params.push(department);
    }
    
    if (isActive !== '') {
      sql += ` AND isActive = ?`;
      params.push(isActive === 'true' ? 1 : 0);
    }
    
    sql += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const doctors = await getAll(sql, params);
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM doctors WHERE 1=1';
    let countParams = [];
    
    if (search) {
      countSql += ` AND (name LIKE ? OR specialization LIKE ? OR license LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (department) {
      countSql += ` AND department = ?`;
      countParams.push(department);
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
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await getRow(
      'SELECT * FROM doctors WHERE id = ? OR doctorId = ?',
      [id, id]
    );
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// POST create new doctor
router.post('/', async (req, res) => {
  try {
    const {
      name,
      specialization,
      license,
      phone,
      email,
      department
    } = req.body;
    
    // Validation
    if (!name || !specialization || !license) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, specialization, license' 
      });
    }
    
    // Check if license already exists
    const existingDoctor = await getRow('SELECT id FROM doctors WHERE license = ?', [license]);
    if (existingDoctor) {
      return res.status(400).json({ error: 'License number already registered' });
    }
    
    const doctorId = generateDoctorId();
    
    const result = await runQuery(`
      INSERT INTO doctors (doctorId, name, specialization, license, phone, email, department)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [doctorId, name, specialization, license, phone, email, department]);
    
    // Get the created doctor
    const newDoctor = await getRow('SELECT * FROM doctors WHERE id = ?', [result.id]);
    
    res.status(201).json({
      message: 'Doctor created successfully',
      doctor: newDoctor
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

// PUT update doctor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if doctor exists
    const existingDoctor = await getRow('SELECT id FROM doctors WHERE id = ? OR doctorId = ?', [id, id]);
    if (!existingDoctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Check if license is being changed and if it conflicts with another doctor
    if (updateData.license && updateData.license !== existingDoctor.license) {
      const licenseConflict = await getRow('SELECT id FROM doctors WHERE license = ? AND id != ?', [updateData.license, existingDoctor.id]);
      if (licenseConflict) {
        return res.status(400).json({ error: 'License number already registered with another doctor' });
      }
    }
    
    // Prepare update fields
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'doctorId' && key !== 'createdAt') {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(existingDoctor.id);
    
    const sql = `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`;
    await runQuery(sql, values);
    
    // Get updated doctor
    const updatedDoctor = await getRow('SELECT * FROM doctors WHERE id = ?', [existingDoctor.id]);
    
    res.json({
      message: 'Doctor updated successfully',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// DELETE doctor (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if doctor exists
    const existingDoctor = await getRow('SELECT id FROM doctors WHERE id = ? OR doctorId = ?', [id, id]);
    if (!existingDoctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Check if doctor has active prescriptions
    const activePrescriptions = await getRow(
      'SELECT COUNT(*) as count FROM prescriptions WHERE doctorId = ? AND status = "active"',
      [existingDoctor.id]
    );
    
    if (activePrescriptions.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete doctor with active prescriptions' 
      });
    }
    
    // Soft delete by updating isActive
    await runQuery(
      'UPDATE doctors SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [existingDoctor.id]
    );
    
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

// GET doctor's daily patients
router.get('/:id/daily-patients', async (req, res) => {
  try {
    const { id } = req.params;
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    // Check if doctor exists
    const doctor = await getRow('SELECT id FROM doctors WHERE id = ? OR doctorId = ?', [id, id]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Get patients with appointments or prescriptions for the specified date
    const dailyPatients = await getAll(`
      SELECT DISTINCT
        pat.id,
        pat.patientId as patientUniqueId,
        pat.firstName,
        pat.middleName,
        pat.lastName,
        pat.age,
        pat.gender,
        pat.phone,
        pat.bloodGroup,
        pat.vitalSigns,
        pat.chiefComplaint,
        COALESCE(apt.status, 'no-appointment') as appointmentStatus,
        COALESCE(apt.appointmentTime, '') as appointmentTime,
        COALESCE(apt.type, '') as appointmentType,
        COALESCE(pres.status, 'no-prescription') as prescriptionStatus,
        COALESCE(pres.prescriptionId, '') as prescriptionId,
        COALESCE(pres.diagnosis, '') as diagnosis
      FROM patients pat
      LEFT JOIN appointments apt ON pat.id = apt.patientId AND DATE(apt.appointmentDate) = DATE(?) AND apt.doctorId = ?
      LEFT JOIN prescriptions pres ON pat.id = pres.patientId AND DATE(pres.date) = DATE(?) AND pres.doctorId = ?
      WHERE (apt.id IS NOT NULL OR pres.id IS NOT NULL)
      ORDER BY COALESCE(apt.appointmentTime, '00:00') ASC, pat.firstName ASC
    `, [date, doctor.id, date, doctor.id]);
    
    // Parse JSON fields
    dailyPatients.forEach(patient => {
      try {
        if (patient.vitalSigns) {
          patient.vitalSigns = JSON.parse(patient.vitalSigns);
        }
      } catch (e) {
        console.warn('Error parsing vital signs JSON:', e);
      }
    });
    
    res.json({
      date,
      doctorId: doctor.id,
      patients: dailyPatients,
      totalPatients: dailyPatients.length
    });
  } catch (error) {
    console.error('Error fetching daily patients:', error);
    res.status(500).json({ error: 'Failed to fetch daily patients' });
  }
});

// GET doctor's patient statistics
router.get('/:id/patient-stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'month' } = req.query;
    
    // Check if doctor exists
    const doctor = await getRow('SELECT id FROM doctors WHERE id = ? OR doctorId = ?', [id, id]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = 'AND DATE(createdAt) >= DATE("now", "-7 days")';
    } else if (period === 'month') {
      dateFilter = 'AND DATE(createdAt) >= DATE("now", "-30 days")';
    } else if (period === 'year') {
      dateFilter = 'AND DATE(createdAt) >= DATE("now", "-365 days")';
    }
    
    // Get prescription statistics
    const prescriptionStats = await getRow(`
      SELECT 
        COUNT(*) as totalPrescriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as activePrescriptions,
        COUNT(CASE WHEN DATE(date) = DATE('now') THEN 1 END) as todayPrescriptions
      FROM prescriptions 
      WHERE doctorId = ? ${dateFilter}
    `, [doctor.id]);
    
    // Get patient statistics
    const patientStats = await getRow(`
      SELECT 
        COUNT(DISTINCT patientId) as uniquePatients,
        COUNT(CASE WHEN DATE(createdAt) = DATE('now') THEN 1 END) as newPatientsToday
      FROM prescriptions 
      WHERE doctorId = ? ${dateFilter}
    `, [doctor.id]);
    
    // Get appointment statistics
    const appointmentStats = await getRow(`
      SELECT 
        COUNT(*) as totalAppointments,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduledAppointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedAppointments,
        COUNT(CASE WHEN DATE(appointmentDate) = DATE('now') THEN 1 END) as todayAppointments
      FROM appointments 
      WHERE doctorId = ? ${dateFilter}
    `, [doctor.id]);
    
    res.json({
      doctorId: doctor.id,
      period,
      prescriptionStats,
      patientStats,
      appointmentStats
    });
  } catch (error) {
    console.error('Error fetching doctor patient statistics:', error);
    res.status(500).json({ error: 'Failed to fetch doctor patient statistics' });
  }
});

// GET doctor's recent activity
router.get('/:id/recent-activity', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    // Check if doctor exists
    const doctor = await getRow('SELECT id FROM doctors WHERE id = ? OR doctorId = ?', [id, id]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Get recent prescriptions
    const recentPrescriptions = await getAll(`
      SELECT 
        'prescription' as type,
        p.prescriptionId as id,
        p.date,
        p.diagnosis,
        p.status,
        pat.firstName as patientFirstName,
        pat.lastName as patientLastName,
        pat.patientId as patientUniqueId
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      WHERE p.doctorId = ?
      ORDER BY p.createdAt DESC
      LIMIT ?
    `, [doctor.id, parseInt(limit)]);
    
    // Get recent appointments
    const recentAppointments = await getAll(`
      SELECT 
        'appointment' as type,
        apt.appointmentId as id,
        apt.appointmentDate as date,
        apt.status,
        apt.type as appointmentType,
        pat.firstName as patientFirstName,
        pat.lastName as patientLastName,
        pat.patientId as patientUniqueId
      FROM appointments apt
      JOIN patients pat ON apt.patientId = pat.id
      WHERE apt.doctorId = ?
      ORDER BY apt.createdAt DESC
      LIMIT ?
    `, [doctor.id, parseInt(limit)]);
    
    // Combine and sort by date
    const allActivities = [...recentPrescriptions, ...recentAppointments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, parseInt(limit));
    
    res.json({
      doctorId: doctor.id,
      activities: allActivities
    });
  } catch (error) {
    console.error('Error fetching doctor recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch doctor recent activity' });
  }
});

// GET doctor statistics overview
router.get('/stats/overview', async (req, res) => {
  try {
    const totalDoctors = await getRow('SELECT COUNT(*) as count FROM doctors');
    const activeDoctors = await getRow('SELECT COUNT(*) as count FROM doctors WHERE isActive = 1');
    const totalDepartments = await getRow('SELECT COUNT(DISTINCT department) as count FROM doctors WHERE department IS NOT NULL');
    
    // Get department breakdown
    const departmentBreakdown = await getAll(`
      SELECT 
        department,
        COUNT(*) as doctorCount
      FROM doctors 
      WHERE department IS NOT NULL AND isActive = 1
      GROUP BY department
      ORDER BY doctorCount DESC
    `);
    
    // Get specialization breakdown
    const specializationBreakdown = await getAll(`
      SELECT 
        specialization,
        COUNT(*) as doctorCount
      FROM doctors 
      WHERE isActive = 1
      GROUP BY specialization
      ORDER BY doctorCount DESC
      LIMIT 10
    `);
    
    res.json({
      total: totalDoctors.count,
      active: activeDoctors.count,
      totalDepartments: totalDepartments.count,
      departmentBreakdown,
      specializationBreakdown
    });
  } catch (error) {
    console.error('Error fetching doctor statistics:', error);
    res.status(500).json({ error: 'Failed to fetch doctor statistics' });
  }
});

module.exports = router;
