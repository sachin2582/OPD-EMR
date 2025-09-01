const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5001; // Changed to 5001 to avoid conflicts

// Database connection
const dbPath = path.join(__dirname, 'opd-emr.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database:', dbPath);
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'OPD-EMR Database Server Running',
    database: dbPath,
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/test-db', (req, res) => {
  db.get('SELECT name FROM sqlite_master WHERE type="table"', (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    } else {
      res.json({ 
        message: 'Database connection successful',
        tables: row ? 'Tables exist' : 'No tables found'
      });
    }
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication for testing
  if (username === 'admin' && password === 'admin') {
    res.json({
      success: true,
      token: 'demo-jwt-token-12345',
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

// Patient routes
app.get('/api/patients', (req, res) => {
  db.all('SELECT * FROM patients LIMIT 100', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    } else {
      res.json({
        success: true,
        patients: rows || []
      });
    }
  });
});

app.post('/api/patients', (req, res) => {
  const patient = req.body;
  const sql = `
    INSERT INTO patients (patientId, firstName, lastName, age, gender, phone, address, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `;
  
  const patientId = 'P' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  db.run(sql, [
    patientId,
    patient.firstName || '',
    patient.lastName || '',
    patient.age || 0,
    patient.gender || '',
    patient.phone || '',
    patient.address || ''
  ], function(err) {
    if (err) {
      res.status(500).json({ error: 'Failed to create patient', details: err.message });
    } else {
      res.json({
        success: true,
        message: 'Patient created successfully',
        patientId: patientId,
        id: this.lastID
      });
    }
  });
});

// Pharmacy routes
app.get('/api/pharmacy/items', (req, res) => {
  db.all('SELECT * FROM pharmacy_items LIMIT 100', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    } else {
      res.json({
        success: true,
        items: rows || []
      });
    }
  });
});

app.post('/api/pharmacy/items', (req, res) => {
  const item = req.body;
  const sql = `
    INSERT INTO pharmacy_items (sku, name, generic_name, brand, unit, item_type, mrp, purchase_price, selling_price, current_stock, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `;
  
  const sku = item.sku || 'SKU' + Date.now();
  
  db.run(sql, [
    sku,
    item.name || '',
    item.generic_name || '',
    item.brand || '',
    item.unit || '',
    item.item_type || 'Medicine',
    item.mrp || 0,
    item.purchase_price || 0,
    item.selling_price || 0,
    item.current_stock || 0
  ], function(err) {
    if (err) {
      res.status(500).json({ error: 'Failed to create item', details: err.message });
    } else {
      res.json({
        success: true,
        message: 'Item created successfully',
        sku: sku,
        id: this.lastID
      });
    }
  });
});

// Supplier routes
app.get('/api/pharmacy/suppliers', (req, res) => {
  db.all('SELECT * FROM pharmacy_suppliers LIMIT 100', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    } else {
      res.json({
        success: true,
        suppliers: rows || []
      });
    }
  });
});

app.post('/api/pharmacy/suppliers', (req, res) => {
  const supplier = req.body;
  const sql = `
    INSERT INTO pharmacy_suppliers (name, contact_person, email, phone, address, gst_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `;
  
  db.run(sql, [
    supplier.name || '',
    supplier.contact_person || '',
    supplier.email || '',
    supplier.phone || '',
    supplier.address || '',
    supplier.gst_number || ''
  ], function(err) {
    if (err) {
      res.status(500).json({ error: 'Failed to create supplier', details: err.message });
    } else {
      res.json({
        success: true,
        message: 'Supplier created successfully',
        id: this.lastID
      });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OPD-EMR Database Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Database test: http://localhost:${PORT}/test-db`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`📊 Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});
