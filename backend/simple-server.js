const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const dbPath = path.join(__dirname, 'simple.db');
const db = new sqlite3.Database(dbPath);

// Initialize simple database
db.serialize(() => {
  // Create basic tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS pharmacy_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0
    )
  `);
  
  // Insert test user
  db.run(`
    INSERT OR IGNORE INTO users (username, password, role)
    VALUES ('admin', 'admin123', 'admin')
  `);
  
  // Insert test pharmacy items
  db.run(`
    INSERT OR IGNORE INTO pharmacy_items (name, sku, price, stock)
    VALUES ('Paracetamol 500mg', 'MED001', 5.00, 100)
  `);
  
  console.log('✅ Database initialized successfully');
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });
});

app.get('/api/auth/verify', (req, res) => {
  res.json({ valid: true, message: 'Token verification endpoint' });
});

// Pharmacy routes
app.get('/api/pharmacy/items', (req, res) => {
  db.all('SELECT * FROM pharmacy_items', (err, items) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(items);
  });
});

app.post('/api/pharmacy/items', (req, res) => {
  const { name, sku, price, stock } = req.body;
  
  if (!name || !sku || !price) {
    return res.status(400).json({ error: 'Name, SKU, and price required' });
  }
  
  db.run(
    'INSERT INTO pharmacy_items (name, sku, price, stock) VALUES (?, ?, ?, ?)',
    [name, sku, price, stock || 0],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({
        message: 'Item created successfully',
        id: this.lastID
      });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📦 Pharmacy: GET http://localhost:${PORT}/api/pharmacy/items`);
});
