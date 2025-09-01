const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const patientRoutes = require('./routes/patients');
const prescriptionRoutes = require('./routes/prescriptions');
const billingRoutes = require('./routes/billing');
const doctorRoutes = require('./routes/doctors');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const clinicalNotesRoutes = require('./routes/clinical-notes');
const adminRoutes = require('./routes/admin');
const labTestRoutes = require('./routes/lab-tests');
const labBillingRoutes = require('./routes/lab-billing');
const icd10Routes = require('./routes/icd10');
const dosePatternsRoutes = require('./routes/dose-patterns');
const pharmacyRoutes = require('./routes/pharmacy');

// Import database
const { initDatabase } = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting - configurable via environment variables
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// CORS configuration - configurable via environment variables
const corsOrigins = process.env.CORS_ORIGIN 
  ? [process.env.CORS_ORIGIN]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: process.env.MAX_FILE_SIZE || '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '10mb' }));

// Static files (for uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    corsOrigins: corsOrigins
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical-notes', clinicalNotesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/lab-billing', labBillingRoutes);
app.use('/api/icd10', icd10Routes);
app.use('/api/dose-patterns', dosePatternsRoutes);
app.use('/api/pharmacy', pharmacyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 [SERVER] Initializing database...');
    console.log('📁 [SERVER] Database path: opd-emr.db');
    console.log('🔗 [SERVER] Database type: SQLite');
    
    await initDatabase();
    console.log('✅ [SERVER] Database initialized successfully');
    
    console.log('🚀 [SERVER] Starting Express server...');
    console.log(`🌐 [SERVER] Port: ${PORT}`);
    console.log(`🌍 [SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    
    app.listen(PORT, () => {
      console.log('🎉 [SERVER] ===========================================');
      console.log('🎉 [SERVER] OPD-EMR Backend Server Started Successfully!');
      console.log('🎉 [SERVER] ===========================================');
      console.log(`🚀 [SERVER] Server running on: http://localhost:${PORT}`);
      console.log(`🔗 [SERVER] Health check: http://localhost:${PORT}/health`);
      console.log(`📡 [SERVER] CORS Origins: ${corsOrigins.join(', ')}`);
      console.log(`🗄️ [SERVER] Database: opd-emr.db (SQLite)`);
      console.log(`⏰ [SERVER] Started at: ${new Date().toISOString()}`);
      console.log('🎉 [SERVER] ===========================================');
      console.log('✅ [SERVER] Ready to accept requests!');
    });
  } catch (error) {
    console.error('❌ [SERVER] Failed to start server:');
    console.error('❌ [SERVER] Error message:', error.message);
    console.error('❌ [SERVER] Error stack:', error.stack);
    console.error('❌ [SERVER] Exiting process...');
    process.exit(1);
  }
}

startServer();

module.exports = app;
