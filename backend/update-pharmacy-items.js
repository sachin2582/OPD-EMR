const { runQuery, getRow, getAll } = require('./database/database');

async function updatePharmacyItems() {
  try {
    console.log('🔍 Checking pharmacy_items table structure...');
    
    // Check if pharmacy_items table exists
    const tables = await getAll("SELECT name FROM sqlite_master WHERE type='table' AND name='pharmacy_items'");
    
    if (tables.length === 0) {
      console.log('📝 pharmacy_items table does not exist. Creating it...');
      
      // Create pharmacy_items table with prescriptionId
      await runQuery(`
        CREATE TABLE pharmacy_items (
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
      `);
      
      console.log('✅ pharmacy_items table created with prescriptionId foreign key');
    } else {
      console.log('📋 pharmacy_items table exists. Checking structure...');
      
      // Check current structure
      const columns = await getAll("PRAGMA table_info(pharmacy_items)");
      console.log('Current columns:');
      columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
      const hasPrescriptionId = columns.some(col => col.name === 'prescriptionId');
      
      if (!hasPrescriptionId) {
        console.log('\n➕ Adding prescriptionId column...');
        
        // Add prescriptionId column
        await runQuery(`
          ALTER TABLE pharmacy_items 
          ADD COLUMN prescriptionId INTEGER
        `);
        
        console.log('✅ prescriptionId column added to pharmacy_items table');
      } else {
        console.log('✅ prescriptionId column already exists in pharmacy_items table');
      }
    }
    
    // Create index for prescriptionId
    await runQuery('CREATE INDEX IF NOT EXISTS idx_pharmacy_items_prescriptionId ON pharmacy_items(prescriptionId)');
    console.log('✅ Created index on prescriptionId column');
    
    // Verify final structure
    const finalColumns = await getAll("PRAGMA table_info(pharmacy_items)");
    console.log('\n📋 Final pharmacy_items table structure:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Check all tables
    const allTables = await getAll("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('\n📋 All tables in database:');
    allTables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    console.log('\n🎉 Pharmacy items table updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating pharmacy_items table:', error);
  }
}

updatePharmacyItems();
