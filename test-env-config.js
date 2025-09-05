// Test environment configuration
console.log('🔧 Testing Environment Configuration...\n');

// Test Node.js environment variables
console.log('📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('PORT:', process.env.PORT || 'undefined');
console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL || 'undefined');

// Test appConfig
try {
  const appConfig = require('./src/config/appConfig.js').default;
  console.log('\n📊 App Configuration:');
  console.log('API Base URL:', appConfig.apiBaseUrl);
  console.log('App Name:', appConfig.appName);
  console.log('Environment:', appConfig.environment);
} catch (error) {
  console.log('\n❌ Error loading appConfig:', error.message);
}

// Test API configuration
try {
  const api = require('./src/config/api.js').default;
  console.log('\n🌐 API Configuration:');
  console.log('Base URL:', api.defaults.baseURL);
  console.log('Timeout:', api.defaults.timeout);
} catch (error) {
  console.log('\n❌ Error loading API config:', error.message);
}

console.log('\n✅ Environment configuration test completed!');
