const express = require('express');
const router = express.Router();
const { getAll, getOne } = require('../database/database');

// GET /api/dose-patterns - Get all dose patterns
router.get('/', async (req, res) => {
  try {
    console.log('🔵 [DOSE PATTERNS API] GET /api/dose-patterns - Fetching all dose patterns');
    
    const dosePatterns = await getAll(`
      SELECT id, dose_value, description_hindi, description_english, category, is_active
      FROM dose_patterns
      WHERE is_active = 1
      ORDER BY dose_value
    `);
    
    console.log('✅ [DOSE PATTERNS API] Found dose patterns:', dosePatterns.length);
    
    res.json({
      success: true,
      data: dosePatterns,
      count: dosePatterns.length
    });
  } catch (error) {
    console.error('❌ [DOSE PATTERNS API] Error fetching dose patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dose patterns',
      message: 'An internal server error occurred'
    });
  }
});

// GET /api/dose-patterns/:id - Get specific dose pattern
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔵 [DOSE PATTERNS API] GET /api/dose-patterns/:id - Fetching dose pattern:', id);
    
    const dosePattern = await getOne(`
      SELECT id, dose_value, description_hindi, description_english, category, is_active
      FROM dose_patterns
      WHERE id = ? AND is_active = 1
    `, [id]);
    
    if (!dosePattern) {
      return res.status(404).json({
        success: false,
        error: 'Dose pattern not found',
        message: 'The requested dose pattern does not exist'
      });
    }
    
    console.log('✅ [DOSE PATTERNS API] Found dose pattern:', dosePattern.dose_value);
    
    res.json({
      success: true,
      data: dosePattern
    });
  } catch (error) {
    console.error('❌ [DOSE PATTERNS API] Error fetching dose pattern:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dose pattern',
      message: 'An internal server error occurred'
    });
  }
});

// GET /api/dose-patterns/search/:query - Search dose patterns
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    console.log('🔵 [DOSE PATTERNS API] GET /api/dose-patterns/search/:query - Searching for:', query);
    
    const dosePatterns = await getAll(`
      SELECT id, dose_value, description_hindi, description_english, category, is_active
      FROM dose_pattern
      WHERE is_active = 1 
        AND (dose_value LIKE ? 
             OR description_hindi LIKE ? 
             OR description_english LIKE ?)
      ORDER BY dose_value
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    
    console.log('✅ [DOSE PATTERNS API] Found matching dose patterns:', dosePatterns.length);
    
    res.json({
      success: true,
      data: dosePatterns,
      count: dosePatterns.length,
      query: query
    });
  } catch (error) {
    console.error('❌ [DOSE PATTERNS API] Error searching dose patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search dose patterns',
      message: 'An internal server error occurred'
    });
  }
});

module.exports = router;