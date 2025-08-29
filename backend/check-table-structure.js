const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Check patients table structure
  console.log('\n=== Patients Table Structure ===');
  db.all('PRAGMA table_info(patients)', (err, columns) => {
    if (err) {
      console.error('Error getting table structure:', err);
    } else {
      console.log('Columns in patients table:');
      columns.forEach(col => {
        console.log(`- ${col.name} (${col.type})`);
      });
    }
    
    // Check prescriptions table structure
    console.log('\n=== Prescriptions Table Structure ===');
    db.all('PRAGMA table_info(prescriptions)', (err, columns) => {
      if (err) {
        console.error('Error getting prescriptions structure:', err);
      } else {
        console.log('Columns in prescriptions table:');
        columns.forEach(col => {
          console.log(`- ${col.name} (${col.type})`);
        });
      }
      
      // Close database
      db.close();
      console.log('\nDatabase connection closed');
    });
  });
});
