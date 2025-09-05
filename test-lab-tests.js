const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'opd-emr.db');

console.log('🔍 Testing lab tests in database...');

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Check lab tests count
db.get('SELECT COUNT(*) as count FROM lab_tests', (err, row) => {
  if (err) {
    console.error('❌ Error getting count:', err.message);
  } else {
    console.log(`📊 Total lab tests in database: ${row.count}`);
  }
  
  // Get sample lab tests
  db.all('SELECT testName, testCode, category, price FROM lab_tests LIMIT 5', (err, rows) => {
    if (err) {
      console.error('❌ Error getting sample tests:', err.message);
    } else {
      console.log('📋 Sample lab tests:');
      rows.forEach((test, index) => {
        console.log(`${index + 1}. ${test.testName} (${test.testCode}) - ${test.category} - ₹${test.price}`);
      });
    }
    
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  });
});
