const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./backend/opd-emr.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to backend database');
});

// Get all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error getting tables:', err.message);
  } else {
    console.log('Existing tables:');
    tables.forEach(table => {
      console.log('-', table.name);
    });
  }
  
  // Check if pharmacy_items table exists and its structure
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='pharmacy_items'", (err, pharmacyTable) => {
    if (err) {
      console.error('Error checking pharmacy_items table:', err.message);
    } else if (pharmacyTable.length > 0) {
      console.log('\npharmacy_items table exists. Checking structure:');
      db.all("PRAGMA table_info(pharmacy_items)", (err, columns) => {
        if (err) {
          console.error('Error getting pharmacy_items structure:', err.message);
        } else {
          console.log('pharmacy_items columns:');
          columns.forEach(col => {
            console.log(`- ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
          });
        }
        db.close();
      });
    } else {
      console.log('\npharmacy_items table does not exist');
      db.close();
    }
  });
});
