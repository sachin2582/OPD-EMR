const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🏥 Updating original opd-emr.db with correct clinic data...');

// Use the original database file
const dbPath = path.join(__dirname, 'opd-emr.db');
const db = new sqlite3.Database(dbPath);

console.log('📁 Database path:', dbPath);

// First, check if clinic_setup table exists
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='clinic_setup'", (err, rows) => {
  if (err) {
    console.error('❌ Error checking tables:', err);
    db.close();
    return;
  }

  if (rows.length === 0) {
    console.log('📋 Creating clinic_setup table...');
    
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS clinic_setup (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clinicName TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      website TEXT,
      license TEXT,
      registration TEXT,
      prescriptionValidity INTEGER DEFAULT 30,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `;

    db.run(createTableSQL, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err);
        db.close();
        return;
      }
      console.log('✅ clinic_setup table created');
      insertClinicData();
    });
  } else {
    console.log('✅ clinic_setup table already exists');
    insertClinicData();
  }
});

function insertClinicData() {
  // First, deactivate all existing records
  db.run('UPDATE clinic_setup SET isActive = 0', (err) => {
    if (err) {
      console.error('❌ Error deactivating existing records:', err);
      db.close();
      return;
    }
    console.log('🔄 Deactivated existing clinic records');

    // Insert new clinic data
    const insertDataSQL = `
      INSERT INTO clinic_setup (
        clinicName, address, city, state, pincode, phone, email, website, 
        license, registration, prescriptionValidity, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const clinicData = [
      'D"EMR Medical Center',           // clinicName
      '123 Healthcare Street',          // address
      'Medical City',                   // city
      'MC',                             // state
      '12345',                          // pincode
      '+1-555-0123',                    // phone
      'info@demr.com',                  // email
      'www.demr.com',                   // website
      'CLINIC-LICENSE-001',             // license
      'REG-2024-001',                   // registration
      30,                               // prescriptionValidity
      1                                 // isActive
    ];
    
    db.run(insertDataSQL, clinicData, function(err) {
      if (err) {
        console.error('❌ Error inserting clinic data:', err);
      } else {
        console.log('✅ New clinic data inserted successfully');
        console.log('📊 New Clinic ID:', this.lastID);
        
        // Verify the data
        db.all('SELECT * FROM clinic_setup WHERE isActive = 1 ORDER BY id DESC LIMIT 1', (err, rows) => {
          if (err) {
            console.error('❌ Error verifying data:', err);
          } else {
            console.log('✅ Verification - Active clinic data:');
            console.log(JSON.stringify(rows[0], null, 2));
          }
          db.close();
        });
      }
    });
  });
}
