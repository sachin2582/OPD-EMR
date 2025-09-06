const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./opd-emr.db');

console.log('🔍 Checking clinic data in database...');

db.all('SELECT * FROM clinic_setup ORDER BY id DESC LIMIT 5', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('📊 Current clinic data:');
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
