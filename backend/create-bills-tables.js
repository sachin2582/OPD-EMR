const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔧 Creating bills tables...');

const dbPath = path.join(__dirname, 'opd-emr.db');
const db = new sqlite3.Database(dbPath);

// Create bills table
const createBillsTable = `
  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    billNumber TEXT UNIQUE NOT NULL,
    billDate TEXT NOT NULL,
    patientId TEXT NOT NULL,
    patientName TEXT NOT NULL,
    patientPhone TEXT,
    patientAddress TEXT,
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0,
    discountAmount REAL DEFAULT 0,
    total REAL NOT NULL,
    paymentMethod TEXT DEFAULT 'CASH',
    notes TEXT,
    status TEXT DEFAULT 'PAID',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create bill_items table
const createBillItemsTable = `
  CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    billId INTEGER NOT NULL,
    serviceName TEXT NOT NULL,
    serviceType TEXT DEFAULT 'GENERAL',
    quantity INTEGER NOT NULL,
    unitPrice REAL NOT NULL,
    totalPrice REAL NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (billId) REFERENCES bills (id) ON DELETE CASCADE
  )
`;

// Create indexes for better performance
const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_bills_billNumber ON bills(billNumber)',
  'CREATE INDEX IF NOT EXISTS idx_bills_patientId ON bills(patientId)',
  'CREATE INDEX IF NOT EXISTS idx_bills_createdAt ON bills(createdAt)',
  'CREATE INDEX IF NOT EXISTS idx_bill_items_billId ON bill_items(billId)'
];

db.serialize(() => {
  // Create bills table
  db.run(createBillsTable, (err) => {
    if (err) {
      console.error('❌ Error creating bills table:', err);
    } else {
      console.log('✅ Bills table created successfully');
    }
  });

  // Create bill_items table
  db.run(createBillItemsTable, (err) => {
    if (err) {
      console.error('❌ Error creating bill_items table:', err);
    } else {
      console.log('✅ Bill_items table created successfully');
    }
  });

  // Create indexes
  createIndexes.forEach((indexSQL, i) => {
    db.run(indexSQL, (err) => {
      if (err) {
        console.error(`❌ Error creating index ${i + 1}:`, err);
      } else {
        console.log(`✅ Index ${i + 1} created successfully`);
      }
    });
  });

  // Verify tables were created
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('bills', 'bill_items')", (err, tables) => {
    if (err) {
      console.error('❌ Error verifying tables:', err);
    } else {
      console.log('📋 Created tables:', tables.map(t => t.name));
    }
    db.close();
  });
});
