const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'opd-emr.db');
console.log('📊 Checking pharmacy_items table structure...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    return;
  }
  
  console.log('✅ Connected to SQLite database');
  
  // Check pharmacy_items table structure
  db.all("PRAGMA table_info(pharmacy_items)", (err, columns) => {
    if (err) {
      console.error('❌ Error getting pharmacy_items table info:', err.message);
    } else {
      console.log('\n📋 Pharmacy Items table structure:');
      if (columns.length === 0) {
        console.log('  ❌ No pharmacy_items table found');
      } else {
        columns.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
      }
    }
    
    // Check if table exists
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='pharmacy_items'", (err, tables) => {
      if (err) {
        console.error('❌ Error checking table existence:', err.message);
      } else {
        console.log('\n🔍 Table existence check:');
        if (tables.length === 0) {
          console.log('  ❌ pharmacy_items table does not exist');
        } else {
          console.log('  ✅ pharmacy_items table exists');
        }
      }
      db.close();
    });
  });
});
