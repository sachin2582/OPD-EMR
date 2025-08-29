const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('Cleaning up test data...');

db.serialize(() => {
  // Remove test lab prescription items first (due to foreign key constraints)
  db.run("DELETE FROM lab_prescription_items WHERE prescriptionId = 6", function(err) {
    if (err) {
      console.error('Error removing test prescription items:', err);
    } else {
      console.log('Removed test prescription items');
    }
    
    // Remove test lab prescription
    db.run("DELETE FROM lab_prescriptions WHERE id = 6", function(err) {
      if (err) {
        console.error('Error removing test prescription:', err);
      } else {
        console.log('Removed test prescription (ID: 6)');
      }
      
      // Remove test patient (if no other prescriptions exist)
      db.run("DELETE FROM patients WHERE id = 1 AND NOT EXISTS (SELECT 1 FROM lab_prescriptions WHERE patientId = 1)", function(err) {
        if (err) {
          console.error('Error removing test patient:', err);
        } else {
          console.log('Removed test patient (ID: 1)');
        }
        
        console.log('\n✅ Test data cleanup completed!');
        console.log('Now you can create real e-prescriptions with lab tests.');
        db.close();
      });
    });
  });
});
