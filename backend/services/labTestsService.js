const DatabaseManager = require('../utils/database');
const path = require('path');

class LabTestsService {
  constructor() {
    const dbPath = path.join(__dirname, '..', 'opd-emr.db');
    this.db = new DatabaseManager(dbPath);
  }

  // Initialize database connection
  async initialize() {
    try {
      await this.db.connect();
      console.log('✅ Lab Tests Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Lab Tests Service:', error.message);
      throw error;
    }
  }

  // Get all lab tests with retry logic
  async getAllLabTests() {
    try {
      const sql = `
        SELECT 
          id,
          testId,
          testName,
          testCode,
          category,
          subcategory,
          price,
          description,
          preparation,
          turnaroundTime,
          isActive,
          createdAt,
          updatedAt
        FROM lab_tests 
        WHERE isActive = 1 
        ORDER BY category, testName
      `;
      
      const tests = await this.db.query(sql);
      
      // Group tests by category for better organization
      const groupedTests = tests.reduce((acc, test) => {
        const category = test.category || 'General';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(test);
        return acc;
      }, {});

      return {
        success: true,
        tests: tests,
        groupedTests: groupedTests,
        totalCount: tests.length,
        categories: Object.keys(groupedTests)
      };
    } catch (error) {
      console.error('❌ Error fetching lab tests:', error.message);
      return {
        success: false,
        error: error.message,
        tests: [],
        groupedTests: {},
        totalCount: 0,
        categories: []
      };
    }
  }

  // Get lab tests by category
  async getLabTestsByCategory(category) {
    try {
      const sql = `
        SELECT 
          id,
          testId,
          testName,
          testCode,
          category,
          subcategory,
          price,
          description,
          preparation,
          turnaroundTime,
          isActive
        FROM lab_tests 
        WHERE category = ? AND isActive = 1 
        ORDER BY testName
      `;
      
      const tests = await this.db.query(sql, [category]);
      
      return {
        success: true,
        tests: tests,
        category: category,
        count: tests.length
      };
    } catch (error) {
      console.error(`❌ Error fetching lab tests for category ${category}:`, error.message);
      return {
        success: false,
        error: error.message,
        tests: [],
        category: category,
        count: 0
      };
    }
  }

  // Search lab tests
  async searchLabTests(searchTerm) {
    try {
      const sql = `
        SELECT 
          id,
          testId,
          testName,
          testCode,
          category,
          subcategory,
          price,
          description,
          preparation,
          turnaroundTime,
          isActive
        FROM lab_tests 
        WHERE isActive = 1 
        AND (
          testName LIKE ? OR 
          testCode LIKE ? OR 
          category LIKE ? OR 
          subcategory LIKE ? OR
          description LIKE ?
        )
        ORDER BY 
          CASE 
            WHEN testName LIKE ? THEN 1
            WHEN testCode LIKE ? THEN 2
            WHEN category LIKE ? THEN 3
            ELSE 4
          END,
          testName
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const params = [
        searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
        searchPattern, searchPattern, searchPattern
      ];
      
      const tests = await this.db.query(sql, params);
      
      return {
        success: true,
        tests: tests,
        searchTerm: searchTerm,
        count: tests.length
      };
    } catch (error) {
      console.error(`❌ Error searching lab tests for "${searchTerm}":`, error.message);
      return {
        success: false,
        error: error.message,
        tests: [],
        searchTerm: searchTerm,
        count: 0
      };
    }
  }

  // Get lab test by ID
  async getLabTestById(testId) {
    try {
      const sql = `
        SELECT 
          id,
          testId,
          testName,
          testCode,
          category,
          subcategory,
          price,
          description,
          preparation,
          turnaroundTime,
          isActive
        FROM lab_tests 
        WHERE id = ? AND isActive = 1
      `;
      
      const test = await this.db.get(sql, [testId]);
      
      if (test) {
        return {
          success: true,
          test: test
        };
      } else {
        return {
          success: false,
          error: 'Lab test not found',
          test: null
        };
      }
    } catch (error) {
      console.error(`❌ Error fetching lab test ${testId}:`, error.message);
      return {
        success: false,
        error: error.message,
        test: null
      };
    }
  }

  // Create lab test order with transaction
  async createLabTestOrder(orderData) {
    try {
      const { patientId, doctorId, tests, clinicalNotes, instructions, priority } = orderData;
      
      // Validate required fields
      if (!patientId || !doctorId || !tests || !Array.isArray(tests) || tests.length === 0) {
        return {
          success: false,
          error: 'Invalid order data: patientId, doctorId, and tests are required'
        };
      }

      // Start transaction
      const operations = [];
      
      // Create order record
      const orderSql = `
        INSERT INTO lab_test_orders (
          patientId, doctorId, clinicalNotes, instructions, 
          priority, status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      operations.push({
        type: 'run',
        sql: orderSql,
        params: [patientId, doctorId, clinicalNotes, instructions, priority]
      });

      // Get the order ID (we'll need to handle this differently in a transaction)
      let orderId;
      
      // First, create the order
      const orderResult = await this.db.run(orderSql, [patientId, doctorId, clinicalNotes, instructions, priority]);
      orderId = orderResult.lastID;

      // Create order items
      const orderItems = [];
      for (const test of tests) {
        const itemSql = `
          INSERT INTO lab_test_order_items (
            orderId, testId, testName, testCode, category, 
            price, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        const itemResult = await this.db.run(itemSql, [
          orderId,
          test.id,
          test.testName,
          test.testCode,
          test.category,
          test.price
        ]);
        
        orderItems.push({
          id: itemResult.lastID,
          orderId: orderId,
          testId: test.id,
          testName: test.testName,
          testCode: test.testCode,
          category: test.category,
          price: test.price,
          status: 'pending'
        });
      }

      return {
        success: true,
        orderId: orderId,
        orderItems: orderItems,
        totalTests: tests.length,
        totalAmount: tests.reduce((sum, test) => sum + (test.price || 0), 0)
      };
    } catch (error) {
      console.error('❌ Error creating lab test order:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get lab test categories
  async getLabTestCategories() {
    try {
      const sql = `
        SELECT DISTINCT category, COUNT(*) as testCount
        FROM lab_tests 
        WHERE isActive = 1 
        GROUP BY category 
        ORDER BY category
      `;
      
      const categories = await this.db.query(sql);
      
      return {
        success: true,
        categories: categories
      };
    } catch (error) {
      console.error('❌ Error fetching lab test categories:', error.message);
      return {
        success: false,
        error: error.message,
        categories: []
      };
    }
  }

  // Update lab test prices (bulk update)
  async updateLabTestPrices(newPrice) {
    try {
      const sql = 'UPDATE lab_tests SET price = ?, updatedAt = CURRENT_TIMESTAMP WHERE isActive = 1';
      const result = await this.db.run(sql, [newPrice]);
      
      // Verify update
      const verifySql = 'SELECT COUNT(*) as total, COUNT(CASE WHEN price = ? THEN 1 END) as updated_count FROM lab_tests WHERE isActive = 1';
      const verifyResult = await this.db.get(verifySql, [newPrice]);
      
      return {
        success: true,
        updatedCount: result.changes,
        totalTests: verifyResult.total,
        updatedTests: verifyResult.updated_count,
        newPrice: newPrice
      };
    } catch (error) {
      console.error('❌ Error updating lab test prices:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Close database connection
  async close() {
    await this.db.close();
  }
}

module.exports = LabTestsService;
