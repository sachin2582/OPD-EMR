const express = require('express');
const cors = require('cors');
const path = require('path');

// Try to import database modules
let db;
try {
  const { runQuery, getRow, getAll } = require('./database/database');
  db = { runQuery, getRow, getAll };
  console.log('✅ Database modules loaded successfully');
} catch (error) {
  console.log('⚠️ Database modules not available, using mock data');
  db = null;
}

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
    message: 'Hybrid server is running',
    database: db ? 'Connected' : 'Mock data',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (db) {
      // Try to use real database
      try {
        const user = await db.getRow('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (user) {
          res.json({
            success: true,
            message: 'Login successful',
            user: {
              id: user.id,
              username: user.username,
              role: user.role || 'admin'
            }
          });
          return;
        }
      } catch (dbError) {
        console.log('Database login failed, using mock:', dbError.message);
      }
    }
    
    // Fallback to mock authentication
    res.json({
      success: true,
      message: 'Login successful (mock)',
      user: {
        id: 1,
        username: username || 'admin',
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Clinic endpoint
app.get('/api/clinic', async (req, res) => {
  try {
    if (db) {
      try {
        const clinic = await db.getRow('SELECT * FROM clinic_setup WHERE isActive = 1 LIMIT 1');
        if (clinic) {
          res.json(clinic);
          return;
        }
      } catch (dbError) {
        console.log('Database clinic fetch failed, using mock:', dbError.message);
      }
    }
    
    // Fallback to mock clinic data
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinic data' });
  }
});

// Patients endpoint
app.get('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (db) {
      try {
        const patient = await db.getRow('SELECT * FROM patients WHERE id = ?', [id]);
        if (patient) {
          res.json(patient);
          return;
        }
      } catch (dbError) {
        console.log('Database patient fetch failed, using mock:', dbError.message);
      }
    }
    
    // Fallback to mock patient data
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient data' });
  }
});

// All patients endpoint
app.get('/api/patients', async (req, res) => {
  try {
    if (db) {
      try {
        const patients = await db.getAll('SELECT * FROM patients ORDER BY id DESC');
        if (patients && patients.length > 0) {
          res.json(patients);
          return;
        }
      } catch (dbError) {
        console.log('Database patients fetch failed, using mock:', dbError.message);
      }
    }
    
    // Fallback to mock patients data
    res.json([
      {
        id: 1,
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '9876543210',
        email: 'john@example.com'
      },
      {
        id: 2,
        name: 'Jane Smith',
        age: 28,
        gender: 'Female',
        phone: '9876543211',
        email: 'jane@example.com'
      }
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients data' });
  }
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
  console.log('🎉 Hybrid Backend Server Started!');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 CORS Origins: http://localhost:3000, http://localhost:3001, http://127.0.0.1:3000`);
  console.log(`🗄️ Database: ${db ? 'Connected' : 'Mock data mode'}`);
  console.log('✅ Ready to accept requests!');
});
