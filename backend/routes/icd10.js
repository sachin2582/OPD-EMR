const express = require('express');
const router = express.Router();
const { searchICD10, getICD10ByCode, getICD10ByCategory, getICD10Categories } = require('../database/icd10-data');

// GET /api/icd10/search?q=query - Search ICD-10 codes
router.get('/search', (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.json({ 
        codes: [],
        total: 0,
        message: 'Please provide a search query'
      });
    }

    const results = searchICD10(query);
    
    res.json({
      codes: results,
      total: results.length,
      query: query,
      message: `Found ${results.length} ICD-10 codes matching "${query}"`
    });
  } catch (error) {
    console.error('Error searching ICD-10 codes:', error);
    res.status(500).json({ error: 'Failed to search ICD-10 codes' });
  }
});

// GET /api/icd10/code/:code - Get specific ICD-10 code by code
router.get('/code/:code', (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({ error: 'ICD-10 code is required' });
    }

    const result = getICD10ByCode(code);
    
    if (!result) {
      return res.status(404).json({ error: `ICD-10 code ${code} not found` });
    }

    res.json({
      code: result,
      message: 'ICD-10 code found'
    });
  } catch (error) {
    console.error('Error getting ICD-10 code:', error);
    res.status(500).json({ error: 'Failed to get ICD-10 code' });
  }
});

// GET /api/icd10/category/:category - Get ICD-10 codes by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const results = getICD10ByCategory(category);
    
    res.json({
      codes: results,
      total: results.length,
      category: category,
      message: `Found ${results.length} ICD-10 codes in category "${category}"`
    });
  } catch (error) {
    console.error('Error getting ICD-10 codes by category:', error);
    res.status(500).json({ error: 'Failed to get ICD-10 codes by category' });
  }
});

// GET /api/icd10/categories - Get all ICD-10 categories
router.get('/categories', (req, res) => {
  try {
    const categories = getICD10Categories();
    
    res.json({
      categories: categories,
      total: categories.length,
      message: 'ICD-10 categories retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting ICD-10 categories:', error);
    res.status(500).json({ error: 'Failed to get ICD-10 categories' });
  }
});

// GET /api/icd10/all - Get all ICD-10 codes (for autocomplete)
router.get('/all', (req, res) => {
  try {
    const { icd10Data } = require('../database/icd10-data');
    
    res.json({
      codes: icd10Data,
      total: icd10Data.length,
      message: 'All ICD-10 codes retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting all ICD-10 codes:', error);
    res.status(500).json({ error: 'Failed to get all ICD-10 codes' });
  }
});

module.exports = router;
