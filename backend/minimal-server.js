const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import only essential parts
const { initDatabase } = require('./database/database');
const adminRoutes = require('./routes/admin');

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
    message: 'Minimal server running'
  });
});

// Only admin routes for now
app.use('/api/admin', adminRoutes);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Minimal OPD-EMR Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 Admin API: http://localhost:${PORT}/api/admin`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

startServer();

module.exports = app;
