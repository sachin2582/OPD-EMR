const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./opd-emr.db');

console.log('🏥 Creating clinic_setup table...');

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
  } else {
    console.log('✅ clinic_setup table created successfully');
    
    // Insert sample clinic data
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
        console.log('✅ Sample clinic data inserted successfully');
        console.log('📊 Clinic ID:', this.lastID);
      }
      db.close();
    });
  }
});
