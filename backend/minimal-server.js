const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Minimal server is working!' });
});

// Auth routes (mock)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      message: 'Login successful',
      user: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  res.json({ valid: true, message: 'Mock verification' });
});

// Pharmacy routes (mock)
app.get('/api/pharmacy/items', (req, res) => {
  res.json([
    { id: 1, name: 'Paracetamol 500mg', sku: 'MED001', price: 5.00, stock: 100 },
    { id: 2, name: 'Amoxicillin 500mg', sku: 'MED002', price: 8.00, stock: 75 }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/test`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📦 Pharmacy: GET http://localhost:${PORT}/api/pharmacy/items`);
});
