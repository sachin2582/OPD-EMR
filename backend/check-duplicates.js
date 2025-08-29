const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/opd-emr.db');

console.log('🔍 Checking for duplicate lab tests...\n');

// Check for exact duplicates
db.all(`
  SELECT testCode, testName, COUNT(*) as count 
  FROM lab_tests 
  GROUP BY testCode, testName 
  HAVING COUNT(*) > 1
`, (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else if (rows.length === 0) {
    console.log('✅ No exact duplicates found');
  } else {
    console.log('⚠️ Exact duplicates found:');
    rows.forEach(row => {
      console.log(`  ${row.testCode}: ${row.testName} (${row.count} times)`);
    });
  }
  
  // Check for similar test codes
  db.all(`
    SELECT testCode, testName, COUNT(*) as count 
    FROM lab_tests 
    GROUP BY testCode 
    HAVING COUNT(*) > 1
  `, (err2, rows2) => {
    if (err2) {
      console.error('❌ Error:', err2);
    } else if (rows2.length === 0) {
      console.log('\n✅ No duplicate test codes found');
    } else {
      console.log('\n⚠️ Duplicate test codes found:');
      rows2.forEach(row => {
        console.log(`  ${row.testCode} (${row.count} times)`);
      });
    }
    
    // Show total count
    db.get('SELECT COUNT(*) as total FROM lab_tests', (err3, row3) => {
      if (err3) {
        console.error('❌ Error:', err3);
      } else {
        console.log(`\n📊 Total lab tests in database: ${row3.total}`);
      }
      db.close();
    });
  });
});
