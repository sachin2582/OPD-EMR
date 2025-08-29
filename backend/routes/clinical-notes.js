const express = require('express');
const { runQuery, getRow, getAll } = require('../database/database');

const router = express.Router();

// GET all clinical notes (with optional patient filter)
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId, dateFrom, dateTo } = req.query;
    
    let sql = `
      SELECT 
        cn.*,
        p.firstName || ' ' || p.lastName as patientName,
        p.patientId as patientIdNumber,
        d.name as doctorName,
        d.specialization
      FROM clinical_notes cn
      JOIN patients p ON cn.patientId = p.id
      JOIN doctors d ON cn.doctorId = d.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (patientId) {
      sql += ' AND cn.patientId = ?';
      params.push(patientId);
    }
    
    if (doctorId) {
      sql += ' AND cn.doctorId = ?';
      params.push(doctorId);
    }
    
    if (dateFrom) {
      sql += ' AND DATE(cn.noteDate) >= DATE(?)';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      sql += ' AND DATE(cn.noteDate) <= DATE(?)';
      params.push(dateTo);
    }
    
    sql += ' ORDER BY cn.noteDate DESC, cn.createdAt DESC';
    
    const notes = await getAll(sql, params);
    
    res.json({
      success: true,
      notes: notes
    });
    
  } catch (error) {
    console.error('Error fetching clinical notes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch clinical notes' 
    });
  }
});

// GET clinical note by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await getRow(`
      SELECT 
        cn.*,
        p.firstName || ' ' || p.lastName as patientName,
        p.patientId as patientIdNumber,
        d.name as doctorName,
        d.specialization
      FROM clinical_notes cn
      JOIN patients p ON cn.patientId = p.id
      JOIN doctors d ON cn.doctorId = d.id
      WHERE cn.id = ?
    `, [id]);
    
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        error: 'Clinical note not found' 
      });
    }
    
    res.json({
      success: true,
      note: note
    });
    
  } catch (error) {
    console.error('Error fetching clinical note:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch clinical note' 
    });
  }
});

// POST create new clinical note
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      noteDate,
      subjective,
      objective,
      assessment,
      plan,
      diagnosis,
      medications,
      followUp,
      notes
    } = req.body;
    
    // Validation
    if (!patientId || !doctorId || !noteDate || !subjective || !assessment || !plan) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: patientId, doctorId, noteDate, subjective, assessment, plan' 
      });
    }
    
    // Create clinical note
    const result = await runQuery(`
      INSERT INTO clinical_notes (
        patientId, doctorId, noteDate, subjective, objective, 
        assessment, plan, diagnosis, medications, followUp, 
        notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      patientId, doctorId, noteDate, subjective, 
      JSON.stringify(objective), assessment, plan, diagnosis, 
      medications, followUp, notes
    ]);
    
    // Get the created note
    const newNote = await getRow(`
      SELECT 
        cn.*,
        p.firstName || ' ' || p.lastName as patientName,
        p.patientId as patientIdNumber,
        d.name as doctorName,
        d.specialization
      FROM clinical_notes cn
      JOIN patients p ON cn.patientId = p.id
      JOIN doctors d ON cn.doctorId = d.id
      WHERE cn.id = ?
    `, [result.id]);
    
    res.status(201).json({
      success: true,
      message: 'Clinical note created successfully',
      note: newNote
    });
    
  } catch (error) {
    console.error('Error creating clinical note:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create clinical note' 
    });
  }
});

// PUT update clinical note
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if note exists
    const existingNote = await getRow('SELECT * FROM clinical_notes WHERE id = ?', [id]);
    if (!existingNote) {
      return res.status(404).json({ 
        success: false, 
        error: 'Clinical note not found' 
      });
    }
    
    // Build update query
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        if (key === 'objective') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No valid fields to update' 
      });
    }
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    const sql = `UPDATE clinical_notes SET ${fields.join(', ')} WHERE id = ?`;
    await runQuery(sql, values);
    
    // Get updated note
    const updatedNote = await getRow(`
      SELECT 
        cn.*,
        p.firstName || ' ' || p.lastName as patientName,
        p.patientId as patientIdNumber,
        d.name as doctorName,
        d.specialization
      FROM clinical_notes cn
      JOIN patients p ON cn.patientId = p.id
      JOIN doctors d ON cn.doctorId = d.id
      WHERE cn.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Clinical note updated successfully',
      note: updatedNote
    });
    
  } catch (error) {
    console.error('Error updating clinical note:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update clinical note' 
    });
  }
});

// DELETE clinical note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if note exists
    const existingNote = await getRow('SELECT * FROM clinical_notes WHERE id = ?', [id]);
    if (!existingNote) {
      return res.status(404).json({ 
        success: false, 
        error: 'Clinical note not found' 
      });
    }
    
    // Delete note
    await runQuery('DELETE FROM clinical_notes WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Clinical note deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting clinical note:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete clinical note' 
    });
  }
});

// GET patient's clinical notes summary
router.get('/patient/:patientId/summary', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Get patient's latest note
    const latestNote = await getRow(`
      SELECT 
        cn.noteDate,
        cn.diagnosis,
        cn.medications,
        cn.followUp
      FROM clinical_notes cn
      WHERE cn.patientId = ?
      ORDER BY cn.noteDate DESC
      LIMIT 1
    `, [patientId]);
    
    // Get note count
    const noteCount = await getRow(`
      SELECT COUNT(*) as count
      FROM clinical_notes
      WHERE patientId = ?
    `, [patientId]);
    
    // Get diagnosis history
    const diagnoses = await getAll(`
      SELECT DISTINCT diagnosis
      FROM clinical_notes
      WHERE patientId = ? AND diagnosis IS NOT NULL AND diagnosis != ''
      ORDER BY diagnosis
    `, [patientId]);
    
    res.json({
      success: true,
      summary: {
        latestNote,
        totalNotes: noteCount.count,
        diagnoses: diagnoses.map(d => d.diagnosis)
      }
    });
    
  } catch (error) {
    console.error('Error fetching patient clinical summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch patient clinical summary' 
    });
  }
});

// GET clinical notes statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    
    const stats = await getRow(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(noteDate) = DATE(?) THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN strftime('%Y-%m', noteDate) = ? THEN 1 ELSE 0 END) as thisMonth,
        COUNT(DISTINCT patientId) as uniquePatients,
        COUNT(DISTINCT doctorId) as uniqueDoctors
      FROM clinical_notes
    `, [today, thisMonth]);
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('Error fetching clinical notes statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch clinical notes statistics' 
    });
  }
});

module.exports = router;
