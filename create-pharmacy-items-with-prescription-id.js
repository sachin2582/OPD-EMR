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

async function createPharmacyItemsWithPrescriptionId() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🏥 Creating pharmacy_items table with prescriptionId foreign key...\n');
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');
      
      // First check if pharmacy_items table exists
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='pharmacy_items'", (err, tables) => {
        if (err) {
          console.error('❌ Error checking tables:', err.message);
          reject(err);
          return;
        }
        
        if (tables.length > 0) {
          console.log('⚠️  pharmacy_items table already exists. Checking structure...');
          
          // Check current structure
          db.all("PRAGMA table_info(pharmacy_items)", (err, columns) => {
            if (err) {
              console.error('❌ Error checking pharmacy_items structure:', err.message);
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
            
            // Add prescriptionId column
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
              resolve();
            });
          });
        } else {
          console.log('📝 pharmacy_items table does not exist. Creating with prescriptionId...');
          
          // Create pharmacy_items table with prescriptionId foreign key
          db.run(`
            CREATE TABLE IF NOT EXISTS pharmacy_items (
              item_id INTEGER PRIMARY KEY AUTOINCREMENT,
              sku VARCHAR(50) UNIQUE NOT NULL,
              name VARCHAR(255) NOT NULL,
              generic_name VARCHAR(255),
              brand VARCHAR(255),
              unit VARCHAR(50) NOT NULL,
              item_type VARCHAR(100) NOT NULL,
              hsn_sac VARCHAR(20),
              mrp DECIMAL(10,2) NOT NULL,
              purchase_price DECIMAL(10,2) NOT NULL,
              selling_price DECIMAL(10,2) NOT NULL,
              min_stock INTEGER DEFAULT 0,
              reorder_level INTEGER DEFAULT 0,
              tax_rate DECIMAL(5,2) DEFAULT 0.00,
              is_prescription_required BOOLEAN DEFAULT FALSE,
              barcode VARCHAR(100),
              is_active BOOLEAN DEFAULT TRUE,
              prescriptionId INTEGER,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id)
            )
          `, (err) => {
            if (err) {
              console.error('❌ Error creating pharmacy_items table:', err.message);
              reject(err);
              return;
            }
            
            console.log('✅ pharmacy_items table created successfully with prescriptionId foreign key');
            
            // Create index for prescriptionId
            db.run('CREATE INDEX IF NOT EXISTS idx_pharmacy_items_prescriptionId ON pharmacy_items(prescriptionId)', (err) => {
              if (err) {
                console.error('❌ Error creating prescriptionId index:', err.message);
              } else {
                console.log('✅ Created index on prescriptionId column');
              }
              
              // Verify table structure
              db.all("PRAGMA table_info(pharmacy_items)", (err, columns) => {
                if (err) {
                  console.error('❌ Error verifying table structure:', err.message);
                  reject(err);
                  return;
                }
                
                console.log('\n📋 pharmacy_items table structure:');
                columns.forEach(col => {
                  console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
                });
                
                const prescriptionIdColumn = columns.find(col => col.name === 'prescriptionId');
                if (prescriptionIdColumn) {
                  console.log('\n✅ prescriptionId column successfully added to pharmacy_items table!');
                  console.log('🔗 Foreign key constraint: pharmacy_items.prescriptionId -> prescriptions.id');
                } else {
                  console.log('\n❌ prescriptionId column not found');
                }
                
                resolve();
              });
            });
          });
        }
      });
    });
  });
}

// Run the function
createPharmacyItemsWithPrescriptionId()
  .then(() => {
    console.log('\n🎉 Pharmacy items table setup completed successfully!');
    db.close();
  })
  .catch((error) => {
    console.error('❌ Error setting up pharmacy_items table:', error);
    db.close();
    process.exit(1);
  });
