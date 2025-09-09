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

async function createPharmacyLabRelationships() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');

      console.log('🏥 Creating pharmacy_orders table...');
      
      // Create pharmacy_orders table
      db.run(`
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
      `, (err) => {
        if (err) {
          console.error('❌ Error creating pharmacy_orders table:', err.message);
        } else {
          console.log('✅ pharmacy_orders table created successfully');
        }
      });

      console.log('💊 Creating pharmacy_order_items table...');
      
      // Create pharmacy_order_items table
      db.run(`
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
      `, (err) => {
        if (err) {
          console.error('❌ Error creating pharmacy_order_items table:', err.message);
        } else {
          console.log('✅ pharmacy_order_items table created successfully');
        }
      });

      console.log('🔬 Updating lab_orders table to ensure proper foreign key...');
      
      // Check if lab_orders table exists and has proper foreign key
      db.run(`
        CREATE TABLE IF NOT EXISTS lab_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId TEXT UNIQUE NOT NULL,
          prescriptionId INTEGER NOT NULL,
          patientId INTEGER NOT NULL,
          doctorId INTEGER NOT NULL,
          orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'ordered',
          priority TEXT DEFAULT 'routine',
          clinicalNotes TEXT,
          instructions TEXT,
          totalAmount DECIMAL(10,2) DEFAULT 0,
          paymentStatus TEXT DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id),
          FOREIGN KEY (patientId) REFERENCES patients(id),
          FOREIGN KEY (doctorId) REFERENCES doctors(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating/updating lab_orders table:', err.message);
        } else {
          console.log('✅ lab_orders table created/updated successfully');
        }
      });

      console.log('🧪 Creating lab_order_items table...');
      
      // Create lab_order_items table
      db.run(`
        CREATE TABLE IF NOT EXISTS lab_order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId INTEGER NOT NULL,
          testId INTEGER NOT NULL,
          testName TEXT NOT NULL,
          testCode TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'ordered',
          clinicalNotes TEXT,
          instructions TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (orderId) REFERENCES lab_orders(id),
          FOREIGN KEY (testId) REFERENCES lab_tests(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating lab_order_items table:', err.message);
        } else {
          console.log('✅ lab_order_items table created successfully');
        }
      });

      // Create indexes for better performance
      console.log('📊 Creating indexes...');
      
      db.run('CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_prescriptionId ON pharmacy_orders(prescriptionId)', (err) => {
        if (err) console.error('❌ Error creating pharmacy_orders index:', err.message);
        else console.log('✅ pharmacy_orders prescriptionId index created');
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_patientId ON pharmacy_orders(patientId)', (err) => {
        if (err) console.error('❌ Error creating pharmacy_orders patientId index:', err.message);
        else console.log('✅ pharmacy_orders patientId index created');
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_pharmacy_order_items_orderId ON pharmacy_order_items(orderId)', (err) => {
        if (err) console.error('❌ Error creating pharmacy_order_items index:', err.message);
        else console.log('✅ pharmacy_order_items orderId index created');
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_lab_orders_prescriptionId ON lab_orders(prescriptionId)', (err) => {
        if (err) console.error('❌ Error creating lab_orders index:', err.message);
        else console.log('✅ lab_orders prescriptionId index created');
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_lab_order_items_orderId ON lab_order_items(orderId)', (err) => {
        if (err) console.error('❌ Error creating lab_order_items index:', err.message);
        else console.log('✅ lab_order_items orderId index created');
      });

      // Verify tables were created
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('pharmacy_orders', 'pharmacy_order_items', 'lab_orders', 'lab_order_items')", (err, tables) => {
        if (err) {
          console.error('❌ Error checking tables:', err.message);
          reject(err);
        } else {
          console.log('📋 Created tables:', tables.map(t => t.name));
          resolve();
        }
      });
    });
  });
}

// Run the function
createPharmacyLabRelationships()
  .then(() => {
    console.log('✅ All pharmacy and lab relationships created successfully!');
    db.close();
  })
  .catch((error) => {
    console.error('❌ Error creating relationships:', error);
    db.close();
    process.exit(1);
  });
