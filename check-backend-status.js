const http = require('http');

console.log('🔍 Checking backend server status...');

// Test if backend is running
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/lab-tests/tests?all=true',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log('✅ Backend server is running!');
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Content-Type: ${res.headers['content-type']}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log(`📈 Number of lab tests: ${jsonData.tests ? jsonData.tests.length : 'Unknown'}`);
      console.log('🎉 Backend API is working correctly!');
    } catch (error) {
      console.log('⚠️  Backend responded but with invalid JSON');
      console.log('📄 Response preview:', data.substring(0, 100) + '...');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Backend server is not running or not accessible');
  console.log('🔧 Error:', error.message);
  console.log('\n💡 Solution: Start the backend server');
  console.log('   1. Open a new terminal');
  console.log('   2. Navigate to the backend folder: cd backend');
  console.log('   3. Start the server: node server.js');
  console.log('   4. Or use the batch file: start-backend.bat');
});

req.on('timeout', () => {
  console.log('⏰ Backend server is not responding (timeout)');
  console.log('💡 The server might be starting up or there might be an error');
});

req.end();
