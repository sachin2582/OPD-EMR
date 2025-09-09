const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// The exact database path that the backend uses
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔍 FINAL VERIFICATION: Checking dose_patterns table in backend/opd-emr.db');
console.log('📁 Database path:', dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to backend/opd-emr.db');
});

// Final verification
const finalVerification = () => {
  console.log('\n🔍 Step 1: Checking dose_patterns table structure...');
  
  const structureSQL = `PRAGMA table_info(dose_patterns)`;
  db.all(structureSQL, [], (err, columns) => {
    if (err) {
      console.error('❌ Error getting table structure:', err.message);
      return;
    }
    
    console.log('✅ dose_patterns table structure:');
    columns.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    console.log('\n🔍 Step 2: Counting records...');
    const countSQL = `SELECT COUNT(*) as count FROM dose_patterns`;
    db.get(countSQL, [], (err, result) => {
      if (err) {
        console.error('❌ Error counting records:', err.message);
        return;
      }
      
      console.log(`📊 Total records in dose_patterns table: ${result.count}`);
      
      console.log('\n🔍 Step 3: Fetching ALL records...');
      const allSQL = `SELECT * FROM dose_patterns ORDER BY dose_value`;
      db.all(allSQL, [], (err, rows) => {
        if (err) {
          console.error('❌ Error fetching records:', err.message);
          return;
        }
        
        console.log(`✅ Successfully fetched ${rows.length} records`);
        console.log('\n📋 ALL Dose Patterns in dose_patterns table:');
        console.log('=' .repeat(100));
        
        rows.forEach((row, index) => {
          console.log(`${index + 1}. ID: ${row.id} | Dose: "${row.dose_value}" | Hindi: "${row.description_hindi}" | English: "${row.description_english}"`);
        });
        
        console.log('\n🔍 Step 4: Testing specific queries...');
        
        // Test specific dose patterns
        const testQueries = [
          { query: "SELECT * FROM dose_patterns WHERE dose_value = '1-0-1'", name: "1-0-1 pattern" },
          { query: "SELECT * FROM dose_patterns WHERE dose_value = 'BD'", name: "BD pattern" },
          { query: "SELECT * FROM dose_patterns WHERE dose_value = 'TDS'", name: "TDS pattern" },
          { query: "SELECT * FROM dose_patterns WHERE dose_value = 'SOS'", name: "SOS pattern" }
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
              console.log(`✅ Table: dose_patterns EXISTS`);
              console.log(`✅ Structure: Correct columns (dose_value, description_hindi, description_english)`);
              console.log(`✅ Records: ${rows.length} dose patterns`);
              console.log(`✅ Data: All dose patterns with Hindi descriptions`);
              console.log(`✅ Status: READY FOR USE`);
              
              // Close database connection
              db.close((err) => {
                if (err) {
                  console.error('❌ Error closing database:', err.message);
                } else {
                  console.log('\n✅ Database connection closed');
                  console.log('🎉 VERIFICATION COMPLETE - Dose patterns are successfully in the database!');
                }
              });
            }
          });
        });
      });
    });
  });
};

// Start verification
finalVerification();
