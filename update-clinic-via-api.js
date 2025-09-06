const axios = require('axios');

console.log('🏥 Updating clinic data via API...');

const clinicData = {
  clinicName: 'D"EMR Medical Center',
  address: '123 Healthcare Street',
  city: 'Medical City',
  state: 'MC',
  pincode: '12345',
  phone: '+1-555-0123',
  email: 'info@demr.com',
  website: 'www.demr.com',
  license: 'CLINIC-LICENSE-001',
  registration: 'REG-2024-001',
  prescriptionValidity: 30
};

// First, start the backend server
console.log('🚀 Starting backend server...');
const { spawn } = require('child_process');
const backendProcess = spawn('node', ['server.js'], { 
  cwd: './backend',
  stdio: 'pipe'
});

// Wait for server to start
setTimeout(async () => {
  try {
    console.log('📡 Testing API connection...');
    const response = await axios.post('http://localhost:3001/api/clinic', clinicData);
    console.log('✅ Clinic data updated successfully via API');
    console.log('📊 Response:', response.data);
    
    // Test the GET endpoint
    const getResponse = await axios.get('http://localhost:3001/api/clinic');
    console.log('✅ Verification - Current clinic data:');
    console.log(JSON.stringify(getResponse.data, null, 2));
    
    // Kill the backend process
    backendProcess.kill();
    console.log('🔄 Backend server stopped');
    
  } catch (error) {
    console.error('❌ Error updating clinic data:', error.message);
    if (error.response) {
      console.error('📊 Response data:', error.response.data);
    }
    backendProcess.kill();
  }
}, 5000); // Wait 5 seconds for server to start

// Handle backend process output
backendProcess.stdout.on('data', (data) => {
  console.log('Backend:', data.toString());
});

backendProcess.stderr.on('data', (data) => {
  console.error('Backend Error:', data.toString());
});
