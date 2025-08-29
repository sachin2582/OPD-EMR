const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Basic server is running on port 3000!',
    timestamp: new Date().toISOString(),
    status: 'success'
  }));
});

server.listen(3000, () => {
  console.log('🚀 Basic server running on port 3000');
  console.log('✅ Test: http://localhost:3000');
});

server.on('error', (error) => {
  console.error('Server error:', error);
});
