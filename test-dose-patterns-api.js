const axios = require('axios');

// Test the dose patterns API
const testDosePatternsAPI = async () => {
  const baseURL = 'http://localhost:3001';
  
  console.log('🧪 Testing Dose Patterns API...\n');
  
  try {
    // Test 1: Get all dose patterns
    console.log('1️⃣ Testing GET /api/dose-patterns');
    const response = await axios.get(`${baseURL}/api/dose-patterns`);
    
    if (response.status === 200) {
      console.log('✅ Success! Status:', response.status);
      console.log('📊 Response data:', {
        success: response.data.success,
        count: response.data.count,
        sampleData: response.data.data.slice(0, 3)
      });
      
      // Show sample dose patterns
      console.log('\n📋 Sample Dose Patterns:');
      response.data.data.slice(0, 5).forEach(pattern => {
        console.log(`  • ${pattern.dose_value} - ${pattern.description_hindi} (${pattern.description_english})`);
      });
    } else {
      console.log('❌ Failed! Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
  
  try {
    // Test 2: Search dose patterns
    console.log('\n2️⃣ Testing GET /api/dose-patterns/search/1-0-1');
    const searchResponse = await axios.get(`${baseURL}/api/dose-patterns/search/1-0-1`);
    
    if (searchResponse.status === 200) {
      console.log('✅ Search Success! Status:', searchResponse.status);
      console.log('📊 Search Results:', {
        success: searchResponse.data.success,
        count: searchResponse.data.count,
        query: searchResponse.data.query
      });
      
      if (searchResponse.data.data.length > 0) {
        console.log('🔍 Found patterns:');
        searchResponse.data.data.forEach(pattern => {
          console.log(`  • ${pattern.dose_value} - ${pattern.description_hindi}`);
        });
      }
    } else {
      console.log('❌ Search Failed! Status:', searchResponse.status);
    }
  } catch (error) {
    console.log('❌ Search Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
  
  try {
    // Test 3: Get specific dose pattern
    console.log('\n3️⃣ Testing GET /api/dose-patterns/1');
    const specificResponse = await axios.get(`${baseURL}/api/dose-patterns/1`);
    
    if (specificResponse.status === 200) {
      console.log('✅ Specific Pattern Success! Status:', specificResponse.status);
      console.log('📊 Specific Pattern Data:', specificResponse.data.data);
    } else {
      console.log('❌ Specific Pattern Failed! Status:', specificResponse.status);
    }
  } catch (error) {
    console.log('❌ Specific Pattern Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
  
  console.log('\n🏁 Dose Patterns API Test Complete!');
};

// Run the test
testDosePatternsAPI();
