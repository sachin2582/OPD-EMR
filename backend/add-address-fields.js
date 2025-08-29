const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database');
  }
});

async function addAddressFields() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔄 Adding new address fields to patients table...');
      
      // Add city field
      db.run(`
        ALTER TABLE patients ADD COLUMN city TEXT
      `, [], (err) => {
        if (err) {
          if (err.message.includes('duplicate column name')) {
            console.log('✅ City field already exists');
          } else {
            console.error('❌ Error adding city field:', err.message);
          }
        } else {
          console.log('✅ City field added successfully');
        }
      });

      // Add area field
      db.run(`
        ALTER TABLE patients ADD COLUMN area TEXT
      `, [], (err) => {
        if (err) {
          if (err.message.includes('duplicate column name')) {
            console.log('✅ Area field already exists');
          } else {
            console.error('❌ Error adding area field:', err.message);
          }
        } else {
          console.log('✅ Area field added successfully');
        }
      });

      // Add pinCode field
      db.run(`
        ALTER TABLE patients ADD COLUMN pinCode TEXT
      `, [], (err) => {
        if (err) {
          if (err.message.includes('duplicate column name')) {
            console.log('✅ PIN Code field already exists');
          } else {
            console.error('❌ Error adding pinCode field:', err.message);
          }
        } else {
          console.log('✅ PIN Code field added successfully');
        }
      });

      // Close database connection after all operations
      setTimeout(() => {
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('✅ Database connection closed');
          }
          resolve();
        });
      }, 1000);
    });
  });
}

// Run the migration
addAddressFields()
  .then(() => {
    console.log('🎉 Address fields migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
