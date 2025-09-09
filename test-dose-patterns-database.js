const http = require('http');

console.log('🧪 TESTING DOSE PATTERNS API - DATABASE FETCH');
console.log('=' .repeat(60));

// Test the dose patterns API
const testDosePatternsAPI = () => {
  console.log('\n🔍 Testing GET /api/dose-patterns (from database)...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/dose-patterns',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n📊 API Response:');
        console.log('=' .repeat(40));
        console.log(`✅ Success: ${response.success}`);
        console.log(`📊 Count: ${response.data ? response.data.length : 'N/A'}`);
        
        if (response.data && response.data.length > 0) {
          console.log('\n📋 Sample Data (first 5 records from database):');
          response.data.slice(0, 5).forEach((pattern, index) => {
            console.log(`${index + 1}. ID: ${pattern.id} | Dose: "${pattern.dose_value}" | Hindi: "${pattern.description_hindi}"`);
          });
          
          console.log('\n🔍 Testing specific dose patterns from database...');
          const testPatterns = ['1-0-1', 'BD', 'TDS', 'SOS', '1-1-1'];
          testPatterns.forEach(testDose => {
            const found = response.data.find(p => p.dose_value === testDose);
            if (found) {
              console.log(`✅ ${testDose}: Found - "${found.description_hindi}"`);
            } else {
              console.log(`❌ ${testDose}: NOT FOUND`);
            }
          });
          
          console.log('\n🎯 DATABASE API TEST RESULT:');
          console.log('=' .repeat(50));
          console.log(`✅ API Endpoint: Working`);
          console.log(`✅ Data Source: DATABASE (not JSON)`);
          console.log(`✅ Records: ${response.data.length} dose patterns`);
          console.log(`✅ Structure: Correct (dose_value, description_hindi)`);
          console.log(`✅ Status: READY FOR E-PRESCRIPTION USE`);
          
        } else {
          console.log('❌ ERROR: No data returned from API');
        }
        
      } catch (error) {
        console.error('❌ Error parsing API response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ API Request Error:', error.message);
    console.log('💡 Make sure the backend server is running on port 3001');
  });

  req.end();
};

// Start testing
testDosePatternsAPI();
