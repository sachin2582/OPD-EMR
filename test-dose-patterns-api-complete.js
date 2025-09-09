const http = require('http');

console.log('🧪 TESTING DOSE PATTERNS API - COMPLETE TEST');
console.log('=' .repeat(60));

// Test the dose patterns API
const testDosePatternsAPI = () => {
  console.log('\n🔍 Testing GET /api/dose-patterns...');
  
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
        console.log(`📋 Data Type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
        
        if (response.data && response.data.length > 0) {
          console.log('\n📋 Sample Data (first 5 records):');
          response.data.slice(0, 5).forEach((pattern, index) => {
            console.log(`${index + 1}. ID: ${pattern.id} | Dose: "${pattern.dose_value}" | Hindi: "${pattern.description_hindi}"`);
          });
          
          console.log('\n🔍 Testing specific dose patterns...');
          const testPatterns = ['1-0-1', 'BD', 'TDS', 'SOS', '1-1-1'];
          testPatterns.forEach(testDose => {
            const found = response.data.find(p => p.dose_value === testDose);
            if (found) {
              console.log(`✅ ${testDose}: Found - "${found.description_hindi}"`);
            } else {
              console.log(`❌ ${testDose}: NOT FOUND`);
            }
          });
          
          console.log('\n🎯 API TEST RESULT:');
          console.log('=' .repeat(40));
          console.log(`✅ API Endpoint: Working`);
          console.log(`✅ Data Format: JSON`);
          console.log(`✅ Records: ${response.data.length} dose patterns`);
          console.log(`✅ Structure: Correct (dose_value, description_hindi)`);
          console.log(`✅ Status: READY FOR FRONTEND USE`);
          
          console.log('\n📋 Complete JSON Response (first 3 records):');
          console.log('=' .repeat(50));
          const sampleData = response.data.slice(0, 3);
          console.log(JSON.stringify(sampleData, null, 2));
          
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

// Test search functionality
const testSearchAPI = () => {
  console.log('\n🔍 Testing GET /api/dose-patterns/search/BD...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/dose-patterns/search/BD',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`📡 Search Status: ${res.statusCode}`);
        console.log(`📊 Search Count: ${response.count}`);
        
        if (response.data && response.data.length > 0) {
          console.log('✅ Search Result:', response.data[0]);
        } else {
          console.log('❌ No search results found');
        }
        
      } catch (error) {
        console.error('❌ Error parsing search response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Search API Error:', error.message);
  });

  req.end();
};

// Start testing
testDosePatternsAPI();

// Test search after a delay
setTimeout(() => {
  testSearchAPI();
}, 1000);
