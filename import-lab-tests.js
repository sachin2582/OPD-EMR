const xlsx = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('📊 Reading Excel file...');
const workbook = xlsx.readFile('Inhouse Tests.xlsx');
console.log('📋 Sheet names:', workbook.SheetNames);

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log('📄 Converting to JSON...');
const labTestsData = xlsx.utils.sheet_to_json(worksheet);

console.log('📊 Found', labTestsData.length, 'lab tests in Excel file');
console.log('📋 Sample data:', labTestsData[0]);

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Function to insert lab test
function insertLabTest(test, index) {
  return new Promise((resolve, reject) => {
    const {
      'Service_Name': testName,
      'sub_name': subcategory,
      'Price': price,
      'Description': description,
      'Preparation': preparation,
      'Turnaround_Time': turnaroundTime
    } = test;

    // Generate unique test ID and test code
    const testId = `LT${Date.now().toString().slice(-6)}${index.toString().padStart(3, '0')}`;
    const testCode = `TEST${(index + 1).toString().padStart(3, '0')}`;
    
    // Determine category based on subcategory
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
        reject(err);
      } else {
        console.log(`✅ Inserted test ${index + 1}: ${testName} (${testCode})`);
        resolve();
      }
    });
  });
}

// Clear existing lab tests first
console.log('🧹 Clearing existing lab tests...');
db.run('DELETE FROM lab_tests', (err) => {
  if (err) {
    console.error('❌ Error clearing lab tests:', err.message);
    return;
  }
  console.log('✅ Cleared existing lab tests');

  // Insert all lab tests
  console.log('📥 Inserting lab tests...');
  
  const insertPromises = labTestsData.map((test, index) => insertLabTest(test, index));
  
  Promise.all(insertPromises)
    .then(() => {
      console.log('🎉 Successfully imported all lab tests!');
      
      // Show summary
      db.get('SELECT COUNT(*) as count FROM lab_tests', (err, row) => {
        if (err) {
          console.error('❌ Error getting count:', err.message);
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
    })
    .catch((error) => {
      console.error('❌ Error importing lab tests:', error);
      db.close();
    });
});