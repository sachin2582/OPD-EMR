const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(bodyParser.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Working server is running!' });
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

// Simple auth endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  // For now, just return success (you can add real authentication later)
  res.json({ 
    success: true, 
    message: 'Login successful',
    user: { username, role: 'doctor' }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Working server running on port ${PORT}`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`🌐 Also accessible at: http://127.0.0.1:${PORT}/test`);
}).on('error', (err) => {
  console.error('❌ Server error:', err.message);
  console.error('Error code:', err.code);
  console.error('Error details:', err);
});

module.exports = app;
