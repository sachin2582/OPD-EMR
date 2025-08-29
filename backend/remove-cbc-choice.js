const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 CBC Test Choice - Which one to keep?\n');

const dbPath = path.join(__dirname, 'database', 'opd-emr.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  
  console.log('✅ Connected to database');
  
  // Find all CBC tests
  db.all('SELECT id, testCode, testName, price, category, subcategory FROM lab_tests WHERE testName LIKE "%CBC%" OR testCode LIKE "%CBC%"', (err, cbcTests) => {
    if (err) {
      console.error('❌ Error finding CBC tests:', err.message);
      db.close();
      return;
    }
    
    console.log('📋 Current CBC tests:');
    cbcTests.forEach((test, index) => {
      console.log(`  ${index + 1}. ID: ${test.id}, Code: ${test.testCode}, Name: ${test.testName}, Price: ₹${test.price}`);
    });
    
    console.log('\n💡 Recommendation: Keep the more descriptive one (ID 77: CBC001)');
    console.log('   - It has a unique code (CBC001)');
    console.log('   - Lower price (₹250)');
    console.log('   - More standardized naming');
    
    // Remove the less preferred one (ID 226: CBC)
    const idToDelete = 226; // The one with just "CBC" code
    
    console.log(`\n🗑️ Removing ID ${idToDelete} (Code: CBC, Price: ₹800)...`);
    
    db.run('DELETE FROM lab_tests WHERE id = ?', [idToDelete], function(err) {
      if (err) {
        console.error('❌ Error deleting CBC test:', err.message);
      } else {
        console.log(`✅ Successfully deleted CBC test (ID: ${idToDelete})`);
        
        // Show final count
        db.get('SELECT COUNT(*) as total FROM lab_tests', (err, result) => {
          if (err) {
            console.error('❌ Error getting final count:', err.message);
          } else {
            console.log(`\n🏁 Final database state: ${result.total} lab tests remaining`);
          }
          db.close();
        });
      }
    });
  });
});
