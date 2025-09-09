const axios = require('axios');

async function testFreshToken() {
  try {
    console.log('🧪 Testing with fresh token...');
    
    // First login to get a fresh token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'dr.suneet.verma',
      password: '12345'
    });
    
    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    
    console.log('✅ Fresh login successful');
    console.log('✅ Token:', token.substring(0, 20) + '...');
    console.log('✅ User ID:', userId);
    
    // Test the doctor code API
    const response = await axios.get(`http://localhost:3001/api/users/${userId}/doctor-code`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Doctor Code API Response:');
    console.log('   Doctor ID:', response.data.data.doctor_id);
    console.log('   Doctor Code:', response.data.data.doctor_code);
    console.log('   Name:', response.data.data.name);
    console.log('   Specialization:', response.data.data.specialization);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.statusText);
      console.log('❌ Error data:', error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testFreshToken();
