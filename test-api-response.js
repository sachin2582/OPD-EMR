const http = require('http');

console.log('🔍 Testing API response...');

// Test the lab tests API endpoint
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/lab-tests/tests?all=true',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📊 Response length: ${data.length}`);
    console.log(`🔍 First 200 characters: ${data.substring(0, 200)}`);
    
    if (data.startsWith('<!DOCTYPE') || data.startsWith('<html')) {
      console.log('❌ ERROR: Received HTML instead of JSON!');
      console.log('💡 This means the backend server is not running or the endpoint is wrong.');
    } else if (data.startsWith('{') || data.startsWith('[')) {
      console.log('✅ SUCCESS: Received JSON response!');
      try {
        const jsonData = JSON.parse(data);
        console.log(`📊 Found ${jsonData.tests ? jsonData.tests.length : 'unknown'} lab tests`);
      } catch (e) {
        console.log('❌ ERROR: Invalid JSON format');
      }
    } else {
      console.log('❓ UNKNOWN: Unexpected response format');
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Connection Error:', err.message);
  console.log('💡 This means the backend server is not running on port 3001');
});

req.end();
