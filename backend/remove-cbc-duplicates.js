const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Removing duplicate CBC tests...\n');

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
    
    if (cbcTests.length === 0) {
      console.log('✅ No CBC tests found');
      db.close();
      return;
    }
    
    console.log(`📋 Found ${cbcTests.length} CBC-related tests:`);
    cbcTests.forEach((test, index) => {
      console.log(`  ${index + 1}. ID: ${test.id}, Code: ${test.testCode}, Name: ${test.testName}, Price: ₹${test.price}`);
    });
    
    // Find exact duplicates by name
    const testNames = [...new Set(cbcTests.map(t => t.testName))];
    console.log(`\n🔍 Unique test names: ${testNames.length}`);
    
    let totalDeleted = 0;
    
    testNames.forEach(testName => {
      const testsWithSameName = cbcTests.filter(t => t.testName === testName);
      
      if (testsWithSameName.length > 1) {
        console.log(`\n⚠️ Duplicate name found: "${testName}" (${testsWithSameName.length} times)`);
        
        // Keep the first one (lowest ID), delete the rest
        const testsToDelete = testsWithSameName.slice(1);
        const idsToDelete = testsToDelete.map(t => t.id);
        
        console.log(`💾 Keeping: ID ${testsWithSameName[0].id} (${testsWithSameName[0].testCode})`);
        console.log(`🗑️ Deleting: ${testsToDelete.length} duplicate(s)`);
        
        const deleteSql = 'DELETE FROM lab_tests WHERE id IN (' + idsToDelete.map(() => '?').join(',') + ')';
        
        db.run(deleteSql, idsToDelete, function(err) {
          if (err) {
            console.error(`❌ Error deleting duplicates for "${testName}":`, err.message);
          } else {
            console.log(`✅ Deleted ${this.changes} duplicate(s) for "${testName}"`);
            totalDeleted += this.changes;
          }
        });
      }
    });
    
    // Wait for deletions to complete, then show final count
    setTimeout(() => {
      db.get('SELECT COUNT(*) as total FROM lab_tests', (err, result) => {
        if (err) {
          console.error('❌ Error getting final count:', err.message);
        } else {
          console.log(`\n🏁 Final database state: ${result.total} lab tests remaining`);
          console.log(`🗑️ Total duplicates removed: ${totalDeleted}`);
        }
        db.close();
      });
    }, 2000);
  });
});
