const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Clear existing dose patterns and insert new ones
const updateDosePatterns = () => {
  // First, clear existing data
  const clearSQL = `DELETE FROM dose_pattern`;
  
  db.run(clearSQL, (err) => {
    if (err) {
      console.error('❌ Error clearing dose patterns:', err.message);
      return;
    }
    console.log('✅ Cleared existing dose patterns');
    
    // Insert new dose patterns with English values and Hindi descriptions
    insertNewDosePatterns();
  });
};

// Insert new dose patterns
const insertNewDosePatterns = () => {
  const dosePatterns = [
    // Common tablet dosages
    { dose: '1-0-1', hindi: 'सुबह-शाम 1-1 गोली', english: '1 tablet morning and evening' },
    { dose: '1-1-1', hindi: 'दिन में 3 बार 1-1 गोली', english: '1 tablet three times daily' },
    { dose: '0-0-1', hindi: 'रात को 1 गोली', english: '1 tablet at night' },
    { dose: '1-0-0', hindi: 'सुबह 1 गोली', english: '1 tablet in morning' },
    { dose: '0-1-0', hindi: 'दोपहर में 1 गोली', english: '1 tablet at noon' },
    
    // Half dosages
    { dose: '1/2-0-1/2', hindi: 'सुबह-शाम आधी-आधी गोली', english: 'Half tablet morning and evening' },
    { dose: '1/2-1/2-1/2', hindi: 'दिन में 3 बार आधी-आधी गोली', english: 'Half tablet three times daily' },
    { dose: '0-0-1/2', hindi: 'रात को आधी गोली', english: 'Half tablet at night' },
    
    // Double dosages
    { dose: '2-0-2', hindi: 'सुबह-शाम 2-2 गोली', english: '2 tablets morning and evening' },
    { dose: '2-1-2', hindi: 'सुबह-दोपहर-शाम 2-1-2 गोली', english: '2-1-2 tablets daily' },
    { dose: '1-2-1', hindi: 'सुबह-दोपहर-शाम 1-2-1 गोली', english: '1-2-1 tablets daily' },
    
    // Syrup dosages
    { dose: '5ml-0-5ml', hindi: 'सुबह-शाम 5ml-5ml सिरप', english: '5ml syrup morning and evening' },
    { dose: '10ml-0-10ml', hindi: 'सुबह-शाम 10ml-10ml सिरप', english: '10ml syrup morning and evening' },
    { dose: '5ml-5ml-5ml', hindi: 'दिन में 3 बार 5ml-5ml-5ml सिरप', english: '5ml syrup three times daily' },
    { dose: '10ml-10ml-10ml', hindi: 'दिन में 3 बार 10ml-10ml-10ml सिरप', english: '10ml syrup three times daily' },
    
    // Injection dosages
    { dose: '1ml-0-0', hindi: 'सुबह 1ml इंजेक्शन', english: '1ml injection in morning' },
    { dose: '0-0-1ml', hindi: 'रात को 1ml इंजेक्शन', english: '1ml injection at night' },
    { dose: '2ml-0-0', hindi: 'सुबह 2ml इंजेक्शन', english: '2ml injection in morning' },
    { dose: '0-0-2ml', hindi: 'रात को 2ml इंजेक्शन', english: '2ml injection at night' },
    
    // Drops
    { dose: '2-2-2', hindi: 'दिन में 3 बार 2-2-2 बूंदें', english: '2 drops three times daily' },
    { dose: '1-1-1-1', hindi: 'दिन में 4 बार 1-1-1-1 बूंदें', english: '1 drop four times daily' },
    { dose: '3-3-3', hindi: 'दिन में 3 बार 3-3-3 बूंदें', english: '3 drops three times daily' },
    
    // Medical abbreviations
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
    { dose: 'With Food', hindi: 'खाने के साथ', english: 'With food' },
    
    // Additional common patterns
    { dose: '1-1-0', hindi: 'सुबह-दोपहर 1-1 गोली', english: '1 tablet morning and noon' },
    { dose: '0-1-1', hindi: 'दोपहर-शाम 1-1 गोली', english: '1 tablet noon and evening' },
    { dose: '1/2-0-0', hindi: 'सुबह आधी गोली', english: 'Half tablet in morning' },
    { dose: '0-1/2-0', hindi: 'दोपहर में आधी गोली', english: 'Half tablet at noon' },
    { dose: '1.5-0-1.5', hindi: 'सुबह-शाम 1.5-1.5 गोली', english: '1.5 tablets morning and evening' },
    { dose: '0.5-0.5-0.5', hindi: 'दिन में 3 बार 0.5-0.5-0.5 गोली', english: '0.5 tablet three times daily' }
  ];

  const insertSQL = `
    INSERT INTO dose_pattern (dose_value, description_hindi, description_english, category)
    VALUES (?, ?, ?, ?)
  `;

  let completed = 0;
  dosePatterns.forEach((pattern, index) => {
    db.run(insertSQL, [
      pattern.dose,
      pattern.hindi,
      pattern.english,
      'General'
    ], (err) => {
      if (err) {
        console.error(`❌ Error inserting dose pattern ${pattern.dose}:`, err.message);
      } else {
        console.log(`✅ Inserted: ${pattern.dose} - ${pattern.hindi}`);
      }
      
      completed++;
      if (completed === dosePatterns.length) {
        console.log('✅ All dose patterns inserted successfully');
        checkUpdatedDosePatterns();
      }
    });
  });
};

// Check updated dose patterns
const checkUpdatedDosePatterns = () => {
  const selectSQL = `
    SELECT id, dose_value, description_hindi, description_english, category
    FROM dose_pattern
    ORDER BY dose_value
  `;

  db.all(selectSQL, [], (err, rows) => {
    if (err) {
      console.error('❌ Error checking dose patterns:', err.message);
      return;
    }
    
    console.log('\n📋 Updated Dose Patterns in Database:');
    console.log('=' .repeat(100));
    rows.forEach(row => {
      console.log(`ID: ${row.id} | Dose: ${row.dose_value} | Hindi: ${row.description_hindi} | English: ${row.description_english}`);
    });
    console.log(`\n✅ Total dose patterns: ${rows.length}`);
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  });
};

// Start the process
console.log('🚀 Updating dose patterns with English values and Hindi descriptions...');
updateDosePatterns();
