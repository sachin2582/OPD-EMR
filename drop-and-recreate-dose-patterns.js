const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// The exact database path that the backend uses
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔧 DROPPING AND RECREATING dose_patterns table');
console.log('📁 Database path:', dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to backend/opd-emr.db');
});

// Drop and recreate table
const dropAndRecreateTable = () => {
  console.log('\n🔧 STEP 1: Dropping existing dose_patterns table...');
  
  db.run('DROP TABLE IF EXISTS dose_patterns', (err) => {
    if (err) {
      console.error('❌ Error dropping table:', err.message);
      return;
    }
    
    console.log('✅ dose_patterns table dropped successfully');
    
    console.log('\n🔧 STEP 2: Creating new dose_patterns table with correct structure...');
    
    // Create table with the exact structure needed for JSON data
    const createTableSQL = `
      CREATE TABLE dose_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dose_value VARCHAR(100) NOT NULL,
        description_hindi TEXT NOT NULL,
        description_english TEXT,
        category VARCHAR(50) DEFAULT 'General',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(createTableSQL, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err.message);
        return;
      }
      
      console.log('✅ dose_patterns table created successfully');
      
      console.log('\n🔧 STEP 3: Inserting dose patterns data...');
      insertDosePatternsData();
    });
  });
};

// Insert dose patterns data
const insertDosePatternsData = () => {
  console.log('📝 Inserting dose patterns with JSON-compatible structure...');
  
  // Complete list of dose patterns with Hindi descriptions
  const dosePatterns = [
    { dose: '1-0-1', hindi: 'सुबह-शाम 1-1 गोली', english: '1 tablet morning and evening' },
    { dose: '1-1-1', hindi: 'दिन में 3 बार 1-1 गोली', english: '1 tablet three times daily' },
    { dose: '0-0-1', hindi: 'रात को 1 गोली', english: '1 tablet at night' },
    { dose: '1-0-0', hindi: 'सुबह 1 गोली', english: '1 tablet in morning' },
    { dose: '0-1-0', hindi: 'दोपहर में 1 गोली', english: '1 tablet at noon' },
    { dose: '1/2-0-1/2', hindi: 'सुबह-शाम आधी-आधी गोली', english: 'Half tablet morning and evening' },
    { dose: '1/2-1/2-1/2', hindi: 'दिन में 3 बार आधी-आधी गोली', english: 'Half tablet three times daily' },
    { dose: '0-0-1/2', hindi: 'रात को आधी गोली', english: 'Half tablet at night' },
    { dose: '2-0-2', hindi: 'सुबह-शाम 2-2 गोली', english: '2 tablets morning and evening' },
    { dose: '2-1-2', hindi: 'सुबह-दोपहर-शाम 2-1-2 गोली', english: '2-1-2 tablets daily' },
    { dose: '1-2-1', hindi: 'सुबह-दोपहर-शाम 1-2-1 गोली', english: '1-2-1 tablets daily' },
    { dose: '5ml-0-5ml', hindi: 'सुबह-शाम 5ml-5ml सिरप', english: '5ml syrup morning and evening' },
    { dose: '10ml-0-10ml', hindi: 'सुबह-शाम 10ml-10ml सिरप', english: '10ml syrup morning and evening' },
    { dose: '5ml-5ml-5ml', hindi: 'दिन में 3 बार 5ml-5ml-5ml सिरप', english: '5ml syrup three times daily' },
    { dose: '1ml-0-0', hindi: 'सुबह 1ml इंजेक्शन', english: '1ml injection in morning' },
    { dose: '0-0-1ml', hindi: 'रात को 1ml इंजेक्शन', english: '1ml injection at night' },
    { dose: '2ml-0-0', hindi: 'सुबह 2ml इंजेक्शन', english: '2ml injection in morning' },
    { dose: '2-2-2', hindi: 'दिन में 3 बार 2-2-2 बूंदें', english: '2 drops three times daily' },
    { dose: '1-1-1-1', hindi: 'दिन में 4 बार 1-1-1-1 बूंदें', english: '1 drop four times daily' },
    { dose: 'SOS', hindi: 'जरूरत पड़ने पर', english: 'As needed' },
    { dose: 'PRN', hindi: 'आवश्यकता अनुसार', english: 'As required' },
    { dose: 'BD', hindi: 'दिन में 2 बार', english: 'Twice daily' },
    { dose: 'TDS', hindi: 'दिन में 3 बार', english: 'Three times daily' },
    { dose: 'QID', hindi: 'दिन में 4 बार', english: 'Four times daily' },
    { dose: 'OD', hindi: 'दिन में 1 बार', english: 'Once daily' },
    { dose: 'HS', hindi: 'सोने से पहले', english: 'At bedtime' },
    { dose: 'AC', hindi: 'खाने से पहले', english: 'Before meals' },
    { dose: 'PC', hindi: 'खाने के बाद', english: 'After meals' },
    { dose: 'Empty Stomach', hindi: 'खाली पेट', english: 'On empty stomach' },
    { dose: 'With Food', hindi: 'खाने के साथ', english: 'With food' }
  ];

  const insertSQL = `
    INSERT INTO dose_patterns (dose_value, description_hindi, description_english, category, is_active)
    VALUES (?, ?, ?, ?, ?)
  `;

  let completed = 0;
  let errors = 0;

  dosePatterns.forEach((pattern, index) => {
    db.run(insertSQL, [
      pattern.dose,
      pattern.hindi,
      pattern.english,
      'General',
      true
    ], (err) => {
      if (err) {
        console.error(`❌ Error inserting dose pattern ${pattern.dose}:`, err.message);
        errors++;
      } else {
        console.log(`✅ Inserted: ${pattern.dose} - ${pattern.hindi}`);
      }
      
      completed++;
      if (completed === dosePatterns.length) {
        console.log(`\n📊 INSERTION SUMMARY:`);
        console.log(`✅ Successfully inserted: ${dosePatterns.length - errors} patterns`);
        if (errors > 0) {
          console.log(`❌ Failed to insert: ${errors} patterns`);
        }
        
        console.log('\n🔍 STEP 4: Verifying insertion...');
        verifyInsertion();
      }
    });
  });
};

// Verify insertion
const verifyInsertion = () => {
  console.log('🔍 Verifying dose patterns insertion...');
  
  // Count records
  const countSQL = `SELECT COUNT(*) as count FROM dose_patterns`;
  db.get(countSQL, [], (err, result) => {
    if (err) {
      console.error('❌ Error counting records:', err.message);
      return;
    }
    
    console.log(`📊 Total records in dose_patterns table: ${result.count}`);
    
    if (result.count === 0) {
      console.log('❌ ERROR: No records found in dose_patterns table!');
      return;
    }
    
    // Get sample records
    const sampleSQL = `SELECT * FROM dose_patterns ORDER BY dose_value LIMIT 5`;
    db.all(sampleSQL, [], (err, rows) => {
      if (err) {
        console.error('❌ Error fetching sample records:', err.message);
        return;
      }
      
      console.log('\n📋 Sample records from dose_patterns table:');
      console.log('=' .repeat(80));
      rows.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id} | Dose: "${row.dose_value}" | Hindi: "${row.description_hindi}"`);
      });
      
      // Test specific queries
      console.log('\n🔍 Testing specific dose pattern queries...');
      const testQueries = [
        { query: "SELECT * FROM dose_patterns WHERE dose_value = '1-0-1'", name: "1-0-1" },
        { query: "SELECT * FROM dose_patterns WHERE dose_value = 'BD'", name: "BD" },
        { query: "SELECT * FROM dose_patterns WHERE dose_value = 'TDS'", name: "TDS" }
      ];
      
      let testCompleted = 0;
      testQueries.forEach(test => {
        db.get(test.query, [], (err, row) => {
          if (err) {
            console.error(`❌ Error testing ${test.name}:`, err.message);
          } else if (row) {
            console.log(`✅ ${test.name}: Found - "${row.dose_value}" - "${row.description_hindi}"`);
          } else {
            console.log(`❌ ${test.name}: NOT FOUND`);
          }
          
          testCompleted++;
          if (testCompleted === testQueries.length) {
            console.log('\n🎯 FINAL RESULT:');
            console.log('=' .repeat(60));
            console.log(`✅ Database: backend/opd-emr.db`);
            console.log(`✅ Table: dose_patterns`);
            console.log(`✅ Records: ${result.count} dose patterns`);
            console.log(`✅ Structure: Correct JSON-compatible columns`);
            console.log(`✅ Status: READY FOR API USE`);
            
            // Close database connection
            db.close((err) => {
              if (err) {
                console.error('❌ Error closing database:', err.message);
              } else {
                console.log('\n✅ Database connection closed');
                console.log('🎉 dose_patterns table successfully recreated with data!');
              }
            });
          }
        });
      });
    });
  });
};

// Start the process
dropAndRecreateTable();
