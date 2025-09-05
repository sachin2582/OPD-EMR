const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔧 Updating all lab test prices to 200...');

// Create a new database connection with different options
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database successfully');
});

// Use WAL mode to reduce locking issues
db.run('PRAGMA journal_mode=WAL', (err) => {
  if (err) {
    console.error('❌ Error setting WAL mode:', err.message);
  } else {
    console.log('✅ Set WAL mode');
  }
});

// Set busy timeout
db.run('PRAGMA busy_timeout=30000', (err) => {
  if (err) {
    console.error('❌ Error setting busy timeout:', err.message);
  } else {
    console.log('✅ Set busy timeout to 30 seconds');
  }
});

// Update prices
console.log('🔄 Updating prices...');
db.run('UPDATE lab_tests SET price = 200, updatedAt = CURRENT_TIMESTAMP', function(err) {
  if (err) {
    console.error('❌ Error updating prices:', err.message);
  } else {
    console.log(`✅ Successfully updated ${this.changes} lab test prices to 200`);
    
    // Verify the update
    db.get('SELECT COUNT(*) as total, COUNT(CASE WHEN price = 200 THEN 1 END) as updated_count FROM lab_tests', (err, row) => {
      if (err) {
        console.error('❌ Error verifying update:', err.message);
      } else {
        console.log(`📊 Verification Results:`);
        console.log(`   Total lab tests: ${row.total}`);
        console.log(`   Tests with price 200: ${row.updated_count}`);
        console.log(`   Success rate: ${((row.updated_count / row.total) * 100).toFixed(1)}%`);
      }
      
      // Close database
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('🔒 Database connection closed');
        }
        process.exit(0);
      });
    });
  }
});
