import { useState, useEffect, useCallback, useRef } from 'react';
import labTestsService from '../services/labTestsService';

export const useLabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [groupedTests, setGroupedTests] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  const retryTimeoutRef = useRef(null);
  const maxRetries = 3;

  // Fetch lab tests with retry logic
  const fetchLabTests = useCallback(async (forceRefresh = false) => {
    // Don't fetch if already loading unless forced
    if (loading && !forceRefresh) return;
    
    // Don't fetch if we've tried too many times recently
    if (retryCount >= maxRetries && !forceRefresh) {
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await labTestsService.getAllLabTests();
      
      if (result.success) {
        setLabTests(result.tests);
        setGroupedTests(result.groupedTests);
        setCategories(result.categories);
        setRetryCount(0);
        setLastFetchTime(new Date());
        console.log(`✅ Lab tests loaded successfully: ${result.totalCount} tests`);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('❌ Error fetching lab tests:', err.message);
      setError(err.message);
      
      // Increment retry count and schedule retry
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      if (newRetryCount < maxRetries) {
        const retryDelay = Math.min(1000 * Math.pow(2, newRetryCount), 10000); // Exponential backoff, max 10s
        console.log(`⚠️  Retrying in ${retryDelay}ms... (attempt ${newRetryCount + 1}/${maxRetries})`);
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchLabTests();
        }, retryDelay);
      } else {
        setError('Failed to load lab tests after multiple attempts. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [loading, retryCount]);

  // Search lab tests
  const searchLabTests = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return { success: true, tests: labTests, count: labTests.length };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await labTestsService.searchLabTests(searchTerm);
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('❌ Error searching lab tests:', err.message);
      setError(err.message);
      return { success: false, error: err.message, tests: [], count: 0 };
    } finally {
      setLoading(false);
    }
  }, [labTests]);

  // Get lab tests by category
  const getLabTestsByCategory = useCallback(async (category) => {
    setLoading(true);
    setError(null);

    try {
      const result = await labTestsService.getLabTestsByCategory(category);
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error(`❌ Error fetching lab tests for category ${category}:`, err.message);
      setError(err.message);
      return { success: false, error: err.message, tests: [], count: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create lab test order
  const createLabTestOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await labTestsService.createLabTestOrder(orderData);
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('❌ Error creating lab test order:', err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update lab test prices
  const updateLabTestPrices = useCallback(async (newPrice) => {
    setLoading(true);
    setError(null);

    try {
      const result = await labTestsService.updateLabTestPrices(newPrice);
      
      if (result.success) {
        // Refresh lab tests after price update
        await fetchLabTests(true);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('❌ Error updating lab test prices:', err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchLabTests]);

  // Health check
  const healthCheck = useCallback(async () => {
    try {
      const result = await labTestsService.healthCheck();
      return result;
    } catch (err) {
      console.error('❌ Health check failed:', err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Clear error and reset retry count
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Force refresh
  const refresh = useCallback(() => {
    clearError();
    fetchLabTests(true);
  }, [clearError, fetchLabTests]);

  // Initial fetch
  useEffect(() => {
    fetchLabTests();
    
    // Cleanup timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    labTests,
    groupedTests,
    categories,
    
    // State
    loading,
    error,
    retryCount,
    lastFetchTime,
    
    // Actions
    fetchLabTests,
    searchLabTests,
    getLabTestsByCategory,
    createLabTestOrder,
    updateLabTestPrices,
    healthCheck,
    clearError,
    refresh
  };
};

export default useLabTests;
