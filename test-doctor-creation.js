// Test script to verify doctor creation with username and password
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testDoctorCreation() {
  console.log('🧪 Testing Doctor Creation with Username and Password...\n');

  try {
    // Test data for new doctor
    const doctorData = {
      name: 'Dr. Test User',
      specialization: 'Cardiology',
      contactNumber: '9876543210',
      email: 'test.doctor@example.com',
      qualification: 'MBBS, MD',
      experienceYears: 5,
      availability: 'Mon-Fri 9AM-5PM',
      username: 'test_doctor',
      password: 'test123'
    };

    console.log('📝 Creating doctor with data:', JSON.stringify(doctorData, null, 2));

    // Create doctor
    const response = await axios.post(`${API_BASE_URL}/api/doctors`, doctorData);
    
    if (response.data.success) {
      console.log('✅ Doctor created successfully!');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
      const doctor = response.data.doctor;
      console.log('\n🔍 Doctor Details:');
      console.log(`   Name: ${doctor.name}`);
      console.log(`   Username: ${doctor.username}`);
      console.log(`   Specialization: ${doctor.specialization}`);
      console.log(`   User ID: ${doctor.user_id}`);
      console.log(`   Doctor ID: ${doctor.id}`);
      
      // Test login with the created credentials
      console.log('\n🔐 Testing login with created credentials...');
      const loginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, {
        username: doctorData.username,
        password: doctorData.password
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful!');
        console.log('🎫 Token received:', loginResponse.data.data.token ? 'Yes' : 'No');
        console.log('👤 User role:', loginResponse.data.data.user.role);
      } else {
        console.log('❌ Login failed:', loginResponse.data.error);
      }
      
    } else {
      console.log('❌ Doctor creation failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testDoctorCreation();
