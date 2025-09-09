const express = require('express');
const { runQuery, getRow, getAll } = require('../database/database');
const router = express.Router();

// GET /api/item-master - Get all items with optional search and filtering
router.get('/', async (req, res) => {
  try {
    const { search, category, subcategory, limit, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        id,
        item_code,
        item_name,
        generic_name,
        brand,
        manufacturer,
        category,
        subcategory,
        unit,
        pack_size,
        mrp,
        purchase_price,
        selling_price,
        hsn_code,
        gst_rate,
        description,
        is_prescription_required,
        is_active
      FROM item_master 
      WHERE is_active = 1
    `;
    
    const params = [];
    
    // Add search filter
    if (search) {
      query += ` AND (
        item_name LIKE ? OR 
        generic_name LIKE ? OR 
        brand LIKE ? OR 
        item_code LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Add category filter
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    
    // Add subcategory filter
    if (subcategory) {
      query += ` AND subcategory = ?`;
      params.push(subcategory);
    }
    
    // Add ordering
    query += ` ORDER BY item_name ASC`;
    
    // Add pagination only if limit is provided
    if (limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));
      console.log('🔍 Added LIMIT to query');
    } else {
      console.log('🔍 No limit provided - loading all items');
    }
    
    console.log('🔍 Executing item master query:', query);
    console.log('📝 Parameters:', params);
    console.log('🔍 Limit value:', limit);
    console.log('🔍 Limit type:', typeof limit);
    
    const items = await getAll(query, params);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM item_master WHERE is_active = 1`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (
        item_name LIKE ? OR 
        generic_name LIKE ? OR 
        brand LIKE ? OR 
        item_code LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (category) {
      countQuery += ` AND category = ?`;
      countParams.push(category);
    }
    
    if (subcategory) {
      countQuery += ` AND subcategory = ?`;
      countParams.push(subcategory);
    }
    
    const totalResult = await getRow(countQuery, countParams);
    const total = totalResult.total;
    
    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        limit: limit ? parseInt(limit) : null,
        offset: parseInt(offset),
        hasMore: limit ? (parseInt(offset) + parseInt(limit)) < total : false
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching item master data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch item master data',
      details: error.message
    });
  }
});

// GET /api/item-master/search - Search items with autocomplete
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Search term must be at least 2 characters'
      });
    }
    
    const query = `
      SELECT 
        id,
        item_code,
        item_name,
        generic_name,
        brand,
        category,
        subcategory,
        unit,
        mrp,
        selling_price
      FROM item_master 
      WHERE is_active = 1 AND (
        item_name LIKE ? OR 
        generic_name LIKE ? OR 
        brand LIKE ? OR 
        item_code LIKE ?
      )
      ORDER BY 
        CASE 
          WHEN item_name LIKE ? THEN 1
          WHEN generic_name LIKE ? THEN 2
          WHEN brand LIKE ? THEN 3
          ELSE 4
        END,
        item_name ASC
      LIMIT ?
    `;
    
    const searchTerm = `%${q}%`;
    const exactMatch = `${q}%`;
    const params = [searchTerm, searchTerm, searchTerm, searchTerm, exactMatch, exactMatch, exactMatch, parseInt(limit)];
    
    console.log('🔍 Executing item search query:', query);
    console.log('📝 Parameters:', params);
    
    const items = await getAll(query, params);
    
    res.json({
      success: true,
      data: items,
      query: q
    });
    
  } catch (error) {
    console.error('❌ Error searching items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search items',
      details: error.message
    });
  }
});

// GET /api/item-master/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const query = `
      SELECT 
        category,
        COUNT(*) as count
      FROM item_master 
      WHERE is_active = 1
      GROUP BY category 
      ORDER BY category ASC
    `;
    
    const categories = await getAll(query);
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      details: error.message
    });
  }
});

// GET /api/item-master/subcategories - Get all subcategories
router.get('/subcategories', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT 
        subcategory,
        COUNT(*) as count
      FROM item_master 
      WHERE is_active = 1
    `;
    
    const params = [];
    
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    
    query += ` GROUP BY subcategory ORDER BY subcategory ASC`;
    
    const subcategories = await getAll(query, params);
    
    res.json({
      success: true,
      data: subcategories
    });
    
  } catch (error) {
    console.error('❌ Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subcategories',
      details: error.message
    });
  }
});

// GET /api/item-master/:id - Get specific item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        item_code,
        item_name,
        generic_name,
        brand,
        manufacturer,
        category,
        subcategory,
        unit,
        pack_size,
        mrp,
        purchase_price,
        selling_price,
        hsn_code,
        gst_rate,
        description,
        is_prescription_required,
        is_active
      FROM item_master 
      WHERE id = ? AND is_active = 1
    `;
    
    const item = await getRow(query, [id]);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
    
  } catch (error) {
    console.error('❌ Error fetching item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch item',
      details: error.message
    });
  }
});

module.exports = router;
