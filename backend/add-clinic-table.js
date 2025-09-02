const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ [DATABASE] Error opening database:', err.message);
  } else {
    console.log('✅ [DATABASE] Connected to SQLite database successfully');
    console.log('📁 [DATABASE] Database path:', dbPath);
  }
});

// Function to run SQL queries
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    console.log('🔍 [DATABASE] Executing query:', sql);
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ [DATABASE] Query failed:', err.message);
        reject(err);
      } else {
        console.log('✅ [DATABASE] Query executed successfully');
        console.log('📊 [DATABASE] Last ID:', this.lastID);
        console.log('📊 [DATABASE] Changes:', this.changes);
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Function to check if table exists
function checkTableExists(tableName) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name=?";
    db.get(sql, [tableName], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(!!row);
      }
    });
  });
}

async function addClinicTable() {
  try {
    console.log('🚀 Starting clinic_setup table creation...');
    
    // Check if table already exists
    const tableExists = await checkTableExists('clinic_setup');
    
    if (tableExists) {
      console.log('ℹ️ [DATABASE] clinic_setup table already exists');
      return;
    }
    
    // Create clinic_setup table
    console.log('📝 [DATABASE] Creating clinic_setup table...');
    await runQuery(`
      CREATE TABLE clinic_setup (
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
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ [DATABASE] clinic_setup table created successfully');
    
    // Insert default clinic setup
    console.log('📝 [DATABASE] Inserting default clinic setup...');
    await runQuery(`
      INSERT INTO clinic_setup (clinicName, address, city, state, pincode, phone, email, website, license, registration, prescriptionValidity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Your Clinic Name',
      'Your Clinic Address', 
      'Your City',
      'Your State',
      '123456',
      'Your Phone Number',
      'clinic@email.com',
      'www.yourclinic.com',
      'CLINIC-LICENSE-001',
      'REG-001',
      30
    ]);
    
    console.log('✅ [DATABASE] Default clinic setup inserted successfully');
    console.log('🎉 [DATABASE] Clinic setup table creation completed!');
    
  } catch (error) {
    console.error('❌ [DATABASE] Error creating clinic_setup table:', error);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('❌ [DATABASE] Error closing database:', err.message);
      } else {
        console.log('✅ [DATABASE] Database connection closed');
      }
    });
  }
}

// Run the script
addClinicTable();
