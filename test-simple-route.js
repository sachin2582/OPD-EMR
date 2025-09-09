const axios = require('axios');

async function testSimpleRoute() {
  try {
    console.log('🧪 Testing simple route...');
    
    // First login to get token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'dr.suneet.verma',
      password: '12345'
    });
    
    const token = loginResponse.data.data.token;
    
    console.log('✅ Login successful');
    
    // Test the simple route
    const response = await axios.get('http://localhost:3001/api/users/test-doctor-code', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Simple route response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.statusText);
      console.log('❌ Error data:', error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testSimpleRoute();
