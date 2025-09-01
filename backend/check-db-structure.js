const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'opd-emr.db');
console.log('📊 Checking database structure...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    return;
  }
  
  console.log('✅ Connected to SQLite database');
  
  // Get all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ Error getting tables:', err.message);
    } else {
      console.log('\n📋 Database tables:');
      tables.forEach(table => {
        console.log(`  - ${table.name}`);
      });
      
      // Check if users table exists and show its structure
      if (tables.some(t => t.name === 'users')) {
        console.log('\n👥 Users table structure:');
        db.all("PRAGMA table_info(users)", (err, columns) => {
          if (err) {
            console.error('❌ Error getting users table info:', err.message);
          } else {
            columns.forEach(col => {
              console.log(`  - ${col.name} (${col.type})`);
            });
          }
          db.close();
        });
      } else {
        console.log('\n❌ No users table found');
        db.close();
      }
    }
  });
});
