const http = require('http');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  // Set content type
  res.setHeader('Content-Type', 'application/json');
  
  if (path === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'OK', message: 'OPD-EMR Server Running' }));
  }
  else if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        
        if (username === 'admin' && password === 'admin') {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            token: 'mock-jwt-token-12345',
            user: {
              id: 1,
              username: 'admin',
              role: 'admin',
              name: 'Administrator'
            }
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid request body'
        }));
      }
    });
  }
  else if (path === '/api/auth/register' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'User registered successfully'
    }));
  }
  else if (path === '/api/auth/verify' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      user: {
        id: 1,
        username: 'admin',
        role: 'admin',
        name: 'Administrator'
      }
    }));
  }
  else if (path === '/api/patients' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      patients: []
    }));
  }
  else if (path === '/api/patients' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'Patient created successfully',
      patientId: Math.floor(Math.random() * 1000)
    }));
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

server.listen(5000, () => {
  console.log('🚀 OPD-EMR Simple Auth Server started on port 5000!');
  console.log('📊 Health check: http://localhost:5000/health');
  console.log('🔗 API Base URL: http://localhost:5000/api');
});
