const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./opd-emr.db');

console.log('🔍 Checking all clinic records...');

db.all('SELECT * FROM clinic_setup ORDER BY id DESC', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('📊 All clinic records:');
    rows.forEach((row, i) => {
      console.log(`${i+1}. ID: ${row.id}, Name: ${row.clinicName}, Active: ${row.isActive}`);
    });
  }
  db.close();
});
