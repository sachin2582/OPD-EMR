const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'OPD-EMR Auth Server Running' });
});

// Mock authentication routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple mock authentication - you can replace this with real logic
  if (username === 'admin' && password === 'admin') {
    res.json({
      success: true,
      token: 'mock-jwt-token-12345',
      user: {
        id: 1,
        username: 'admin',
        role: 'admin',
        name: 'Administrator'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'User registered successfully'
  });
});

app.get('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 1,
      username: 'admin',
      role: 'admin',
      name: 'Administrator'
    }
  });
});

// Basic patient routes for testing
app.get('/api/patients', (req, res) => {
  res.json({
    success: true,
    patients: []
  });
});

app.post('/api/patients', (req, res) => {
  res.json({
    success: true,
    message: 'Patient created successfully',
    patientId: Math.floor(Math.random() * 1000)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OPD-EMR Auth Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
