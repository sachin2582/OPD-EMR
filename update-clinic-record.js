const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the backend database file
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');
const db = new sqlite3.Database(dbPath);

console.log('🏥 Updating clinic record ID 40 in backend database...');
console.log('📁 Database path:', dbPath);

// Update the existing record with ID 40
const updateSQL = `
  UPDATE clinic_setup 
  SET clinicName = ?, 
      address = ?, 
      city = ?, 
      state = ?, 
      pincode = ?, 
      phone = ?, 
      email = ?, 
      website = ?, 
      license = ?, 
      registration = ?, 
      prescriptionValidity = ?,
      isActive = 1,
      updatedAt = CURRENT_TIMESTAMP
  WHERE id = 40
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
  30                                // prescriptionValidity
];

db.run(updateSQL, clinicData, function(err) {
  if (err) {
    console.error('❌ Error updating clinic record:', err);
  } else {
    console.log('✅ Clinic record updated successfully');
    console.log('📊 Changes made:', this.changes);
    
    if (this.changes === 0) {
      console.log('⚠️ No records were updated. Record with ID 40 might not exist.');
      
      // Try to create the record if it doesn't exist
      const insertSQL = `
        INSERT INTO clinic_setup (
          id, clinicName, address, city, state, pincode, phone, email, website, 
          license, registration, prescriptionValidity, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const insertData = [40, ...clinicData, 1];
      
      db.run(insertSQL, insertData, function(err) {
        if (err) {
          console.error('❌ Error creating clinic record:', err);
        } else {
          console.log('✅ New clinic record created with ID 40');
        }
        db.close();
      });
    } else {
      // Verify the update
      db.all('SELECT * FROM clinic_setup WHERE id = 40', (err, rows) => {
        if (err) {
          console.error('❌ Error verifying update:', err);
        } else {
          console.log('✅ Verification - Updated clinic data:');
          console.log(JSON.stringify(rows[0], null, 2));
        }
        db.close();
      });
    }
  }
});
