// Debug script to test prescription saving
console.log('🔍 DEBUGGING PRESCRIPTION SAVE ISSUE');

// Test data that matches what the frontend sends
const testPrescriptionData = {
  patientId: 1,
  doctorId: 1,
  date: "2025-09-07",
  diagnosis: "Test diagnosis",
  symptoms: "Test symptoms", 
  examination: "Test examination",
  medications: [
    {
      name: "Test medicine",
      dosage: "1-0-1",
      durationValue: "7",
      durationUnit: "days"
    }
  ],
  instructions: "Test instructions",
  followUp: "Test followup",
  labTestRecommendations: []
};

console.log('📋 Test prescription data:', JSON.stringify(testPrescriptionData, null, 2));

// Test the API call
fetch('/api/prescriptions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPrescriptionData),
})
.then(response => {
  console.log('📡 Response status:', response.status);
  console.log('📡 Response headers:', response.headers);
  
  if (!response.ok) {
    console.error('❌ Response not OK:', response.status, response.statusText);
    return response.text().then(text => {
      console.error('❌ Error response body:', text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    });
  }
  
  return response.json();
})
.then(data => {
  console.log('✅ Success response:', data);
})
.catch(error => {
  console.error('❌ Error:', error);
});

console.log('🚀 Test request sent to /api/prescriptions');
