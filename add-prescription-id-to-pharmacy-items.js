const sqlite3 = require('sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'opd-emr.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

async function addPrescriptionIdToPharmacyItems() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔧 Adding prescriptionId to pharmacy_items table...\n');
      
      // First, check if the column already exists
      db.all("PRAGMA table_info(pharmacy_items)", (err, columns) => {
        if (err) {
          console.error('❌ Error checking pharmacy_items table structure:', err.message);
          reject(err);
          return;
        }
        
        const hasPrescriptionId = columns.some(col => col.name === 'prescriptionId');
        
        if (hasPrescriptionId) {
          console.log('✅ prescriptionId column already exists in pharmacy_items table');
          resolve();
          return;
        }
        
        console.log('📋 Current pharmacy_items columns:');
        columns.forEach(col => {
          console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
        });
        
        console.log('\n➕ Adding prescriptionId column...');
        
        // Add prescriptionId column to pharmacy_items table
        db.run(`
          ALTER TABLE pharmacy_items 
          ADD COLUMN prescriptionId INTEGER
        `, (err) => {
          if (err) {
            console.error('❌ Error adding prescriptionId column:', err.message);
            reject(err);
            return;
          }
          
          console.log('✅ Successfully added prescriptionId column to pharmacy_items table');
          
          // Add foreign key constraint
          console.log('🔗 Adding foreign key constraint...');
          
          // Note: SQLite doesn't support adding foreign key constraints with ALTER TABLE
          // We need to recreate the table with the foreign key constraint
          console.log('⚠️  SQLite limitation: Cannot add foreign key constraint with ALTER TABLE');
          console.log('📝 Foreign key relationship will be enforced at application level');
          
          // Verify the column was added
          db.all("PRAGMA table_info(pharmacy_items)", (err, newColumns) => {
            if (err) {
              console.error('❌ Error verifying column addition:', err.message);
              reject(err);
              return;
            }
            
            console.log('\n📋 Updated pharmacy_items columns:');
            newColumns.forEach(col => {
              console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
            });
            
            const prescriptionIdColumn = newColumns.find(col => col.name === 'prescriptionId');
            if (prescriptionIdColumn) {
              console.log('\n✅ prescriptionId column successfully added to pharmacy_items table!');
              console.log('📝 Note: Foreign key constraint will be enforced at application level');
            } else {
              console.log('\n❌ Failed to add prescriptionId column');
            }
            
            resolve();
          });
   
        });
      });
    });
  });
}

// Run the function
addPrescriptionIdToPharmacyItems()
  .then(() => {
    console.log('\n🎉 Pharmacy items table updated successfully!');
    db.close();
  })
  .catch((error) => {
    console.error('❌ Error updating pharmacy_items table:', error);
    db.close();
    process.exit(1);
  });
