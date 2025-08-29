const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>🚀 OPD-EMR Backend Server Running!</h1><p>✅ Server is active on port 3001</p>');
});

server.listen(3001, () => {
  console.log('🚀 OPD-EMR Backend Server started on port 3001!');
});
