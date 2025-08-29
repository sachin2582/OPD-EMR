const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

console.log('=== Checking Database Structure ===');

// Check what tables exist
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, rows) => {
  if (err) {
    console.error('Error getting tables:', err);
  } else {
    console.log('Tables in database:', rows.map(r => r.name));
    
    // Check prescriptions table structure
    if (rows.some(r => r.name === 'prescriptions')) {
      console.log('\n=== Prescriptions Table Structure ===');
      db.all('PRAGMA table_info(prescriptions)', (err, columns) => {
        if (err) {
          console.error('Error getting prescriptions structure:', err);
        } else {
          console.log('Prescriptions columns:', columns.map(c => `${c.name} (${c.type})`));
          
          // Check prescriptions data
          console.log('\n=== Prescriptions Data ===');
          db.all('SELECT * FROM prescriptions LIMIT 3', (err, data) => {
            if (err) {
              console.error('Error getting prescriptions data:', err);
            } else {
              console.log('Prescriptions data:', JSON.stringify(data, null, 2));
            }
            db.close();
          });
        }
      });
    } else {
      console.log('\nNo prescriptions table found!');
      db.close();
    }
  }
});
