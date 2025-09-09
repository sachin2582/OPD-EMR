const axios = require('axios');

async function testWithJWTToken() {
  try {
    console.log('🧪 Testing with JWT token from database...');
    
    // Use the JWT token from the database
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIwMywidXNlcm5hbWUiOiJkci5zdW5lZXQudmVybWEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MjU4NTQ3MzcsImV4cCI6MTcyNTk0MTEzN30.8QZvKjJhLmNpQrStUvWxYzA1B2C3D4E5F6G7H8I9J0K';
    
    console.log('🔍 Testing URL: http://localhost:3001/api/users/203/doctor-code');
    
    const response = await axios.get('http://localhost:3001/api/users/203/doctor-code', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
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

testWithJWTToken();
