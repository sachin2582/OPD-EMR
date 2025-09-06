const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/opd-emr-new.db');

console.log('🔍 Checking new database contents...');

db.all('SELECT * FROM clinic_setup ORDER BY id DESC', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('📊 Database contents:');
    rows.forEach((row, i) => {
      console.log(`${i+1}. ID: ${row.id}, Name: ${row.clinicName}, Active: ${row.isActive}`);
    });
  }
  db.close();
});
