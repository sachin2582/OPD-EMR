// Test script to verify doctor login API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testDoctorLogin() {
  console.log('🧪 Testing Doctor Login API...\n');

  const testCredentials = [
    {
      username: 'dr.suneet.verma',
      password: '12345',
      description: 'Dr. Suneet Verma'
    },
    {
      username: 'admin',
      password: 'admin123',
      description: 'Admin User'
    }
  ];

  for (const cred of testCredentials) {
    console.log(`🔐 Testing login for: ${cred.description}`);
    console.log(`   Username: ${cred.username}`);
    console.log(`   Password: ${cred.password}`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        username: cred.username,
        password: cred.password
      });
      
      if (response.data.success) {
        console.log('✅ Login successful!');
        console.log('📊 Response:', JSON.stringify(response.data, null, 2));
        console.log('🎫 Token received:', response.data.data.token ? 'Yes' : 'No');
        console.log('👤 User role:', response.data.data.user.role);
        console.log('👤 User ID:', response.data.data.user.id);
        console.log('👤 Full Name:', response.data.data.user.fullName);
      } else {
        console.log('❌ Login failed:', response.data.error);
      }
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Login failed:', error.response.data.error || error.response.data.message);
        console.log('📊 Status:', error.response.status);
      } else {
        console.log('❌ Network Error:', error.message);
      }
    }
    
    console.log('─'.repeat(50));
  }
}

// Test if backend is running
async function testBackendHealth() {
  try {
    console.log('🏥 Testing backend health...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend is running:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Backend is not running:', error.message);
    console.log('💡 Make sure to start the backend server with: cd backend && npm start');
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Doctor Login Tests...\n');
  
  const isBackendRunning = await testBackendHealth();
  
  if (isBackendRunning) {
    await testDoctorLogin();
  }
  
  console.log('\n🏁 Tests completed!');
}

// Run the tests
runTests();
