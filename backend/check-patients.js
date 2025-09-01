const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'opd-emr.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to database');
  }
});

db.all("SELECT COUNT(*) as count FROM patients", (err, result) => {
  if (err) {
    console.error('❌ Error counting patients:', err.message);
  } else {
    console.log(`\n👥 Total patients in database: ${result[0].count}`);
  }
});

db.all("SELECT id, patientId, firstName, lastName, phone, createdAt FROM patients ORDER BY createdAt DESC", (err, patients) => {
  if (err) {
    console.error('❌ Error fetching patients:', err.message);
  } else {
    console.log('\n📋 All patients:');
    console.log('================');
    if (patients.length === 0) {
      console.log('No patients found in database');
    } else {
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. ID: ${patient.id} | Patient#: ${patient.patientId} | Name: ${patient.firstName} ${patient.lastName} | Phone: ${patient.phone} | Created: ${patient.createdAt}`);
      });
    }
  }
  
  db.close();
});
