console.log('🚀 Starting debug server...');

try {
  console.log('📦 Loading dependencies...');
  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  
  console.log('✅ Dependencies loaded successfully');
  
  const app = express();
  const PORT = 5001;
  
  console.log('🔧 Setting up middleware...');
  
  // Middleware
  app.use(cors());
  app.use(bodyParser.json());
  
  console.log('✅ Middleware setup complete');
  
  // Test route
  app.get('/test', (req, res) => {
    res.json({ message: 'Debug server is working!' });
  });
  
  console.log('🔧 Setting up database connection...');
  
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
  
  console.log('✅ Database connection attempt complete');
  
  console.log('🚀 Attempting to start server on port', PORT);
  
  // Start server
  app.listen(PORT, () => {
    console.log(`🎉 SUCCESS! Server running on port ${PORT}`);
    console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
  }).on('error', (err) => {
    console.error('❌ Server startup error:', err.message);
    console.error('Error code:', err.code);
    console.error('Error details:', err);
  });
  
  console.log('✅ Server startup attempt complete');
  
} catch (error) {
  console.error('❌ CRITICAL ERROR during server startup:');
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('Error type:', error.constructor.name);
}
