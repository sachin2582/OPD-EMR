const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./opd-emr.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to database');
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
  
  // Get prescriptions table schema
  db.all("PRAGMA table_info(prescriptions)", (err, columns) => {
    if (err) {
      console.error('Error getting prescriptions schema:', err.message);
    } else {
      console.log('\nPrescriptions table schema:');
      columns.forEach(col => {
        console.log(`- ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
    }
    
    db.close();
  });
});
