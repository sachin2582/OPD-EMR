const http = require('http');

console.log('🔍 Quick Backend Test...');

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/lab-tests/tests?all=true',
  method: 'GET'
}, (res) => {
  console.log('✅ Backend is responding!');
  console.log('Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ JSON response received');
      console.log('Number of tests:', json.tests ? json.tests.length : 'Unknown');
      console.log('🎉 Backend is working correctly!');
    } catch (e) {
      console.log('❌ Invalid JSON response');
      console.log('Response preview:', data.substring(0, 100));
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Backend not accessible:', err.message);
});

req.end();
