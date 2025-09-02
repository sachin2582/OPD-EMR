const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Mock login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple mock authentication
  if (username === 'admin' && password === 'admin') {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 1,
        username: 'admin',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Mock clinic endpoint
app.get('/api/clinic', (req, res) => {
  res.json({
    id: 1,
    clinicName: 'OPD-EMR HOSPITAL',
    address: '123 Medical Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '+91-22-12345678',
    email: 'info@opdemr.com',
    website: 'www.opdemr.com',
    license: 'CLINIC-LICENSE-001',
    registration: 'REG-001',
    prescriptionValidity: 30
  });
});

// Mock patients endpoint
app.get('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    id: parseInt(id),
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    phone: '9876543210',
    email: 'john@example.com',
    address: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.originalUrl
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🎉 Minimal Backend Server Started!');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 CORS Origins: http://localhost:3000, http://localhost:3001, http://127.0.0.1:3000`);
  console.log('✅ Ready to accept requests!');
  console.log('🔐 Mock login: admin/admin');
});