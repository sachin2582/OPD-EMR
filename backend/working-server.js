const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Basic middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Working server running'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Working server test endpoint working!' });
});

// Start server first
app.listen(PORT, () => {
  console.log(`🚀 Working Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  
  // Now try to initialize database
  console.log('🔄 Attempting to initialize database...');
  
  try {
    const { initDatabase } = require('./database/database');
    initDatabase().then(() => {
      console.log('✅ Database initialized successfully');
      
      // Now try to load routes one by one
      console.log('🔄 Loading routes...');
      
      try {
        // Test admin routes first
        const adminRoutes = require('./routes/admin');
        app.use('/api/admin', adminRoutes);
        console.log('✅ Admin routes loaded successfully');
        
        // Test other routes
        try {
          const authRoutes = require('./routes/auth');
          app.use('/api/auth', authRoutes);
          console.log('✅ Auth routes loaded successfully');
        } catch (e) {
          console.log('⚠️ Auth routes failed:', e.message);
        }
        
        try {
          const patientRoutes = require('./routes/patients');
          app.use('/api/patients', patientRoutes);
          console.log('✅ Patient routes loaded successfully');
        } catch (e) {
          console.log('⚠️ Patient routes failed:', e.message);
        }
        
        console.log(`🔗 Admin API: http://localhost:${PORT}/api/admin`);
        console.log(`🔗 Auth API: http://localhost:${PORT}/api/auth`);
        console.log(`🔗 Patient API: http://localhost:${PORT}/api/patients`);
        
      } catch (routeError) {
        console.error('❌ Failed to load routes:', routeError);
        console.error('Route error details:', routeError.stack);
      }
    }).catch((dbError) => {
      console.error('❌ Failed to initialize database:', dbError);
      console.error('Database error details:', dbError.stack);
    });
  } catch (importError) {
    console.error('❌ Failed to import database module:', importError);
    console.error('Import error details:', importError.stack);
  }
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Error stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
