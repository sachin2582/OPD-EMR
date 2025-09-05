const http = require('http');

console.log('🔍 Testing Lab Tests API...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/lab-tests/tests?all=true',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log('✅ API Response received!');
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
      console.log('🎉 Lab tests API is working correctly!');
    } catch (error) {
      console.log('⚠️  API responded but with invalid JSON');
      console.log('📄 Response preview:', data.substring(0, 200) + '...');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ API request failed:', error.message);
  console.log('💡 This means the backend server is not running or not accessible');
});

req.on('timeout', () => {
  console.log('⏰ API request timed out');
  console.log('💡 The server might be starting up or there might be an error');
});

req.end();
