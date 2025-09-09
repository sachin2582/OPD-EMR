const express = require('express');
const { runQuery, getRow, getAll } = require('../database/database');

const router = express.Router();

// Generate unique order ID
function generateOrderId() {
  return `LAB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
}

// Generate unique collection ID
function generateCollectionId() {
  return `SAMP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
}

// GET all lab tests with pagination and filters
router.get('/tests', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category = '', 
      subcategory = '',
      search = '',
      isActive = '',
      all = ''
    } = req.query;
    
    // If 'all' parameter is set, return all tests without pagination
    if (all === 'true') {
      let sql = `SELECT * FROM lab_tests WHERE 1=1`;
      let params = [];
      
      if (category) {
        sql += ` AND category = ?`;
        params.push(category);
      }
      
      if (subcategory) {
        sql += ` AND subcategory = ?`;
        params.push(subcategory);
      }
      
      if (search) {
        sql += ` AND (testName LIKE ? OR testCode LIKE ? OR description LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (isActive !== '') {
        sql += ` AND isActive = ?`;
        params.push(isActive === 'true' ? 1 : 0);
      }
      
      sql += ` ORDER BY category, testName`;
      
      const tests = await getAll(sql, params);
      
      res.json({
        tests,
        total: tests.length,
        message: 'All tests retrieved without pagination'
      });
      return;
    }
    
    // Regular paginated response
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT * FROM lab_tests WHERE 1=1
    `;
    let params = [];
    
    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    
    if (subcategory) {
      sql += ` AND subcategory = ?`;
      params.push(subcategory);
    }
    
    if (search) {
      sql += ` AND (testName LIKE ? OR testCode LIKE ? OR description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (isActive !== '') {
      sql += ` AND isActive = ?`;
      params.push(isActive === 'true' ? 1 : 0);
    }
    
    sql += ` ORDER BY category, testName LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const tests = await getAll(sql, params);
    
    // Get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM lab_tests WHERE 1=1`;
    let countParams = [];
    
    if (category) {
      countSql += ` AND category = ?`;
      countParams.push(category);
    }
    
    if (subcategory) {
      countSql += ` AND subcategory = ?`;
      countParams.push(subcategory);
    }
    
    if (search) {
      countSql += ` AND (testName LIKE ? OR testCode LIKE ? OR description LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (isActive !== '') {
      countSql += ` AND isActive = ?`;
      countParams.push(isActive === 'true' ? 1 : 0);
    }
    
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;
    
    res.json({
      tests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    res.status(500).json({ error: 'Failed to fetch lab tests' });
  }
});

// GET lab test by ID
router.get('/tests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const test = await getRow('SELECT * FROM lab_tests WHERE id = ?', [id]);
    
    if (!test) {
      return res.status(404).json({ error: 'Lab test not found' });
    }
    
    res.json(test);
  } catch (error) {
    console.error('Error fetching lab test:', error);
    res.status(500).json({ error: 'Failed to fetch lab test' });
  }
});

// POST create new lab test
router.post('/tests', async (req, res) => {
  try {
    const {
      testName,
      testCode,
      category,
      subcategory,
      price,
      description,
      preparation,
      turnaroundTime
    } = req.body;
    
    if (!testName || !testCode || !category || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const testId = `LT${Date.now().toString().slice(-6)}`;
    
    const result = await runQuery(`
      INSERT INTO lab_tests (testId, testName, testCode, category, subcategory, price, description, preparation, turnaroundTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [testId, testName, testCode, category, subcategory, price, description, preparation, turnaroundTime]);
    
    const newTest = await getRow('SELECT * FROM lab_tests WHERE id = ?', [result.id]);
    res.status(201).json(newTest);
  } catch (error) {
    console.error('Error creating lab test:', error);
    res.status(500).json({ error: 'Failed to create lab test' });
  }
});

// PUT update lab test
router.put('/tests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      testName,
      testCode,
      category,
      subcategory,
      price,
      description,
      preparation,
      turnaroundTime,
      isActive
    } = req.body;
    
    const result = await runQuery(`
      UPDATE lab_tests 
      SET testName = ?, testCode = ?, category = ?, subcategory = ?, price = ?, 
          description = ?, preparation = ?, turnaroundTime = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [testName, testCode, category, subcategory, price, description, preparation, turnaroundTime, isActive, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lab test not found' });
    }
    
    const updatedTest = await getRow('SELECT * FROM lab_tests WHERE id = ?', [id]);
    res.json(updatedTest);
  } catch (error) {
    console.error('Error updating lab test:', error);
    res.status(500).json({ error: 'Failed to update lab test' });
  }
});

// GET lab test categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await getAll('SELECT DISTINCT category FROM lab_tests WHERE isActive = 1 ORDER BY category');
    res.json(categories.map(cat => cat.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET lab test subcategories by category
router.get('/categories/:category/subcategories', async (req, res) => {
  try {
    const { category } = req.params;
    const subcategories = await getAll(
      'SELECT DISTINCT subcategory FROM lab_tests WHERE category = ? AND isActive = 1 AND subcategory IS NOT NULL ORDER BY subcategory',
      [category]
    );
    res.json(subcategories.map(sub => sub.subcategory));
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
});

// POST create lab order from prescription
router.post('/orders', async (req, res) => {
  try {
    const {
      prescriptionId,
      patientId,
      doctorId,
      tests,
      clinicalNotes,
      instructions,
      priority = 'routine'
    } = req.body;
    
    if (!prescriptionId || !patientId || !doctorId || !tests || tests.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create separate lab orders for each test (one order per test with direct testId relationship)
    const createdOrders = [];
    
    for (const test of tests) {
      const testData = await getRow('SELECT testName, testCode, price FROM lab_tests WHERE id = ?', [test.testId]);
      if (testData) {
        const orderId = generateOrderId();
        const testPrice = parseFloat(testData.price);
        
        // Create lab order with direct testId relationship
        const orderResult = await runQuery(`
          INSERT INTO lab_orders (orderId, prescriptionId, patientId, doctorId, testId, clinicalNotes, instructions, totalAmount, priority)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [orderId, prescriptionId, patientId, doctorId, test.testId, test.clinicalNotes, test.instructions, testPrice, priority]);
        
        // Create lab order item for this specific test
        await runQuery(`
          INSERT INTO lab_order_items (orderId, testId, testName, testCode, price, clinicalNotes, instructions)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [orderResult.id, test.testId, testData.testName, testData.testCode, testPrice, test.clinicalNotes, test.instructions]);
        
        createdOrders.push(orderResult);
      }
    }
    
    // Create sample collection records for each order
    for (const orderResult of createdOrders) {
      const collectionId = generateCollectionId();
      await runQuery(`
        INSERT INTO sample_collection (collectionId, orderId, patientId, status, priority)
        VALUES (?, ?, ?, 'pending', ?)
      `, [collectionId, orderResult.id, patientId, priority]);
    }
    
    // Get details for all created orders
    const newOrders = [];
    for (const orderResult of createdOrders) {
      const orderDetails = await getRow(`
        SELECT lo.*, 
               p.prescriptionId as prescriptionUniqueId,
               pat.firstName as patientFirstName,
               pat.lastName as patientLastName,
               d.name as doctorName,
               lt.testName,
               lt.testCode
        FROM lab_orders lo
        JOIN prescriptions p ON lo.prescriptionId = p.id
        JOIN patients pat ON lo.patientId = pat.id
        JOIN doctors d ON lo.doctorId = d.id
        LEFT JOIN lab_tests lt ON lo.testId = lt.id
        WHERE lo.id = ?
      `, [orderResult.id]);
      newOrders.push(orderDetails);
    }
    
    res.status(201).json({
      message: `${createdOrders.length} lab order(s) created successfully`,
      orders: newOrders,
      orderCount: createdOrders.length
    });
  } catch (error) {
    console.error('Error creating lab order:', error);
    res.status(500).json({ error: 'Failed to create lab order' });
  }
});

// GET lab orders with pagination and filters
router.get('/orders', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      patientId, 
      doctorId, 
      status = '', 
      date = '',
      search = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT lo.*, 
             p.prescriptionId as prescriptionUniqueId,
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             d.name as doctorName,
             COUNT(loi.id) as testCount
      FROM lab_orders lo
      JOIN prescriptions p ON lo.prescriptionId = p.id
      JOIN patients pat ON lo.patientId = pat.id
      JOIN doctors d ON lo.doctorId = d.id
      LEFT JOIN lab_order_items loi ON lo.id = loi.orderId
      WHERE 1=1
    `;
    let params = [];
    
    if (patientId) {
      sql += ` AND lo.patientId = ?`;
      params.push(patientId);
    }
    
    if (doctorId) {
      sql += ` AND lo.doctorId = ?`;
      params.push(doctorId);
    }
    
    if (status) {
      sql += ` AND lo.status = ?`;
      params.push(status);
    }
    
    if (date) {
      sql += ` AND DATE(lo.orderDate) = DATE(?)`;
      params.push(date);
    }
    
    if (search) {
      sql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR lo.orderId LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sql += ` GROUP BY lo.id ORDER BY lo.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const orders = await getAll(sql, params);
    
    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM lab_orders lo
      JOIN patients pat ON lo.patientId = pat.id
      WHERE 1=1
    `;
    let countParams = [];
    
    if (patientId) {
      countSql += ` AND lo.patientId = ?`;
      countParams.push(patientId);
    }
    
    if (doctorId) {
      countSql += ` AND lo.doctorId = ?`;
      countParams.push(doctorId);
    }
    
    if (status) {
      countSql += ` AND lo.status = ?`;
      countParams.push(status);
    }
    
    if (date) {
      countSql += ` AND DATE(lo.orderDate) = DATE(?)`;
      countParams.push(date);
    }
    
    if (search) {
      countSql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR lo.orderId LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;
    
    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching lab orders:', error);
    res.status(500).json({ error: 'Failed to fetch lab orders' });
  }
});

// GET lab order by ID with details
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await getRow(`
      SELECT lo.*, 
             p.prescriptionId as prescriptionUniqueId,
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.phone as patientPhone,
             d.name as doctorName,
             d.specialization as doctorSpecialization
      FROM lab_orders lo
      JOIN prescriptions p ON lo.prescriptionId = p.id
      JOIN patients pat ON lo.patientId = pat.id
      JOIN doctors d ON lo.doctorId = d.id
      WHERE lo.id = ?
    `, [id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Lab order not found' });
    }
    
    // Get order items
    const orderItems = await getAll(`
      SELECT * FROM lab_order_items WHERE orderId = ?
    `, [id]);
    
    // Get sample collection info
    const sampleCollection = await getRow(`
      SELECT * FROM sample_collection WHERE orderId = ?
    `, [id]);
    
    res.json({
      ...order,
      orderItems,
      sampleCollection
    });
  } catch (error) {
    console.error('Error fetching lab order:', error);
    res.status(500).json({ error: 'Failed to fetch lab order' });
  }
});

// GET lab order items by order ID
router.get('/orders/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order items
    const orderItems = await getAll(`
      SELECT * FROM lab_order_items WHERE orderId = ?
    `, [id]);
    
    res.json({ items: orderItems });
  } catch (error) {
    console.error('Error fetching lab order items:', error);
    res.status(500).json({ error: 'Failed to fetch lab order items' });
  }
});

// PUT update lab order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const result = await runQuery(`
      UPDATE lab_orders 
      SET status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lab order not found' });
    }
    
    // Update sample collection status if order is completed
    if (status === 'completed') {
      await runQuery(`
        UPDATE sample_collection 
        SET status = 'completed', updatedAt = CURRENT_TIMESTAMP
        WHERE orderId = ?
      `, [id]);
    }
    
    const updatedOrder = await getRow('SELECT * FROM lab_orders WHERE id = ?', [id]);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating lab order status:', error);
    res.status(500).json({ error: 'Failed to update lab order status' });
  }
});

// PUT update lab order billing
router.put('/orders/:id/billing', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, amount, discount, notes } = req.body;
    
    // First get the order to check current status
    const order = await getRow('SELECT * FROM lab_orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ error: 'Lab order not found' });
    }
    
    // Update payment information
    const result = await runQuery(`
      UPDATE lab_orders 
      SET paymentStatus = ?, 
          totalAmount = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [paymentStatus, amount, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lab order not found' });
    }
    
    // Log billing transaction (you can create a separate billing_logs table if needed)
    console.log(`Billing completed for order ${order.orderId}: ${paymentMethod}, Amount: ${amount}, Discount: ${discount}`);
    
    const updatedOrder = await getRow('SELECT * FROM lab_orders WHERE id = ?', [id]);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating lab order billing:', error);
    res.status(500).json({ error: 'Failed to update lab order billing' });
  }
});

// POST create sample collection record
router.post('/sample-collection', async (req, res) => {
  try {
    const {
      orderId,
      patientId,
      collectionDate,
      collectionTime,
      collectorName,
      collectorId,
      sampleType,
      sampleQuantity,
      collectionNotes,
      status = 'pending',
      priority = 'routine'
    } = req.body;
    
    if (!orderId || !patientId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const collectionId = generateCollectionId();
    
    const result = await runQuery(`
      INSERT INTO sample_collection (collectionId, orderId, patientId, collectionDate, collectionTime, 
                                   collectorName, collectorId, sampleType, sampleQuantity, collectionNotes, status, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [collectionId, orderId, patientId, collectionDate, collectionTime, collectorName, collectorId, 
        sampleType, sampleQuantity, collectionNotes, status, priority]);
    
    const newCollection = await getRow(`
      SELECT sc.*, 
             lo.orderId as orderUniqueId,
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId
      FROM sample_collection sc
      JOIN lab_orders lo ON sc.orderId = lo.id
      JOIN patients pat ON sc.patientId = pat.id
      WHERE sc.id = ?
    `, [result.id]);
    
    res.status(201).json(newCollection);
  } catch (error) {
    console.error('Error creating sample collection:', error);
    res.status(500).json({ error: 'Failed to create sample collection' });
  }
});

// GET sample collection records
router.get('/sample-collection', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      patientId, 
      status = '', 
      date = '',
      search = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT sc.*, 
             lo.orderId as orderUniqueId,
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId
      FROM sample_collection sc
      JOIN lab_orders lo ON sc.orderId = lo.id
      JOIN patients pat ON sc.patientId = pat.id
      WHERE 1=1
    `;
    let params = [];
    
    if (patientId) {
      sql += ` AND sc.patientId = ?`;
      params.push(patientId);
    }
    
    if (status) {
      sql += ` AND sc.status = ?`;
      params.push(status);
    }
    
    if (date) {
      sql += ` AND DATE(sc.collectionDate) = DATE(?)`;
      params.push(date);
    }
    
    if (search) {
      sql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR sc.collectionId LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sql += ` ORDER BY sc.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const collections = await getAll(sql, params);
    
    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM sample_collection sc
      JOIN patients pat ON sc.patientId = pat.id
      WHERE 1=1
    `;
    let countParams = [];
    
    if (patientId) {
      countSql += ` AND sc.patientId = ?`;
      countParams.push(patientId);
    }
    
    if (status) {
      countSql += ` AND sc.status = ?`;
      countParams.push(status);
    }
    
    if (date) {
      countSql += ` AND DATE(sc.collectionDate) = DATE(?)`;
      countParams.push(date);
    }
    
    if (search) {
      countSql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR sc.collectionId LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;
    
    res.json({
      collections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sample collections:', error);
    res.status(500).json({ error: 'Failed to fetch sample collections' });
  }
});

// PUT update sample collection
router.put('/sample-collection/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      collectionDate,
      collectionTime,
      collectorName,
      collectorId,
      sampleType,
      sampleQuantity,
      collectionNotes,
      status
    } = req.body;
    
    const result = await runQuery(`
      UPDATE sample_collection 
      SET collectionDate = ?, collectionTime = ?, collectorName = ?, collectorId = ?,
          sampleType = ?, sampleQuantity = ?, collectionNotes = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [collectionDate, collectionTime, collectorName, collectorId, sampleType, sampleQuantity, collectionNotes, status, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Sample collection record not found' });
    }
    
    const updatedCollection = await getRow('SELECT * FROM sample_collection WHERE id = ?', [id]);
    res.json(updatedCollection);
  } catch (error) {
    console.error('Error updating sample collection:', error);
    res.status(500).json({ error: 'Failed to update sample collection' });
  }
});

module.exports = router;
