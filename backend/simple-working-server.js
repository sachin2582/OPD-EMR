const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  if (req.url === '/health') {
    res.end(JSON.stringify({
      status: 'OK',
      message: 'OPD-EMR Backend Server Running!',
      timestamp: new Date().toISOString(),
      port: 5000
    }));
  } else if (req.url === '/test') {
    res.end(JSON.stringify({
      message: 'OPD-EMR Test endpoint working!',
      status: 'success'
    }));
  } else {
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OPD-EMR Backend Server</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; }
          .status { color: green; font-weight: bold; }
          a { color: #007bff; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 OPD-EMR Backend Server Running!</h1>
          <p class="status">✅ Server is active on port 5000</p>
          <p><strong>Available Endpoints:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li><a href="/health">/health</a> - Health check</li>
            <li><a href="/test">/test</a> - Test endpoint</li>
          </ul>
          <p><strong>Frontend:</strong> <a href="http://localhost:3000">http://localhost:3000</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

server.listen(5000, () => {
  console.log('🚀 OPD-EMR Backend Server running on port 5000');
  console.log('✅ Health check: http://localhost:5000/health');
  console.log('✅ Test endpoint: http://localhost:5000/test');
  console.log('✅ Main page: http://localhost:5000');
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
