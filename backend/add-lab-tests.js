const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('Adding lab test items to existing prescription...');

db.serialize(() => {
  // Get the prescription we just created
  db.get("SELECT id FROM lab_prescriptions WHERE prescriptionId LIKE 'LAB-PRESC-REAL-%' ORDER BY id DESC LIMIT 1", (err, prescription) => {
    if (err || !prescription) {
      console.error('No real prescription found');
      db.close();
      return;
    }
    
    console.log('Found prescription ID:', prescription.id);
    
    // Get some real lab tests
    db.all("SELECT id, testName, testCode, category, price FROM lab_tests LIMIT 3", (err, tests) => {
      if (err || tests.length === 0) {
        console.error('No lab tests found');
        db.close();
        return;
      }
      
      console.log(`Adding ${tests.length} lab tests to prescription...`);
      
      let completed = 0;
      tests.forEach(test => {
        // Use only the columns that exist in the table
        const itemSql = `
          INSERT INTO lab_prescription_items (
            prescriptionId, testId
          ) VALUES (?, ?)
        `;
        
        db.run(itemSql, [prescription.id, test.id], function(err) {
          if (err) {
            console.error('Error adding lab test item:', err);
          } else {
            console.log(`Added lab test: ${test.testName} (${test.testCode})`);
          }
          
          completed++;
          if (completed === tests.length) {
            console.log('\n✅ Lab test items added successfully!');
            console.log('Now check Lab Billing to see real data instead of "Test" values.');
            db.close();
          }
        });
      });
    });
  });
});
