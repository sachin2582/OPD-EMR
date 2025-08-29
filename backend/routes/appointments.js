const express = require('express');
const { runQuery, getRow, getAll } = require('../database/database');
const router = express.Router();

// GET all appointments with filters
router.get('/', async (req, res) => {
  try {
    const { doctorId, date, status, patientId } = req.query;
    
    let sql = `
      SELECT 
        a.id as appointmentId,
        a.appointmentId as appointmentNumber,
        a.patientId,
        a.doctorId,
        a.appointmentDate,
        a.appointmentTime,
        a.appointmentType,
        a.notes,
        a.status,
        a.priority,
        a.duration,
        a.createdAt,
        p.firstName as patientFirstName,
        p.lastName as patientLastName,
        p.phone as patientPhone,
        p.email as patientEmail,
        d.name as doctorName,
        d.specialization as doctorSpecialization
      FROM appointments a
      LEFT JOIN patients p ON a.patientId = p.id
      LEFT JOIN doctors d ON a.doctorId = d.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (doctorId) {
      sql += ' AND a.doctorId = ?';
      params.push(doctorId);
    }
    
    if (date) {
      sql += ' AND a.appointmentDate = ?';
      params.push(date);
    }
    
    if (status && status !== 'all') {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    
    if (patientId) {
      sql += ' AND a.patientId = ?';
      params.push(patientId);
    }
    
    sql += ' ORDER BY a.appointmentDate ASC, a.appointmentTime ASC';
    
    const appointments = await getAll(sql, params);
    
    res.json({
      success: true,
      appointments: appointments
    });
    
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch appointments' 
    });
  }
});

// GET appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await getRow(`
      SELECT 
        a.*,
        p.firstName as patientFirstName,
        p.lastName as patientLastName,
        p.phone as patientPhone,
        p.email as patientEmail,
        p.dateOfBirth,
        p.age,
        p.gender,
        p.address,
        d.name as doctorName,
        d.specialization as doctorSpecialization,
        d.email as doctorEmail,
        d.phone as doctorPhone
      FROM appointments a
      LEFT JOIN patients p ON a.patientId = p.id
      LEFT JOIN doctors d ON a.doctorId = d.id
      WHERE a.id = ?
    `, [id]);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Appointment not found' 
      });
    }
    
    res.json({
      success: true,
      appointment: appointment
    });
    
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch appointment' 
    });
  }
});

// POST create new appointment (with new patient if needed)
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      notes,
      status,
      priority,
      duration,
      // New patient fields (if creating new patient)
      newPatient,
      firstName,
      lastName,
      dateOfBirth,
      age,
      gender,
      phone,
      email,
      address
    } = req.body;
    
    let finalPatientId = patientId;
    
    // If new patient data is provided, create the patient first
    if (newPatient && firstName && lastName && phone) {
      try {
        // Generate unique patient ID
        const patientCount = await getRow('SELECT COUNT(*) as count FROM patients');
        const newPatientId = (patientCount.count || 0) + 1;
        
        // Insert new patient
        const patientResult = await runQuery(`
          INSERT INTO patients (
            patientId, firstName, lastName, dateOfBirth, age, 
            gender, phone, email, address, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [newPatientId, firstName, lastName, dateOfBirth, age, gender, phone, email, address]);
        
        finalPatientId = patientResult.id;
        
        console.log(`New patient created with ID: ${finalPatientId}`);
        
      } catch (patientError) {
        console.error('Error creating new patient:', patientError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create new patient' 
        });
      }
    }
    
    // Validate required fields
    if (!finalPatientId || !doctorId || !appointmentDate || !appointmentTime || !appointmentType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: patientId, doctorId, appointmentDate, appointmentTime, appointmentType' 
      });
    }
    
    // Check for appointment conflicts
    const conflictCheck = await getRow(`
      SELECT id FROM appointments 
      WHERE doctorId = ? AND appointmentDate = ? AND appointmentTime = ? AND status != 'cancelled'
    `, [doctorId, appointmentDate, appointmentTime]);
    
    if (conflictCheck) {
      return res.status(409).json({ 
        success: false, 
        error: 'Time slot already booked for this doctor' 
      });
    }
    
    // Generate unique appointment ID
    const appointmentCount = await getRow('SELECT COUNT(*) as count FROM appointments');
    const newAppointmentId = `APT-${String(appointmentCount.count + 1).padStart(6, '0')}`;
    
    // Create appointment
    const appointmentResult = await runQuery(`
      INSERT INTO appointments (
        appointmentId, patientId, doctorId, appointmentDate, appointmentTime,
        appointmentType, notes, status, priority, duration, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [newAppointmentId, finalPatientId, doctorId, appointmentDate, appointmentTime, 
         appointmentType, notes || '', status || 'scheduled', priority || 'normal', duration || '30']);
    
    // Get the created appointment with patient and doctor details
    const newAppointment = await getRow(`
      SELECT 
        a.*,
        p.firstName as patientFirstName,
        p.lastName as patientLastName,
        p.phone as patientPhone,
        d.name as doctorName,
        d.specialization as doctorSpecialization
      FROM appointments a
      LEFT JOIN patients p ON a.patientId = p.id
      LEFT JOIN doctors d ON a.doctorId = d.id
      WHERE a.id = ?
    `, [appointmentResult.id]);
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment: newAppointment
    });
    
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create appointment' 
    });
  }
});

// PUT update appointment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      appointmentDate,
      appointmentTime,
      appointmentType,
      notes,
      status,
      priority,
      duration
    } = req.body;
    
    // Check if appointment exists
    const existingAppointment = await getRow('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!existingAppointment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Appointment not found' 
      });
    }
    
    // Check for conflicts if date/time is being changed
    if ((appointmentDate && appointmentDate !== existingAppointment.appointmentDate) || 
        (appointmentTime && appointmentTime !== existingAppointment.appointmentTime)) {
      const conflictCheck = await getRow(`
        SELECT id FROM appointments 
        WHERE doctorId = ? AND appointmentDate = ? AND appointmentTime = ? 
        AND status != 'cancelled' AND id != ?
      `, [existingAppointment.doctorId, appointmentDate || existingAppointment.appointmentDate, 
           appointmentTime || existingAppointment.appointmentTime, id]);
      
      if (conflictCheck) {
        return res.status(409).json({ 
          success: false, 
          error: 'Time slot already booked for this doctor' 
        });
      }
    }
    
    // Update appointment
    await runQuery(`
      UPDATE appointments SET 
        appointmentDate = COALESCE(?, appointmentDate),
        appointmentTime = COALESCE(?, appointmentTime),
        appointmentType = COALESCE(?, appointmentType),
        notes = COALESCE(?, notes),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        duration = COALESCE(?, duration),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [appointmentDate, appointmentTime, appointmentType, notes, status, priority, duration, id]);
    
    // Get updated appointment
    const updatedAppointment = await getRow(`
      SELECT 
        a.*,
        p.firstName as patientFirstName,
        p.lastName as patientLastName,
        p.phone as patientPhone,
        d.name as doctorName,
        d.specialization as doctorSpecialization
      FROM appointments a
      LEFT JOIN patients p ON a.patientId = p.id
      LEFT JOIN doctors d ON a.doctorId = d.id
      WHERE a.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
    
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update appointment' 
    });
  }
});

// DELETE cancel appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if appointment exists
    const existingAppointment = await getRow('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!existingAppointment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Appointment not found' 
      });
    }
    
    // Soft delete by updating status to cancelled
    await runQuery(`
      UPDATE appointments SET 
        status = 'cancelled',
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
    
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to cancel appointment' 
    });
  }
});

// GET doctor's schedule
router.get('/doctor/:doctorId/schedule', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    let sql = `
      SELECT 
        a.id as appointmentId,
        a.appointmentId as appointmentNumber,
        a.appointmentDate,
        a.appointmentTime,
        a.appointmentType,
        a.notes,
        a.status,
        a.priority,
        a.duration,
        p.firstName as patientFirstName,
        p.lastName as patientLastName,
        p.phone as patientPhone,
        p.age,
        p.gender
      FROM appointments a
      LEFT JOIN patients p ON a.patientId = p.id
      WHERE a.doctorId = ? AND a.status != 'cancelled'
    `;
    
    const params = [doctorId];
    
    if (date) {
      sql += ' AND a.appointmentDate = ?';
      params.push(date);
    }
    
    sql += ' ORDER BY a.appointmentDate ASC, a.appointmentTime ASC';
    
    const schedule = await getAll(sql, params);
    
    res.json({
      success: true,
      schedule: schedule
    });
    
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch doctor schedule' 
    });
  }
});

// GET appointment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's appointments
    const todayAppointments = await getRow(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE appointmentDate = ? AND status != 'cancelled'
    `, [today]);
    
    // Pending appointments
    const pendingAppointments = await getRow(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE status = 'scheduled'
    `);
    
    // Completed appointments today
    const completedToday = await getRow(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE appointmentDate = ? AND status = 'completed'
    `, [today]);
    
    // Cancelled appointments today
    const cancelledToday = await getRow(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE appointmentDate = ? AND status = 'cancelled'
    `, [today]);
    
    res.json({
      success: true,
      stats: {
        todayAppointments: todayAppointments.count,
        pendingAppointments: pendingAppointments.count,
        completedToday: completedToday.count,
        cancelledToday: cancelledToday.count
      }
    });
    
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch appointment statistics' 
    });
  }
});

module.exports = router;
