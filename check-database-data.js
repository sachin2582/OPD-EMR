const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'opd-emr.db');

console.log('🔍 Checking database data...');
console.log('📁 Database path:', dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to database successfully');
  }
});

// Check patients table
db.all("SELECT COUNT(*) as count FROM patients", (err, result) => {
  if (err) {
    console.error('❌ Error counting patients:', err.message);
  } else {
    console.log(`\n👥 Total patients in database: ${result[0].count}`);
  }
});

// Get all patients
db.all("SELECT id, patientId, firstName, lastName, phone, createdAt FROM patients ORDER BY createdAt DESC LIMIT 10", (err, patients) => {
  if (err) {
    console.error('❌ Error fetching patients:', err.message);
  } else {
    console.log('\n📋 Recent patients:');
    console.log('==================');
    if (patients.length === 0) {
      console.log('No patients found in database');
    } else {
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. ID: ${patient.id} | Patient#: ${patient.patientId} | Name: ${patient.firstName} ${patient.lastName} | Phone: ${patient.phone} | Created: ${patient.createdAt}`);
      });
    }
  }
});

// Check database tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Error getting tables:', err.message);
  } else {
    console.log('\n📊 Database tables:');
    console.log('==================');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name}`);
    });
  }
  
  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('\n✅ Database connection closed');
    }
  });
});
