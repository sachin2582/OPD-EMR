const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Ultra simple server is working!');
});

server.listen(3001, '127.0.0.1', () => {
  console.log('Ultra simple server running on http://127.0.0.1:3001');
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
  console.error('Error code:', err.code);
});
