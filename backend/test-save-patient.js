const fetch = require('node-fetch');

async function testSavePatient() {
  console.log('🧪 Testing patient data save to database...\n');
  
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
  
  try {
    const response = await fetch('http://localhost:3001/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPatient)
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Patient saved successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      console.log('🎉 Patient ID:', result.patient?.id);
      console.log('🎉 Patient Number:', result.patient?.patientId);
    } else {
      const error = await response.text();
      console.log('❌ Failed to save patient:', response.status);
      console.log('❌ Error:', error);
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testSavePatient();
