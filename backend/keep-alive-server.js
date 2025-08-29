const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database/database');

const app = express();
const PORT = 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'OPD-EMR Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is working!' });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/clinical-notes', require('./routes/clinical-notes'));

// Keep process alive
process.stdin.resume();

// Start server
async function start() {
  try {
    console.log('🔄 Initializing database...');
    await initDatabase();
    console.log('✅ Database ready');
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log('⚡ Server will stay running!');
    });

    // Keep server alive
    server.on('close', () => {
      console.log('🛑 Server closed');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('🔒 Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('🔒 Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Add error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

start();
