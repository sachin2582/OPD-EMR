const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./opd-emr.db');

console.log('🔍 Testing opd-emr.db database...');

// Test the clinic_setup table
db.all('SELECT * FROM clinic_setup WHERE isActive = 1 ORDER BY id DESC LIMIT 1', (err, rows) => {
  if (err) {
    console.error('❌ Error querying clinic_setup:', err);
  } else {
    console.log('✅ Clinic data from opd-emr.db:');
    if (rows.length > 0) {
      console.log(JSON.stringify(rows[0], null, 2));
    } else {
      console.log('No active clinic records found');
    }
  }
  db.close();
});
