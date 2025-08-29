const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/opd-emr.db');

console.log('🔍 Simple database check...\n');

// Check total count
db.get('SELECT COUNT(*) as total FROM lab_tests', (err, result) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log(`📊 Total lab tests: ${result.total}`);
  }
  
  // Check for duplicates
  db.all('SELECT testName, COUNT(*) as count FROM lab_tests GROUP BY testName HAVING COUNT(*) > 1', (err, duplicates) => {
    if (err) {
      console.error('❌ Error checking duplicates:', err);
    } else if (duplicates.length === 0) {
      console.log('✅ No duplicate names found');
    } else {
      console.log('⚠️ Duplicates found:');
      duplicates.forEach(d => console.log(`  "${d.testName}" - ${d.count} times`));
    }
    
    db.close();
  });
});
