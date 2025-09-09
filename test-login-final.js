// Final test for doctor login
const http = require('http');

function makeRequest() {
  const postData = JSON.stringify({
    username: 'dr.suneet.verma',
    password: '12345'
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

  console.log('🔐 Testing Dr. Suneet Verma login...');
  console.log('📡 URL: http://localhost:3001/api/users/login');

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Response:', data);
      
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log('✅ LOGIN SUCCESSFUL!');
          console.log('👤 User:', response.data.user.username);
          console.log('🎭 Role:', response.data.user.role);
          console.log('🎫 Token:', response.data.token ? 'Received' : 'Not received');
        } else {
          console.log('❌ LOGIN FAILED:', response.error);
        }
      } catch (e) {
        console.log('❌ Parse error:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });

  req.write(postData);
  req.end();
}

// Wait a moment for server to start, then test
setTimeout(makeRequest, 2000);
