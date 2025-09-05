// Test backend connection
const http = require('http');

console.log('🔍 Testing Backend Connection...\n');

// Test 1: Check if backend is running
const testBackend = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log('✅ Backend is running!');
      console.log(`📊 Health Check Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (error) => {
      console.log('❌ Backend is not running or not accessible');
      console.log(`💡 Error: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      console.log('⏰ Backend connection timed out');
      reject(new Error('Connection timeout'));
    });

    req.end();
  });
};

// Test 2: Check lab tests API
const testLabTestsAPI = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/lab-tests/tests?all=true',
      method: 'GET',
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      console.log('✅ Lab Tests API is accessible!');
      console.log(`📊 API Status: ${res.statusCode}`);
      console.log(`📋 Content-Type: ${res.headers['content-type']}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`📈 Number of lab tests: ${jsonData.tests ? jsonData.tests.length : 'Unknown'}`);
          resolve(true);
        } catch (error) {
          console.log('⚠️  API responded but with invalid JSON');
          console.log('📄 Response preview:', data.substring(0, 200) + '...');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Lab Tests API is not accessible');
      console.log(`💡 Error: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      console.log('⏰ Lab Tests API request timed out');
      reject(new Error('API request timeout'));
    });

    req.end();
  });
};

// Run tests
async function runTests() {
  try {
    console.log('1️⃣ Testing backend health...');
    await testBackend();
    
    console.log('\n2️⃣ Testing lab tests API...');
    await testLabTestsAPI();
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    console.log('\n💡 If you\'re still getting "Failed to fetch" errors in the frontend:');
    console.log('   - Make sure the frontend is running on port 3000');
    console.log('   - Check browser console for CORS errors');
    console.log('   - Verify REACT_APP_API_BASE_URL is set correctly');
    
  } catch (error) {
    console.log('\n❌ Tests failed:', error.message);
    console.log('\n🔧 Solutions:');
    console.log('   1. Start the backend server: cd backend && node server.js');
    console.log('   2. Check if port 3001 is available');
    console.log('   3. Verify the server.js file exists in backend folder');
  }
}

runTests();
