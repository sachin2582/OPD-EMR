const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mock login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: 1,
      username: req.body.username || 'admin',
      role: 'admin'
    }
  });
});

// Mock clinic endpoint
app.get('/api/clinic', (req, res) => {
  console.log('Clinic data requested');
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
  console.log('Patient data requested for ID:', req.params.id);
  res.json({
    id: parseInt(req.params.id),
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

// Start server
app.listen(PORT, () => {
  console.log('🎉 Working Backend Server Started!');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log('✅ Ready to accept requests!');
  console.log('🔐 Mock login: any username/password will work');
});