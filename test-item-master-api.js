const axios = require('axios');

async function testItemMasterAPI() {
  try {
    console.log('🧪 Testing Item Master API...\n');
    
    // Test search endpoint
    console.log('1️⃣ Testing search endpoint...');
    const searchResponse = await axios.get('http://localhost:3001/api/item-master/search?q=AMARYL&limit=5');
    console.log('✅ Search API Response:');
    console.log(JSON.stringify(searchResponse.data, null, 2));
    
    // Test categories endpoint
    console.log('\n2️⃣ Testing categories endpoint...');
    const categoriesResponse = await axios.get('http://localhost:3001/api/item-master/categories');
    console.log('✅ Categories API Response:');
    console.log(JSON.stringify(categoriesResponse.data, null, 2));
    
    // Test subcategories endpoint
    console.log('\n3️⃣ Testing subcategories endpoint...');
    const subcategoriesResponse = await axios.get('http://localhost:3001/api/item-master/subcategories');
    console.log('✅ Subcategories API Response:');
    console.log(JSON.stringify(subcategoriesResponse.data, null, 2));
    
    console.log('\n🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testItemMasterAPI();
