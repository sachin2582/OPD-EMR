const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(bodyParser.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Database server is working!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database connection
const dbPath = path.join(__dirname, 'opd-emr.db');
console.log('📊 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Hash password function
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Auth endpoint for login - REAL DATABASE AUTHENTICATION
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  const hashedPassword = hashPassword(password);
  
  // Query the users table for real authentication
  const query = `
    SELECT id, userId, username, fullName, email, phone, role, department, isActive, permissions
    FROM users 
    WHERE username = ? AND password = ? AND isActive = 1
  `;
  
  db.get(query, [username, hashedPassword], (err, user) => {
    if (err) {
      console.error('❌ Database query error:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error during authentication' 
      });
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
    // Generate a simple token (you can enhance this with JWT later)
    const token = crypto.randomBytes(32).toString('hex');
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        permissions: user.permissions
      }
    });
  });
});

// Get user profile
app.get('/api/auth/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // For now, just return success (you can add token validation later)
  res.json({ 
    success: true, 
    message: 'Token valid' 
  });
});

// Pharmacy endpoints
app.get('/api/pharmacy/items', (req, res) => {
  const query = 'SELECT * FROM pharmacy_items ORDER BY name';
  
  db.all(query, (err, items) => {
    if (err) {
      console.error('❌ Error fetching pharmacy items:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ success: true, items: items || [] });
  });
});

app.post('/api/pharmacy/items', (req, res) => {
  const {
    name, item_type, generic_name, purchase_price, selling_price, min_stock, 
    reorder_level, unit, barcode, brand, is_prescription_required, tax_rate
  } = req.body;
  
  console.log('📥 Received pharmacy item data:', req.body);
  
  if (!name || !item_type || !selling_price) {
    return res.status(400).json({ error: 'Name, item_type, and selling_price are required' });
  }
  
  const query = `
    INSERT INTO pharmacy_items (
      sku, name, generic_name, brand, unit, item_type, hsn_sac,
      mrp, purchase_price, selling_price, min_stock, reorder_level,
      tax_rate, is_prescription_required, barcode, is_active,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, DATETIME('now'), DATETIME('now'))
  `;
  
  // Generate a unique SKU
  const sku = 'MED' + Date.now().toString().slice(-6);
  
  const params = [
    sku, name, generic_name || '', brand || 'Generic', unit || 'Piece', item_type, '3004',
    parseFloat(selling_price), parseFloat(purchase_price || selling_price), parseFloat(selling_price), 
    parseInt(min_stock || 0), parseInt(reorder_level || 10),
    parseFloat(tax_rate || 0), is_prescription_required ? 1 : 0, barcode || ''
  ];
  
  console.log('📊 Executing query with params:', params);
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('❌ Error adding pharmacy item:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log('✅ Item added successfully with ID:', this.lastID);
    
    res.json({ 
      success: true, 
      message: 'Item added successfully',
      itemId: this.lastID 
    });
  });
});

app.get('/api/pharmacy/suppliers', (req, res) => {
  const query = 'SELECT * FROM pharmacy_suppliers ORDER BY name';
  
  db.all(query, (err, suppliers) => {
    if (err) {
      console.error('❌ Error fetching suppliers:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ success: true, suppliers: suppliers || [] });
  });
});

app.post('/api/pharmacy/suppliers', (req, res) => {
  const { name, contact_person, email, phone, address, rating, status } = req.body;
  
  if (!name || !contact_person || !phone) {
    return res.status(400).json({ error: 'Name, contact person, and phone are required' });
  }
  
  const query = `
    INSERT INTO pharmacy_suppliers (
      name, contact_person, email, phone, address, rating, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, DATETIME('now'), DATETIME('now'))
  `;
  
  const params = [name, contact_person, email, phone, address, rating || 0, status || 'active'];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('❌ Error adding supplier:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ 
      success: true, 
      message: 'Supplier added successfully',
      supplierId: this.lastID 
    });
  });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Database server running on port ${PORT}`);
  console.log(`🔗 Test endpoint: http://127.0.0.1:${PORT}/test`);
  console.log(`🔗 Health check: http://127.0.0.1:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://127.0.0.1:${PORT}/api/auth/login`);
  console.log(`👤 Profile endpoint: http://127.0.0.1:${PORT}/api/auth/profile`);
  console.log(`✅ Using REAL DATABASE authentication`);
}).on('error', (err) => {
  console.error('❌ Server error:', err.message);
  console.error('Error code:', err.code);
});

module.exports = app;
