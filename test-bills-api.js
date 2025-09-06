const axios = require('axios');

async function testBillsAPI() {
  try {
    console.log('🧪 Testing Bills API...');
    
    // Test 1: Health check
    console.log('\n1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Backend is running:', healthResponse.data);
    
    // Test 2: Get all bills
    console.log('\n2. Testing GET /api/bills...');
    const billsResponse = await axios.get('http://localhost:3001/api/bills');
    console.log('✅ Bills API response:', {
      success: billsResponse.data.success,
      count: billsResponse.data.count,
      dataLength: billsResponse.data.data?.length || 0
    });
    
    if (billsResponse.data.data && billsResponse.data.data.length > 0) {
      console.log('📋 Sample bill:', billsResponse.data.data[0]);
    } else {
      console.log('📋 No bills found in database');
    }
    
    // Test 3: Get bills for today
    console.log('\n3. Testing GET /api/bills?date=' + new Date().toISOString().split('T')[0]);
    const todayResponse = await axios.get(`http://localhost:3001/api/bills?date=${new Date().toISOString().split('T')[0]}`);
    console.log('✅ Today\'s bills:', {
      success: todayResponse.data.success,
      count: todayResponse.data.count,
      dataLength: todayResponse.data.data?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error testing API:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
  }
}

testBillsAPI();
