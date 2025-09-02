console.log('Starting server...');

const express = require('express');
const app = express();
const PORT = 3002;

console.log('Express loaded');

app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login requested');
  res.json({ success: true });
});

console.log('Routes defined');

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});