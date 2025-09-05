import appConfig from '../config/appConfig';

class LabTestsService {
  constructor() {
    this.baseURL = appConfig.apiBaseUrl;
    this.maxRetries = 3;
    this.retryDelay = 1000; // Start with 1 second
    this.maxRetryDelay = 5000; // Max 5 seconds
  }

  // Generic fetch method with retry logic
  async fetchWithRetry(url, options = {}, retryCount = 0) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        // If it's a server error (5xx) or service unavailable, retry
        if (response.status >= 500 || response.status === 503) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // For client errors (4xx), don't retry
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      // If it's a network error or server error, and we haven't exceeded max retries
      if (retryCount < this.maxRetries && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('HTTP 5') ||
        error.message.includes('HTTP 503') ||
        error.message.includes('Database is') ||
        error.message.includes('temporarily busy')
      )) {
        const delay = Math.min(this.retryDelay * Math.pow(2, retryCount), this.maxRetryDelay);
        
        console.log(`⚠️  Request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
        console.log(`   Error: ${error.message}`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  // Get all lab tests
  async getAllLabTests() {
    try {
      const url = `${this.baseURL}/api/lab-tests/tests?all=true`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      
      return {
        success: true,
        tests: data.tests || [],
        groupedTests: data.groupedTests || {},
        totalCount: data.total || 0,
        categories: data.categories || []
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
      const url = `${this.baseURL}/api/lab-tests/tests?category=${encodeURIComponent(category)}&all=true`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      
      return {
        success: true,
        tests: data.tests || [],
        category: category,
        count: data.tests?.length || 0
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
      const url = `${this.baseURL}/api/lab-tests/tests?search=${encodeURIComponent(searchTerm)}&all=true`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      
      return {
        success: true,
        tests: data.tests || [],
        searchTerm: searchTerm,
        count: data.tests?.length || 0
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

  // Get lab test categories
  async getLabTestCategories() {
    try {
      const url = `${this.baseURL}/api/lab-tests/categories`;
      const response = await this.fetchWithRetry(url);
      const categories = await response.json();
      
      return {
        success: true,
        categories: categories || []
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

  // Create lab test order
  async createLabTestOrder(orderData) {
    try {
      const url = `${this.baseURL}/api/lab-tests/orders`;
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      return {
        success: true,
        orderId: data.orderId,
        orderItems: data.orderItems || [],
        totalTests: data.totalTests || 0,
        totalAmount: data.totalAmount || 0,
        message: data.message || 'Lab test order created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating lab test order:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update lab test prices
  async updateLabTestPrices(newPrice) {
    try {
      const url = `${this.baseURL}/api/lab-tests/prices`;
      const response = await this.fetchWithRetry(url, {
        method: 'PUT',
        body: JSON.stringify({ price: newPrice })
      });
      
      const data = await response.json();
      
      return {
        success: true,
        updatedCount: data.updatedCount || 0,
        totalTests: data.totalTests || 0,
        updatedTests: data.updatedTests || 0,
        newPrice: data.newPrice || newPrice,
        message: data.message || 'Lab test prices updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating lab test prices:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get lab test statistics
  async getLabTestStats() {
    try {
      const url = `${this.baseURL}/api/lab-tests/stats`;
      const response = await this.fetchWithRetry(url);
      const stats = await response.json();
      
      return {
        success: true,
        stats: stats
      };
    } catch (error) {
      console.error('❌ Error fetching lab test statistics:', error.message);
      return {
        success: false,
        error: error.message,
        stats: null
      };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const url = `${this.baseURL}/api/lab-tests/health`;
      const response = await this.fetchWithRetry(url);
      const health = await response.json();
      
      return {
        success: true,
        health: health
      };
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return {
        success: false,
        error: error.message,
        health: null
      };
    }
  }
}

// Create singleton instance
const labTestsService = new LabTestsService();

export default labTestsService;
