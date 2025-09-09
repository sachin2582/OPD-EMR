const { spawn } = require('child_process');
const path = require('path');
const config = require('./src/config.json');

const environment = process.env.NODE_ENV || 'development';
const envConfig = config[environment];

console.log('🚀 Starting OPD-EMR servers...');
console.log(`📊 Environment: ${environment}`);
console.log(`🌐 Frontend: http://${envConfig.frontend.host}:${envConfig.frontend.port}`);
console.log(`🔧 Backend: http://${envConfig.backend.host}:${envConfig.backend.port}`);

// Start frontend server
console.log('\n📱 Starting frontend server...');
const frontend = spawn('npm', ['start'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: envConfig.frontend.port,
    REACT_APP_API_BASE_URL: envConfig.api.baseUrl
  }
});

// Start backend server
console.log('\n🔧 Starting backend server...');
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
  console.log('\n🛑 Shutting down servers...');
  frontend.kill();
  backend.kill();
  process.exit(0);
});

frontend.on('error', (err) => {
  console.error('❌ Frontend error:', err);
});

backend.on('error', (err) => {
  console.error('❌ Backend error:', err);
});
