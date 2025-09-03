const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'opd-emr.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database:', dbPath);
  }
});

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
app.get('/api/test-db', (req, res) => {
  db.get("SELECT COUNT(*) as count FROM Patient", (err, row) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: err.message
      });
    } else {
      res.json({
        success: true,
        message: 'Database connected successfully',
        patientCount: row.count,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Get all patients
app.get('/api/patients', (req, res) => {
  console.log('🔍 Fetching patients from database...');
  
  db.all("SELECT * FROM Patient ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.error('❌ Error fetching patients:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch patients',
        error: err.message
      });
    } else {
      console.log(`✅ Found ${rows.length} patients`);
      res.json(rows);
    }
  });
});

// Get patient by ID
app.get('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT * FROM Patient WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error('❌ Error fetching patient:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch patient',
        error: err.message
      });
    } else if (!row) {
      res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    } else {
      res.json(row);
    }
  });
});

// Add new patient
app.post('/api/patients', (req, res) => {
  const patientData = req.body;
  console.log('➕ Adding new patient:', patientData);

  const sql = `INSERT INTO Patient (patientId, firstName, lastName, phone, email, age, gender, address, dateOfBirth) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const values = [
    Date.now(), // Simple ID generation
    patientData.firstName,
    patientData.lastName,
    patientData.phone,
    patientData.email,
    patientData.age,
    patientData.gender,
    patientData.address,
    patientData.dateOfBirth
  ];

  db.run(sql, values, function(err) {
    if (err) {
      console.error('❌ Error adding patient:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to add patient',
        error: err.message
      });
    } else {
      res.json({
        success: true,
        message: 'Patient added successfully',
        patient: {
          id: this.lastID,
          ...patientData
        }
      });
    }
  });
});

// Delete patient
app.delete('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM Patient WHERE id = ?", [id], function(err) {
    if (err) {
      console.error('❌ Error deleting patient:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to delete patient',
        error: err.message
      });
    } else {
      res.json({
        success: true,
        message: 'Patient deleted successfully'
      });
    }
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
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

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed.');
    }
    process.exit(0);
  });
});

module.exports = app;
