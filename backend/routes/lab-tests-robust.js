const express = require('express');
const router = express.Router();
const LabTestsService = require('../services/labTestsService');

// Initialize lab tests service
const labTestsService = new LabTestsService();
labTestsService.initialize().catch(console.error);

// Middleware to handle service errors
const handleServiceError = (res, error, operation) => {
  console.error(`❌ Error in ${operation}:`, error.message);
  
  if (error.code === 'SQLITE_BUSY') {
    res.status(503).json({ 
      error: 'Database is temporarily busy. Please try again in a moment.',
      retryAfter: 2,
      operation: operation
    });
  } else if (error.message.includes('database is locked')) {
    res.status(503).json({ 
      error: 'Database is locked. Please try again in a moment.',
      retryAfter: 3,
      operation: operation
    });
  } else {
    res.status(500).json({ 
      error: `Failed to ${operation}`,
      details: error.message
    });
  }
};

// GET all lab tests with robust error handling
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
    
    let result;
    
    if (all === 'true') {
      // Get all tests without pagination
      result = await labTestsService.getAllLabTests();
      
      if (!result.success) {
        return handleServiceError(res, new Error(result.error), 'fetch all lab tests');
      }
      
      res.json({
        tests: result.tests,
        groupedTests: result.groupedTests,
        total: result.totalCount,
        categories: result.categories,
        message: 'All tests retrieved successfully'
      });
    } else {
      // Get paginated results
      const offset = (page - 1) * limit;
      
      if (search) {
        result = await labTestsService.searchLabTests(search);
      } else if (category) {
        result = await labTestsService.getLabTestsByCategory(category);
      } else {
        result = await labTestsService.getAllLabTests();
      }
      
      if (!result.success) {
        return handleServiceError(res, new Error(result.error), 'fetch lab tests');
      }
      
      // Apply pagination
      const startIndex = offset;
      const endIndex = startIndex + parseInt(limit);
      const paginatedTests = result.tests.slice(startIndex, endIndex);
      
      res.json({
        tests: paginatedTests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.tests.length,
          pages: Math.ceil(result.tests.length / limit)
        }
      });
    }
  } catch (error) {
    handleServiceError(res, error, 'fetch lab tests');
  }
});

// GET lab test by ID
router.get('/tests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await labTestsService.getLabTestById(id);
    
    if (!result.success) {
      if (result.error === 'Lab test not found') {
        return res.status(404).json({ error: result.error });
      }
      return handleServiceError(res, new Error(result.error), 'fetch lab test');
    }
    
    res.json(result.test);
  } catch (error) {
    handleServiceError(res, error, 'fetch lab test');
  }
});

// GET lab test categories
router.get('/categories', async (req, res) => {
  try {
    const result = await labTestsService.getLabTestCategories();
    
    if (!result.success) {
      return handleServiceError(res, new Error(result.error), 'fetch categories');
    }
    
    res.json(result.categories);
  } catch (error) {
    handleServiceError(res, error, 'fetch categories');
  }
});

// POST create lab test order with robust transaction handling
router.post('/orders', async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      tests,
      clinicalNotes,
      instructions,
      priority = 'routine'
    } = req.body;
    
    // Validate required fields
    if (!patientId || !doctorId || !tests || !Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientId, doctorId, and tests are required' 
      });
    }
    
    // Validate tests array
    for (const test of tests) {
      if (!test.id || !test.testName || !test.testCode) {
        return res.status(400).json({ 
          error: 'Invalid test data: each test must have id, testName, and testCode' 
        });
      }
    }
    
    const orderData = {
      patientId,
      doctorId,
      tests,
      clinicalNotes: clinicalNotes || '',
      instructions: instructions || '',
      priority
    };
    
    const result = await labTestsService.createLabTestOrder(orderData);
    
    if (!result.success) {
      return handleServiceError(res, new Error(result.error), 'create lab test order');
    }
    
    res.status(201).json({
      success: true,
      orderId: result.orderId,
      orderItems: result.orderItems,
      totalTests: result.totalTests,
      totalAmount: result.totalAmount,
      message: 'Lab test order created successfully'
    });
  } catch (error) {
    handleServiceError(res, error, 'create lab test order');
  }
});

// PUT update lab test prices (bulk update)
router.put('/prices', async (req, res) => {
  try {
    const { price } = req.body;
    
    if (!price || isNaN(price) || price < 0) {
      return res.status(400).json({ 
        error: 'Invalid price: must be a positive number' 
      });
    }
    
    const result = await labTestsService.updateLabTestPrices(parseFloat(price));
    
    if (!result.success) {
      return handleServiceError(res, new Error(result.error), 'update lab test prices');
    }
    
    res.json({
      success: true,
      updatedCount: result.updatedCount,
      totalTests: result.totalTests,
      updatedTests: result.updatedTests,
      newPrice: result.newPrice,
      message: `Successfully updated ${result.updatedCount} lab test prices to ${result.newPrice}`
    });
  } catch (error) {
    handleServiceError(res, error, 'update lab test prices');
  }
});

// GET lab test statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await labTestsService.getAllLabTests();
    
    if (!result.success) {
      return handleServiceError(res, new Error(result.error), 'fetch lab test statistics');
    }
    
    const stats = {
      totalTests: result.totalCount,
      categories: result.categories.length,
      averagePrice: result.tests.reduce((sum, test) => sum + (test.price || 0), 0) / result.totalCount,
      priceRange: {
        min: Math.min(...result.tests.map(t => t.price || 0)),
        max: Math.max(...result.tests.map(t => t.price || 0))
      },
      categoryBreakdown: result.categories.map(category => ({
        category,
        count: result.groupedTests[category]?.length || 0
      }))
    };
    
    res.json(stats);
  } catch (error) {
    handleServiceError(res, error, 'fetch lab test statistics');
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const result = await labTestsService.getAllLabTests();
    
    if (result.success) {
      res.json({
        status: 'healthy',
        database: 'connected',
        totalTests: result.totalCount,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        database: 'error',
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
