const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockPatients = [
  {
    id: 1,
    patientId: 1001,
    firstName: 'John',
    lastName: 'Doe',
    phone: '9876543210',
    email: 'john.doe@email.com',
    age: 35,
    gender: 'Male',
    address: '123 Main St, City',
    dateOfBirth: '1988-05-15'
  },
  {
    id: 2,
    patientId: 1002,
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '9876543211',
    email: 'jane.smith@email.com',
    age: 28,
    gender: 'Female',
    address: '456 Oak Ave, Town',
    dateOfBirth: '1995-08-22'
  },
  {
    id: 3,
    patientId: 1003,
    firstName: 'Mike',
    lastName: 'Johnson',
    phone: '9876543212',
    email: 'mike.johnson@email.com',
    age: 42,
    gender: 'Male',
    address: '789 Pine Rd, Village',
    dateOfBirth: '1981-12-10'
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'OPD-EMR Mock Backend Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test database connection (mock)
app.get('/api/test-db', (req, res) => {
  res.json({
    success: true,
    message: 'Mock database connected successfully',
    patientCount: mockPatients.length,
    timestamp: new Date().toISOString()
  });
});

// Get all patients
app.get('/api/patients', (req, res) => {
  console.log('🔍 Fetching patients from mock data...');
  console.log(`✅ Found ${mockPatients.length} patients`);
  res.json(mockPatients);
});

// Get patient by ID
app.get('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  const patient = mockPatients.find(p => p.id === parseInt(id));
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }
  
  res.json(patient);
});

// Add new patient
app.post('/api/patients', (req, res) => {
  const patientData = req.body;
  console.log('➕ Adding new patient:', patientData);

  const newPatient = {
    id: mockPatients.length + 1,
    patientId: Date.now(),
    ...patientData
  };

  mockPatients.push(newPatient);

  res.json({
    success: true,
    message: 'Patient added successfully',
    patient: newPatient
  });
});

// Delete patient
app.delete('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  const index = mockPatients.findIndex(p => p.id === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  mockPatients.splice(index, 1);

  res.json({
    success: true,
    message: 'Patient deleted successfully'
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username, password: password ? '***' : 'missing' });

    // Simple authentication
    if (username === 'admin' && password === 'admin123') {
      const jwtSecret = process.env.JWT_SECRET || 'opd-emr-secret-key-2024';
      const token = jwt.sign(
        {
          id: 1,
          username: 'admin',
          role: 'admin'
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      console.log('✅ JWT token created');

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: 1,
          username: 'admin',
          role: 'admin',
          name: 'Administrator'
        }
      });
    } else {
      console.log('❌ Invalid credentials for user:', username);
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Patients API: http://localhost:${PORT}/api/patients`);
  console.log(`🔐 Login API: http://localhost:${PORT}/api/auth/login`);
  console.log(`📊 Mock data: ${mockPatients.length} patients loaded`);
});

module.exports = app;
