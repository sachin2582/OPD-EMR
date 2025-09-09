const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔍 Checking bill_series table...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Check if bill_series table exists
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='bill_series'", [], (err, tables) => {
  if (err) {
    console.error('❌ Error checking for bill_series table:', err.message);
    return;
  }
  
  if (tables.length === 0) {
    console.log('❌ bill_series table does not exist');
    console.log('🔧 Creating bill_series table...');
    
    // Create the table
    db.run(`
      CREATE TABLE bill_series (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        series_name VARCHAR(50) NOT NULL,
        prefix VARCHAR(10) NOT NULL,
        current_number INTEGER DEFAULT 1,
        suffix VARCHAR(10),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, [], function(err) {
      if (err) {
        console.error('❌ Error creating bill_series table:', err.message);
        return;
      }
      console.log('✅ bill_series table created successfully');
      checkTableStructure();
    });
  } else {
    console.log('✅ bill_series table exists');
    checkTableStructure();
  }
});

function checkTableStructure() {
  // Check table structure
  db.all("PRAGMA table_info(bill_series)", [], (err, columns) => {
    if (err) {
      console.error('❌ Error checking table structure:', err.message);
      return;
    }
    
    console.log('\n📋 bill_series table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    // Check current data
    db.all(`
      SELECT 
        id,
        series_name,
        prefix,
        current_number,
        suffix,
        is_active
      FROM bill_series 
      ORDER BY id
    `, [], (err, rows) => {
      if (err) {
        console.error('❌ Error querying bill_series:', err.message);
        return;
      }
      
      console.log('\n📊 Current bill_series data:');
      if (rows.length === 0) {
        console.log('  No data found in bill_series table');
      } else {
        rows.forEach((row, index) => {
          console.log(`${index + 1}. ${row.series_name}: ${row.prefix}${row.current_number}${row.suffix || ''} (Active: ${row.is_active})`);
        });
      }
      
      db.close();
    });
  });
}
