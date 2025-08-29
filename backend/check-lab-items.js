const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('Checking lab prescription items...');

db.serialize(() => {
  // Check if lab_prescription_items table exists and has data
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='lab_prescription_items'", (err, tables) => {
    if (err) {
      console.error('Error checking tables:', err);
      db.close();
      return;
    }
    
    if (tables.length === 0) {
      console.log('lab_prescription_items table does not exist. Creating it...');
      
      db.run(`
        CREATE TABLE IF NOT EXISTS lab_prescription_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          prescriptionId INTEGER NOT NULL,
          testId INTEGER NOT NULL,
          originalTestName TEXT,
          originalTestCode TEXT,
          quantity INTEGER DEFAULT 1,
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (prescriptionId) REFERENCES lab_prescriptions (id),
          FOREIGN KEY (testId) REFERENCES lab_tests (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err);
        } else {
          console.log('lab_prescription_items table created successfully');
        }
        db.close();
      });
      return;
    }
    
    console.log('lab_prescription_items table exists. Checking for data...');
    
    // Check if there are any items
    db.get("SELECT COUNT(*) as count FROM lab_prescription_items", (err, result) => {
      if (err) {
        console.error('Error counting items:', err);
        db.close();
        return;
      }
      
      console.log(`Found ${result.count} lab prescription items`);
      
      if (result.count === 0) {
        console.log('No items found. Creating test lab prescription items...');
        
        // Get first prescription and first lab test
        db.get("SELECT id FROM lab_prescriptions LIMIT 1", (err, prescription) => {
          if (err || !prescription) {
            console.error('No lab prescriptions found');
            db.close();
            return;
          }
          
          db.get("SELECT id FROM lab_tests LIMIT 1", (err, test) => {
            if (err || !test) {
              console.error('No lab tests found');
              db.close();
              return;
            }
            
            // Create test lab prescription item
            db.run(`
              INSERT INTO lab_prescription_items (prescriptionId, testId, originalTestName, originalTestCode)
              VALUES (?, ?, 'Test Lab Test', 'TEST001')
            `, [prescription.id, test.id], function(err) {
              if (err) {
                console.error('Error creating test item:', err);
              } else {
                console.log('Successfully created test lab prescription item with ID:', this.lastID);
              }
              db.close();
            });
          });
        });
      } else {
        // Show existing items
        db.all("SELECT * FROM lab_prescription_items LIMIT 5", (err, items) => {
          if (err) {
            console.error('Error fetching items:', err);
          } else {
            console.log('Sample lab prescription items:');
            items.forEach(item => {
              console.log(`- ID: ${item.id}, Prescription: ${item.prescriptionId}, Test: ${item.testId}`);
            });
          }
          db.close();
        });
      }
    });
  });
});
