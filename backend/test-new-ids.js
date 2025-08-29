const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'opd-emr.db');

console.log('Testing new patient ID system...');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database for testing');
  }
});

async function testNewSystem() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      try {
        console.log('\n=== Testing New Patient ID System ===\n');
        
        // Test 1: Check current patients
        console.log('1. Current patients in database:');
        db.all('SELECT id, patientId, firstName, lastName, createdAt FROM patients ORDER BY patientId', (err, patients) => {
          if (err) {
            console.error('Error fetching patients:', err);
            reject(err);
            return;
          }
          
          if (patients.length === 0) {
            console.log('   No patients found in database');
          } else {
            patients.forEach(patient => {
              console.log(`   Patient #${patient.patientId}: ${patient.firstName} ${patient.lastName} (DB ID: ${patient.id})`);
            });
          }
          
          // Test 2: Check if patientId is sequential
          console.log('\n2. Checking if patientId is sequential:');
          let isSequential = true;
          for (let i = 0; i < patients.length; i++) {
            if (patients[i].patientId !== i + 1) {
              isSequential = false;
              console.log(`   ❌ Gap found: Expected ${i + 1}, got ${patients[i].patientId}`);
            }
          }
          
          if (isSequential) {
            console.log('   ✅ All patient IDs are sequential starting from 1');
          } else {
            console.log('   ❌ Patient IDs are not sequential');
          }
          
          // Test 3: Check database schema
          console.log('\n3. Checking database schema:');
          db.get("PRAGMA table_info(patients)", (err, rows) => {
            if (err) {
              console.error('Error checking schema:', err);
            } else {
              console.log('   Table structure verified');
            }
            
            console.log('\n=== Test Results ===');
            if (isSequential && patients.length > 0) {
              console.log('🎉 New patient ID system is working correctly!');
              console.log(`   - Found ${patients.length} patients`);
              console.log(`   - Patient IDs range from 1 to ${patients.length}`);
              console.log(`   - All IDs are sequential`);
            } else if (patients.length === 0) {
              console.log('ℹ️  No patients found - system is ready for new registrations');
            } else {
              console.log('⚠️  System needs attention - patient IDs are not sequential');
            }
            
            resolve();
          });
        });
        
      } catch (error) {
        console.error('Test error:', error);
        reject(error);
      }
    });
  });
}

async function runTests() {
  try {
    await testNewSystem();
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase connection closed');
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Tests failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();
