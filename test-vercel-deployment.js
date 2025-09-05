/**
 * Vercel Deployment Test Script
 * This script tests your deployed OPD-EMR system without affecting local code
 */

const https = require('https');

// Configuration - Update this with your actual Vercel URL
const VERCEL_URL = 'https://your-app-name.vercel.app'; // Replace with your actual Vercel URL

// Test functions
async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📍 URL: ${url}`);
    
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          console.log(`✅ SUCCESS: ${response.statusCode} - ${description}`);
          try {
            const jsonData = JSON.parse(data);
            console.log(`📊 Response:`, jsonData);
          } catch (e) {
            console.log(`📄 Response: ${data.substring(0, 100)}...`);
          }
          resolve(true);
        } else {
          console.log(`❌ FAILED: ${response.statusCode} - ${description}`);
          console.log(`📄 Response: ${data}`);
          resolve(false);
        }
      });
    });
    
    request.on('error', (error) => {
      console.log(`❌ ERROR: ${error.message} - ${description}`);
      resolve(false);
    });
    
    request.setTimeout(10000, () => {
      console.log(`⏰ TIMEOUT: ${description}`);
      request.destroy();
      resolve(false);
    });
  });
}

// Main test function
async function runTests() {
  console.log('🚀 OPD-EMR Vercel Deployment Test');
  console.log('=====================================');
  console.log(`🎯 Testing deployment at: ${VERCEL_URL}`);
  console.log('⏰ This will test your deployed system without affecting local code\n');
  
  const tests = [
    {
      url: `${VERCEL_URL}/api/health`,
      description: 'API Health Check'
    },
    {
      url: `${VERCEL_URL}/api/doctors`,
      description: 'Doctors API Endpoint'
    },
    {
      url: `${VERCEL_URL}/api/patients`,
      description: 'Patients API Endpoint'
    },
    {
      url: `${VERCEL_URL}/api/doctors/stats/overview`,
      description: 'Doctors Statistics API'
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description);
    if (result) passedTests++;
    
    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Your OPD-EMR deployment is working correctly!');
    console.log(`🌐 Frontend: ${VERCEL_URL}`);
    console.log(`🔗 API Base: ${VERCEL_URL}/api`);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('🔧 Check your Vercel deployment configuration');
    console.log('📖 See VERCEL_DEPLOYMENT_GUIDE.md for troubleshooting');
  }
  
  console.log('\n📋 Manual Tests to Perform:');
  console.log('1. Visit your Vercel URL in browser');
  console.log('2. Test login functionality');
  console.log('3. Test patient management');
  console.log('4. Test doctor management');
  console.log('5. Test prescription system');
  console.log('6. Test billing system');
}

// Instructions
console.log('📖 Instructions:');
console.log('1. Deploy your app to Vercel first');
console.log('2. Update VERCEL_URL variable in this script with your actual URL');
console.log('3. Run: node test-vercel-deployment.js');
console.log('4. This script will test your deployed system without affecting local code\n');

// Run tests if VERCEL_URL is updated
if (VERCEL_URL.includes('your-app-name')) {
  console.log('⚠️  Please update VERCEL_URL variable with your actual Vercel deployment URL');
  console.log('Example: https://opd-emr-abc123.vercel.app');
} else {
  runTests().catch(console.error);
}

