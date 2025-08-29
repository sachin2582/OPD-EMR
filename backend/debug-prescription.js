const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database/opd-emr.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Debugging lab prescription creation...\n');

async function debugPrescription() {
  try {
    // Step 1: Check if patient exists
    console.log('1️⃣ Checking patient...');
    const patient = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM patients WHERE id = ?', [1], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    console.log('✅ Patient found:', patient ? 'Yes' : 'No');

    // Step 2: Check if doctor exists
    console.log('\n2️⃣ Checking doctor...');
    const doctor = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM doctors WHERE id = ?', [1], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    console.log('✅ Doctor found:', doctor ? 'Yes' : 'No');

    // Step 3: Check if lab tests exist
    console.log('\n3️⃣ Checking lab tests...');
    const tests = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM lab_tests WHERE id IN (4, 5)', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    console.log('✅ Lab tests found:', tests.length);

    // Step 4: Try to create prescription
    console.log('\n4️⃣ Creating prescription...');
    const prescriptionId = 'LAB-PRESC-DEBUG-' + Date.now();
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO lab_prescriptions (
          prescriptionId, patientId, doctorId, prescriptionDate, diagnosis, symptoms, notes, priority
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prescriptionId, 1, 1, '2025-08-26', 'Test', 'Test', 'Test', 'routine'
      ], function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID });
      });
    });
    console.log('✅ Prescription created with ID:', result.lastID);

    // Step 5: Try to create prescription items
    console.log('\n5️⃣ Creating prescription items...');
    for (const test of tests) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO lab_prescription_items (
            prescriptionId, testId, testName, testCode, category, subcategory, price, instructions
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          result.lastID, test.id, test.testName, test.testCode, 
          'Biochemistry', 'Test', test.price || 100, 'Test instructions'
        ], function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID });
        });
      });
      console.log(`✅ Item created for test: ${test.testName}`);
    }

    console.log('\n🎉 All steps completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close();
  }
}

debugPrescription();
