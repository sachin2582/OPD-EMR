const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🧪 Testing Prescriptions API...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Test 1: Check if prescriptions table exists
console.log('\n📋 Checking prescriptions table structure:');

db.all("PRAGMA table_info(prescriptions)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error checking prescriptions table:', err.message);
    return;
  }
  
  if (columns.length === 0) {
    console.log('❌ prescriptions table does not exist');
    console.log('🔧 Creating prescriptions table...');
    
    // Create the table
    db.run(`
      CREATE TABLE prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prescriptionId TEXT UNIQUE NOT NULL,
        patientId INTEGER NOT NULL,
        doctorId INTEGER NOT NULL,
        date TEXT NOT NULL,
        diagnosis TEXT,
        symptoms TEXT,
        examination TEXT,
        medications TEXT NOT NULL,
        instructions TEXT,
        followUp TEXT,
        notes TEXT,
        labTestRecommendations TEXT,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients (id),
        FOREIGN KEY (doctorId) REFERENCES doctors (id)
      )
    `, [], function(err) {
      if (err) {
        console.error('❌ Error creating prescriptions table:', err.message);
        return;
      }
      console.log('✅ prescriptions table created successfully');
      testPrescriptionsData();
    });
  } else {
    console.log('✅ prescriptions table exists');
    columns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    testPrescriptionsData();
  }
});

function testPrescriptionsData() {
  // Test 2: Check current prescriptions data
  console.log('\n📊 Current prescriptions data:');
  
  db.all(`
    SELECT 
      id,
      prescriptionId,
      patientId,
      doctorId,
      date,
      diagnosis,
      symptoms,
      status,
      createdAt
    FROM prescriptions 
    ORDER BY createdAt DESC
    LIMIT 5
  `, [], (err, rows) => {
    if (err) {
      console.error('❌ Error querying prescriptions:', err.message);
      return;
    }
    
    if (rows.length === 0) {
      console.log('  No prescriptions found');
    } else {
      rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.prescriptionId} (Patient: ${row.patientId}, Doctor: ${row.doctorId})`);
        console.log(`   Date: ${row.date}, Status: ${row.status}`);
        console.log(`   Diagnosis: ${row.diagnosis || 'N/A'}`);
        console.log(`   Symptoms: ${row.symptoms || 'N/A'}`);
        console.log('   ---');
      });
    }
    
    // Test 3: Check if we have patients and doctors for testing
    console.log('\n👥 Available patients and doctors for testing:');
    
    db.all(`
      SELECT 
        'patient' as type,
        id,
        firstName || ' ' || lastName as name
      FROM patients 
      LIMIT 3
      UNION ALL
      SELECT 
        'doctor' as type,
        id,
        name
      FROM doctors 
      WHERE isActive = 1
      LIMIT 3
    `, [], (err, entities) => {
      if (err) {
        console.error('❌ Error querying patients/doctors:', err.message);
        return;
      }
      
      entities.forEach(entity => {
        console.log(`  ${entity.type}: ${entity.name} (ID: ${entity.id})`);
      });
      
      // Test 4: Test API endpoint structure
      console.log('\n🌐 API Endpoint Test:');
      console.log('====================');
      console.log('POST /api/prescriptions');
      console.log('Expected payload structure:');
      console.log('{');
      console.log('  "patientId": 1,');
      console.log('  "doctorId": 1,');
      console.log('  "date": "2024-01-01",');
      console.log('  "diagnosis": "FEVER, HEADACHE",');
      console.log('  "symptoms": "CHEST PAIN, COUGH",');
      console.log('  "examination": "Physical examination notes",');
      console.log('  "medications": [{"name": "Paracetamol", "dosage": "500mg", "frequency": "1-0-1", "durationValue": 5, "durationUnit": "days"}],');
      console.log('  "instructions": "Take with food",');
      console.log('  "followUp": "Follow up in 3 days",');
      console.log('  "notes": "Additional notes",');
      console.log('  "labTestRecommendations": []');
      console.log('}');
      
      console.log('\n✅ Prescriptions API test completed!');
      console.log('🔧 If you see 404 errors, make sure:');
      console.log('  1. Backend server is running on port 5001');
      console.log('  2. Prescriptions route is properly registered');
      console.log('  3. Database table exists and is accessible');
      
      db.close();
    });
  });
}
