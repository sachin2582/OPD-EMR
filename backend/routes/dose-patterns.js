const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = express.Router();

// Database path
const dbPath = path.join(__dirname, '../database/opd_emr.db');

// Get all dose patterns
router.get('/all', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  const sql = `
    SELECT id, pattern, description, category, isActive, createdAt, updatedAt
    FROM dose_patterns 
    WHERE isActive = 1 
    ORDER BY pattern
  `;
  
  db.all(sql, [], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Error fetching dose patterns:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch dose patterns',
        details: err.message 
      });
    }
    
    res.json({
      success: true,
      patterns: rows,
      count: rows.length
    });
  });
});

// Get dose patterns by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  const sql = `
    SELECT id, pattern, description, category, isActive, createdAt, updatedAt
    FROM dose_patterns 
    WHERE isActive = 1 AND category = ?
    ORDER BY pattern
  `;
  
  db.all(sql, [category], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Error fetching dose patterns by category:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch dose patterns by category',
        details: err.message 
      });
    }
    
    res.json({
      success: true,
      patterns: rows,
      count: rows.length,
      category: category
    });
  });
});

// Search dose patterns
router.get('/search', (req, res) => {
  const { q } = req.query;
  const db = new sqlite3.Database(dbPath);
  
  if (!q || q.trim() === '') {
    return res.status(400).json({ 
      error: 'Search query is required' 
    });
  }
  
  const searchTerm = `%${q.trim()}%`;
  const sql = `
    SELECT id, pattern, description, category, isActive, createdAt, updatedAt
    FROM dose_patterns 
    WHERE isActive = 1 
    AND (pattern LIKE ? OR description LIKE ? OR category LIKE ?)
    ORDER BY pattern
  `;
  
  db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Error searching dose patterns:', err);
      return res.status(500).json({ 
        error: 'Failed to search dose patterns',
        details: err.message 
      });
    }
    
    res.json({
      success: true,
      patterns: rows,
      count: rows.length,
      searchTerm: q
    });
  });
});

// Add new dose pattern (admin only)
router.post('/add', (req, res) => {
  const { pattern, description, category = 'general' } = req.body;
  const db = new sqlite3.Database(dbPath);
  
  if (!pattern || !description) {
    return res.status(400).json({ 
      error: 'Pattern and description are required' 
    });
  }
  
  const sql = `
    INSERT INTO dose_patterns (pattern, description, category, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;
  
  db.run(sql, [pattern, description, category], function(err) {
    db.close();
    
    if (err) {
      console.error('Error adding dose pattern:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ 
          error: 'Dose pattern already exists' 
        });
      }
      return res.status(500).json({ 
        error: 'Failed to add dose pattern',
        details: err.message 
      });
    }
    
    res.json({
      success: true,
      message: 'Dose pattern added successfully',
      id: this.lastID,
      pattern: pattern
    });
  });
});

// Update dose pattern (admin only)
router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { pattern, description, category, isActive } = req.body;
  const db = new sqlite3.Database(dbPath);
  
  const sql = `
    UPDATE dose_patterns 
    SET pattern = ?, description = ?, category = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(sql, [pattern, description, category, isActive, id], function(err) {
    db.close();
    
    if (err) {
      console.error('Error updating dose pattern:', err);
      return res.status(500).json({ 
        error: 'Failed to update dose pattern',
        details: err.message 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        error: 'Dose pattern not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Dose pattern updated successfully',
      id: id
    });
  });
});

// Delete dose pattern (admin only)
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  const sql = `DELETE FROM dose_patterns WHERE id = ?`;
  
  db.run(sql, [id], function(err) {
    db.close();
    
    if (err) {
      console.error('Error deleting dose pattern:', err);
      return res.status(500).json({ 
        error: 'Failed to delete dose pattern',
        details: err.message 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        error: 'Dose pattern not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Dose pattern deleted successfully',
      id: id
    });
  });
});

module.exports = router;
