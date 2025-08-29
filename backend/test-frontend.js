const fetch = require('node-fetch');

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API endpoints...\n');
  
  try {
    // Test the lab tests endpoint
    console.log('1. Testing /api/lab-tests/tests?all=true');
    const response = await fetch('http://localhost:5000/api/lab-tests/tests?all=true');
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Total tests: ${data.tests?.length || 0}`);
    
    if (data.tests && data.tests.length > 0) {
      // Check for duplicates in the response
      const testCodes = data.tests.map(t => t.testCode);
      const uniqueCodes = new Set(testCodes);
      
      console.log(`   Unique test codes: ${uniqueCodes.size}`);
      console.log(`   Duplicate test codes: ${testCodes.length - uniqueCodes.size}`);
      
      if (testCodes.length !== uniqueCodes.size) {
        console.log('   ⚠️ Duplicates found in API response!');
        
        // Find the duplicates
        const duplicates = testCodes.filter((code, index) => testCodes.indexOf(code) !== index);
        const uniqueDuplicates = [...new Set(duplicates)];
        console.log('   Duplicate codes:', uniqueDuplicates);
      } else {
        console.log('   ✅ No duplicates in API response');
      }
      
      // Show first few tests
      console.log('\n   First 5 tests:');
      data.tests.slice(0, 5).forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.testCode}: ${test.testName}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testFrontendAPI();
