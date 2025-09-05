const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔧 Creating lab_tests table...');

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Create lab_tests table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS lab_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  testId TEXT UNIQUE NOT NULL,
  testName TEXT NOT NULL,
  testCode TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  price REAL NOT NULL DEFAULT 0,
  description TEXT,
  preparation TEXT,
  turnaroundTime TEXT,
  isActive INTEGER DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.run(createTableSQL, (err) => {
  if (err) {
    console.error('❌ Error creating table:', err.message);
  } else {
    console.log('✅ lab_tests table created successfully');
    
    // Now run the import
    console.log('📥 Importing lab tests...');
    
    const xlsx = require('xlsx');
    const workbook = xlsx.readFile('Inhouse Tests.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const labTestsData = xlsx.utils.sheet_to_json(worksheet);
    
    console.log('📊 Found', labTestsData.length, 'lab tests in Excel file');
    
    // Clear existing data
    db.run('DELETE FROM lab_tests', (err) => {
      if (err) {
        console.error('❌ Error clearing existing data:', err.message);
        return;
      }
      
      // Insert lab tests
      let completed = 0;
      const total = labTestsData.length;
      
      labTestsData.forEach((test, index) => {
        const {
          'Service_Name': testName,
          'sub_name': subcategory,
          'Price': price,
          'Description': description,
          'Preparation': preparation,
          'Turnaround_Time': turnaroundTime
        } = test;

        const testId = `LT${Date.now().toString().slice(-6)}${index.toString().padStart(3, '0')}`;
        const testCode = `TEST${(index + 1).toString().padStart(3, '0')}`;
        
        let category = 'General';
        if (subcategory) {
          if (subcategory.toLowerCase().includes('pathlab')) {
            category = 'Pathology';
          } else if (subcategory.toLowerCase().includes('radiology')) {
            category = 'Radiology';
          } else if (subcategory.toLowerCase().includes('cardiology')) {
            category = 'Cardiology';
          } else if (subcategory.toLowerCase().includes('neurology')) {
            category = 'Neurology';
          } else {
            category = 'General';
          }
        }

        const sql = `
          INSERT INTO lab_tests (
            testId, testName, testCode, category, subcategory, 
            price, description, preparation, turnaroundTime, 
            isActive, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        const params = [
          testId,
          testName || 'N/A',
          testCode,
          category,
          subcategory || 'General',
          parseFloat(price) || 0,
          description || '',
          preparation || '',
          turnaroundTime || '24-48 hours'
        ];

        db.run(sql, params, function(err) {
          if (err) {
            console.error(`❌ Error inserting test ${index + 1}:`, err.message);
          } else {
            completed++;
            console.log(`✅ Inserted test ${index + 1}: ${testName} (${testCode})`);
            
            if (completed === total) {
              console.log('🎉 Successfully imported all lab tests!');
              
              // Show final count
              db.get('SELECT COUNT(*) as count FROM lab_tests', (err, row) => {
                if (err) {
                  console.error('❌ Error getting final count:', err.message);
                } else {
                  console.log(`📊 Total lab tests in database: ${row.count}`);
                }
                
                db.close((err) => {
                  if (err) {
                    console.error('❌ Error closing database:', err.message);
                  } else {
                    console.log('✅ Database connection closed');
                  }
                });
              });
            }
          }
        });
      });
    });
  }
});
