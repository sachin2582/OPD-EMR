const { spawn } = require('child_process');
const path = require('path');
const config = require('./src/config.json');

const environment = process.env.NODE_ENV || 'development';
const envConfig = config[environment];

console.log('🔧 Starting OPD-EMR backend server...');
console.log(`📊 Environment: ${environment}`);
console.log(`🔧 Backend: http://${envConfig.backend.host}:${envConfig.backend.port}`);

// Start backend server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: envConfig.backend.port,
    NODE_ENV: environment
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill();
  process.exit(0);
});

backend.on('error', (err) => {
  console.error('❌ Backend error:', err);
});
