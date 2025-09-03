const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Prisma
const prisma = new PrismaClient();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'OPD-EMR Backend Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const patientCount = await prisma.patient.count();
    res.json({
      success: true,
      message: 'Database connected successfully',
      patientCount: patientCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    console.log('🔍 Fetching patients from database...');
    const patients = await prisma.patient.findMany({
      orderBy: { id: 'desc' }
    });
    
    console.log(`✅ Found ${patients.length} patients`);
    res.json(patients);
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
});

// Get patient by ID
app.get('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('❌ Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient',
      error: error.message
    });
  }
});

// Add new patient
app.post('/api/patients', async (req, res) => {
  try {
    const patientData = req.body;
    console.log('➕ Adding new patient:', patientData);

    const newPatient = await prisma.patient.create({
      data: {
        patientId: Date.now(), // Simple ID generation
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        phone: patientData.phone,
        email: patientData.email,
        age: patientData.age,
        gender: patientData.gender,
        address: patientData.address,
        dateOfBirth: patientData.dateOfBirth
      }
    });

    res.json({
      success: true,
      message: 'Patient added successfully',
      patient: newPatient
    });
  } catch (error) {
    console.error('❌ Error adding patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add patient',
      error: error.message
    });
  }
});

// Delete patient
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.patient.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: error.message
    });
  }
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username, password: password ? '***' : 'missing' });

    // Simple authentication (you can enhance this later)
    if (username === 'admin' && password === 'admin123') {
      // Create proper JWT token using the secret from .env
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

      console.log('✅ JWT token created with secret:', jwtSecret);

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
  console.log(`🚀 Database server running on port ${PORT}`);
  console.log(`🗄️ Connected to opd-emr.db (SQLite)`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Patients API: http://localhost:${PORT}/api/patients`);
  console.log(`🔐 Login API: http://localhost:${PORT}/api/auth/login`);
});

module.exports = app;
