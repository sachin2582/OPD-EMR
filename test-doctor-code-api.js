const axios = require('axios');

// Test the new doctor code API endpoint
async function testDoctorCodeAPI() {
  try {
    console.log('🧪 Testing Doctor Code API...');
    
    // First, let's login to get a token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'dr.suneet.verma',
      password: '12345'
    });
    
    const loginData = loginResponse.data;
    console.log('✅ Login successful:', loginData.data.user.username);
    
    const token = loginData.data.token;
    const userId = loginData.data.user.id;
    
    // Now test the doctor code API
    const doctorCodeResponse = await axios.get(`http://localhost:3001/api/users/${userId}/doctor-code`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const doctorCodeData = doctorCodeResponse.data;
    console.log('✅ Doctor Code API Response:');
    console.log('   Doctor ID:', doctorCodeData.data.doctor_id);
    console.log('   Doctor Code:', doctorCodeData.data.doctor_code);
    console.log('   Name:', doctorCodeData.data.name);
    console.log('   Specialization:', doctorCodeData.data.specialization);
    console.log('   Qualification:', doctorCodeData.data.qualification);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDoctorCodeAPI();
