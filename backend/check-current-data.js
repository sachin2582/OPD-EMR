const { runQuery, getRow, getAll } = require('./database/database');

async function checkCurrentData() {
  try {
    console.log('🔍 Checking current item_master data...\n');
    
    // Check total count
    const totalCount = await getRow('SELECT COUNT(*) as count FROM item_master');
    console.log(`📊 Total items in database: ${totalCount.count}`);
    
    // Check sample data
    console.log('\n📋 Sample data from database:');
    const sampleData = await getAll('SELECT item_code, item_name, generic_name, brand, category, subcategory FROM item_master LIMIT 10');
    sampleData.forEach((item, index) => {
      console.log(`${index + 1}. Code: ${item.item_code}, Name: "${item.item_name}", Generic: "${item.generic_name}", Brand: "${item.brand}"`);
      console.log(`   Category: "${item.category}", Subcategory: "${item.subcategory}"`);
      console.log('');
    });
    
    // Check for empty item names
    const emptyNames = await getRow('SELECT COUNT(*) as count FROM item_master WHERE item_name = "" OR item_name IS NULL');
    console.log(`📊 Items with empty names: ${emptyNames.count}`);
    
    // Check for non-empty item names
    const nonEmptyNames = await getRow('SELECT COUNT(*) as count FROM item_master WHERE item_name != "" AND item_name IS NOT NULL');
    console.log(`📊 Items with non-empty names: ${nonEmptyNames.count}`);
    
  } catch (error) {
    console.error('❌ Error checking current data:', error);
  }
}

checkCurrentData();
