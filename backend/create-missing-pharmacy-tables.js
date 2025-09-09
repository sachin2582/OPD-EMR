const { runQuery, getRow, getAll } = require('./database/database');

async function createMissingPharmacyTables() {
  try {
    console.log('🏥 Creating missing pharmacy tables...\n');
    
    // Create pharmacy_orders table
    console.log('1️⃣ Creating pharmacy_orders table...');
    await runQuery(`
      CREATE TABLE IF NOT EXISTS pharmacy_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId TEXT UNIQUE NOT NULL,
        prescriptionId INTEGER NOT NULL,
        patientId INTEGER NOT NULL,
        doctorId INTEGER NOT NULL,
        orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'ordered',
        priority TEXT DEFAULT 'routine',
        totalAmount DECIMAL(10,2) DEFAULT 0,
        paymentStatus TEXT DEFAULT 'pending',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id),
        FOREIGN KEY (patientId) REFERENCES patients(id),
        FOREIGN KEY (doctorId) REFERENCES doctors(id)
      )
    `);
    console.log('✅ pharmacy_orders table created');
    
    // Create pharmacy_order_items table
    console.log('2️⃣ Creating pharmacy_order_items table...');
    await runQuery(`
      CREATE TABLE IF NOT EXISTS pharmacy_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        itemId INTEGER NOT NULL,
        itemName TEXT NOT NULL,
        itemCode TEXT,
        quantity INTEGER NOT NULL,
        unitPrice DECIMAL(10,2) NOT NULL,
        totalPrice DECIMAL(10,2) NOT NULL,
        instructions TEXT,
        status TEXT DEFAULT 'ordered',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES pharmacy_orders(id),
        FOREIGN KEY (itemId) REFERENCES pharmacy_items(item_id)
      )
    `);
    console.log('✅ pharmacy_order_items table created');
    
    // Create indexes
    console.log('3️⃣ Creating indexes...');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_prescriptionId ON pharmacy_orders(prescriptionId)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_patientId ON pharmacy_orders(patientId)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_pharmacy_order_items_orderId ON pharmacy_order_items(orderId)');
    console.log('✅ Indexes created');
    
    // Verify tables were created
    console.log('4️⃣ Verifying tables...');
    const tables = await getAll("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('pharmacy_orders', 'pharmacy_order_items')");
    console.log('📋 Created tables:', tables.map(t => t.name));
    
    // Check table structures
    console.log('\n📋 pharmacy_orders table structure:');
    const pharmacyOrdersColumns = await getAll("PRAGMA table_info(pharmacy_orders)");
    pharmacyOrdersColumns.forEach(col => {
      console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    console.log('\n📋 pharmacy_order_items table structure:');
    const pharmacyOrderItemsColumns = await getAll("PRAGMA table_info(pharmacy_order_items)");
    pharmacyOrderItemsColumns.forEach(col => {
      console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    console.log('\n🎉 Missing pharmacy tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating pharmacy tables:', error);
  }
}

createMissingPharmacyTables();
