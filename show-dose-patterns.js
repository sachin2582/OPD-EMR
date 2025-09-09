const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Show all dose patterns
const showAllDosePatterns = () => {
  const selectSQL = `
    SELECT id, dose_value, description_hindi, description_english, category
    FROM dose_pattern
    ORDER BY dose_value
  `;

  db.all(selectSQL, [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching dose patterns:', err.message);
      return;
    }
    
    console.log('\n📋 All Dose Patterns in Database:');
    console.log('=' .repeat(100));
    console.log(`Total Records: ${rows.length}\n`);
    
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id} | Dose: ${row.dose_value} | Hindi: ${row.description_hindi} | English: ${row.description_english}`);
    });
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('\n✅ Database connection closed');
        console.log('\n🎉 Dose patterns are successfully stored in the database!');
      }
    });
  });
};

// Start the process
console.log('🔍 Showing all dose patterns from database...');
showAllDosePatterns();
