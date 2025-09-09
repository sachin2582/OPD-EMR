const http = require('http');

console.log('🧪 Testing Doctor Patients API...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/doctors/patients',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`📡 Response Status: ${res.statusCode}`);
  console.log(`📡 Response Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📊 Response Body:');
    console.log('================');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success && jsonData.data) {
        console.log(`\n✅ Found ${jsonData.data.length} patients with completed billing`);
        if (jsonData.data.length > 0) {
          console.log('\n📋 Patient Details:');
          jsonData.data.forEach((patient, index) => {
            console.log(`${index + 1}. ${patient.firstName} ${patient.lastName} (ID: ${patient.patientId})`);
            console.log(`   Status: ${patient.status}`);
            console.log(`   Bill Amount: ₹${patient.billAmount}`);
            console.log(`   Has Prescription: ${patient.hasPrescription}`);
          });
        }
      } else {
        console.log('❌ API returned unsuccessful response');
      }
    } catch (error) {
      console.log('❌ Error parsing JSON response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.end();
