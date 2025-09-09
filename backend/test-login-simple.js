// Simple test for doctor login
const http = require('http');

function testLogin(username, password) {
  const postData = JSON.stringify({
    username: username,
    password: password
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/users/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log(`🔐 Testing login for: ${username}`);
  console.log(`📡 Making request to: http://localhost:3001/api/users/login`);

  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📄 Response:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('✅ Login successful!');
          console.log('🎫 Token received:', response.data.token ? 'Yes' : 'No');
          console.log('👤 User role:', response.data.user.role);
        } else {
          console.log('❌ Login failed:', response.error);
        }
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('📄 Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });

  req.write(postData);
  req.end();
}

// Test the doctor login
console.log('🚀 Testing Doctor Login API...\n');
testLogin('dr.suneet.verma', '12345');
