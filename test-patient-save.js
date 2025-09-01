const fetch = require('node-fetch');

async function testPatientSave() {
  try {
    console.log('🧪 Testing patient data save...\n');
    
    const testPatient = {
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-01-01",
      age: 33,
      gender: "Male",
      phone: "1234567890",
      address: "123 Test Street, Test City"
    };
    
    console.log('📝 Test patient data:', testPatient);
    
    const response = await fetch('http://localhost:3001/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPatient)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Patient saved successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Failed to save patient:', response.status, error);
    }
    
  } catch (error) {
    console.error('❌ Error testing patient save:', error.message);
  }
}

// Run the test
testPatientSave();
