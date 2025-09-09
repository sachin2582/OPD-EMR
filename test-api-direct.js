const axios = require('axios');

async function testDirectAPI() {
  try {
    console.log('🧪 Testing API endpoint directly...');
    
    // First login to get token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'dr.suneet.verma',
      password: '12345'
    });
    
    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    console.log('✅ User ID:', userId);
    
    // Test the doctor code API directly
    const url = `http://localhost:3001/api/users/${userId}/doctor-code`;
    console.log('🔍 Testing URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.statusText);
      console.log('❌ Error data:', error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testDirectAPI();
