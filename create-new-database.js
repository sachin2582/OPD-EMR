const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🏥 Creating new database with correct clinic data...');

// Backup the old database
const oldDbPath = path.join(__dirname, 'backend', 'opd-emr.db');
const backupPath = path.join(__dirname, 'backend', 'opd-emr-backup.db');

try {
  if (fs.existsSync(oldDbPath)) {
    fs.copyFileSync(oldDbPath, backupPath);
    console.log('✅ Old database backed up to opd-emr-backup.db');
  }
} catch (error) {
  console.log('⚠️ Could not backup old database:', error.message);
}

// Create new database
const newDbPath = path.join(__dirname, 'backend', 'opd-emr-new.db');
const db = new sqlite3.Database(newDbPath);

console.log('📁 Creating new database at:', newDbPath);

// Create clinic_setup table
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

  // Insert clinic data with ID 40 (to match what the API expects)
  const insertSQL = `
    INSERT INTO clinic_setup (
      id, clinicName, address, city, state, pincode, phone, email, website, 
      license, registration, prescriptionValidity, isActive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const clinicData = [
    40,                              // id (to match existing API expectation)
    'D"EMR Medical Center',          // clinicName
    '123 Healthcare Street',         // address
    'Medical City',                  // city
    'MC',                            // state
    '12345',                         // pincode
    '+1-555-0123',                   // phone
    'info@demr.com',                 // email
    'www.demr.com',                  // website
    'CLINIC-LICENSE-001',            // license
    'REG-2024-001',                  // registration
    30,                              // prescriptionValidity
    1                                // isActive
  ];
  
  db.run(insertSQL, clinicData, function(err) {
    if (err) {
      console.error('❌ Error inserting clinic data:', err);
    } else {
      console.log('✅ Clinic data inserted successfully');
      console.log('📊 Clinic ID:', this.lastID);
      
      // Verify the data
      db.all('SELECT * FROM clinic_setup WHERE id = 40', (err, rows) => {
        if (err) {
          console.error('❌ Error verifying data:', err);
        } else {
          console.log('✅ Verification - Clinic data:');
          console.log(JSON.stringify(rows[0], null, 2));
        }
        
        db.close(() => {
          // Replace the old database with the new one
          try {
            if (fs.existsSync(oldDbPath)) {
              fs.unlinkSync(oldDbPath);
            }
            fs.renameSync(newDbPath, oldDbPath);
            console.log('✅ New database file created successfully');
            console.log('🎉 Ready to test the API!');
          } catch (error) {
            console.error('❌ Error replacing database file:', error.message);
          }
        });
      });
    }
  });
});
