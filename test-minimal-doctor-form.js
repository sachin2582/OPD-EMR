// Minimal test to check if the doctor form fields are working
console.log('Testing Doctor Form Fields...');

// Test form data structure
const testFormData = {
  name: 'Dr. Test User',
  specialization: 'Cardiology',
  contactNumber: '9876543210',
  email: 'test@example.com',
  qualification: 'MBBS',
  experienceYears: 5,
  availability: 'Mon-Fri 9AM-5PM',
  username: 'test_doctor',
  password: 'test123'
};

console.log('Form data structure:', testFormData);

// Test API call
async function testDoctorAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/doctors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testFormData)
    });
    
    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('✅ Doctor created successfully!');
      console.log('Doctor ID:', result.doctor.id);
      console.log('Username:', result.doctor.username);
      console.log('User ID:', result.doctor.user_id);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

// Run the test
testDoctorAPI();
