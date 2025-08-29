const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('Cleaning up the test prescription we created...');

db.serialize(() => {
  // Remove the test prescription we created
  db.run("DELETE FROM lab_prescriptions WHERE prescriptionId LIKE 'LAB-PRESC-REAL-%'", function(err) {
    if (err) {
      console.error('Error removing test prescription:', err);
    } else {
      console.log('Removed test prescription with LAB-PRESC-REAL prefix');
    }
    
    // Remove the test patient we created
    db.run("DELETE FROM patients WHERE patientId = 'PAT-001'", function(err) {
      if (err) {
        console.error('Error removing test patient:', err);
      } else {
        console.log('Removed test patient PAT-001');
      }
      
      console.log('\n✅ All test data cleanup completed!');
      console.log('Now you can create real e-prescriptions with lab tests.');
      db.close();
    });
  });
});
