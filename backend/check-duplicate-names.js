const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/opd-emr.db');

console.log('🔍 Checking for duplicate lab test names...\n');

db.all(`
  SELECT testName, COUNT(*) as count 
  FROM lab_tests 
  GROUP BY testName 
  HAVING COUNT(*) > 1
  ORDER BY count DESC
`, (err, duplicates) => {
  if (err) {
    console.error('❌ Error:', err);
  } else if (duplicates.length === 0) {
    console.log('✅ No duplicate test names found!');
  } else {
    console.log('⚠️ Found duplicate test names:');
    duplicates.forEach(dup => {
      console.log(`  "${dup.testName}" - appears ${dup.count} times`);
    });
  }
  
  // Also show total count
  db.get('SELECT COUNT(*) as total FROM lab_tests', (err, result) => {
    if (err) {
      console.error('❌ Error getting count:', err);
    } else {
      console.log(`\n📊 Total lab tests in database: ${result.total}`);
    }
    db.close();
  });
});
