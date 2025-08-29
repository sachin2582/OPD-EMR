const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  if (req.url === '/login') {
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OPD-EMR Login</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 50px; }
          .login-form { max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
          input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 3px; }
          button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="login-form">
          <h2>OPD-EMR System Login</h2>
          <form>
            <input type="text" placeholder="Username" required>
            <input type="password" placeholder="Password" required>
            <button type="submit">Login</button>
          </form>
          <p><strong>Server Status:</strong> Running on Port 3000 ✅</p>
        </div>
      </body>
      </html>
    `);
  } else {
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OPD-EMR Server</title>
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
          <h1>🚀 OPD-EMR Server Running!</h1>
          <p class="status">✅ Server is active on port 3000</p>
          <p><a href="/login">Go to Login Page</a></p>
          <p><strong>Features Available:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li>Patient Management</li>
            <li>Lab Test Billing</li>
            <li>Complete LIMS Workflow</li>
            <li>Sample Collection to Report Approval</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }
});

server.listen(3000, () => {
  console.log('🚀 OPD-EMR Server running on port 3000');
  console.log('✅ Login page: http://localhost:3000/login');
  console.log('✅ Home page: http://localhost:3000');
});

server.on('error', (error) => {
  console.error('Server error:', error);
});
