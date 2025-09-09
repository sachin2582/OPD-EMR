const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🔍 CHECKING ALL DATABASE FILES FOR DOSE PATTERNS');
console.log('=' .repeat(60));

// List of possible database files to check
const possibleDbFiles = [
  path.join(__dirname, 'backend', 'opd-emr.db'),
  path.join(__dirname, 'opd-emr.db'),
  path.join(__dirname, 'database', 'opd-emr.db'),
  path.join(__dirname, 'backend', 'database', 'opd-emr.db'),
  path.join(__dirname, 'backend', 'opd-emr.db-shm'),
  path.join(__dirname, 'backend', 'opd-emr.db-wal')
];

// Function to check if a database file exists and has dose_patterns table
const checkDatabaseFile = (dbPath) => {
  return new Promise((resolve) => {
    if (!fs.existsSync(dbPath)) {
      resolve({ path: dbPath, exists: false, hasTable: false, count: 0 });
      return;
    }

    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        resolve({ path: dbPath, exists: true, hasTable: false, count: 0, error: err.message });
        return;
      }

      // Check if dose_patterns table exists
      const checkTableSQL = `SELECT name FROM sqlite_master WHERE type='table' AND name='dose_patterns'`;
      db.get(checkTableSQL, [], (err, row) => {
        if (err) {
          resolve({ path: dbPath, exists: true, hasTable: false, count: 0, error: err.message });
          return;
        }

        if (!row) {
          resolve({ path: dbPath, exists: true, hasTable: false, count: 0 });
          return;
        }

        // Count records in dose_patterns table
        const countSQL = `SELECT COUNT(*) as count FROM dose_patterns`;
        db.get(countSQL, [], (err, result) => {
          if (err) {
            resolve({ path: dbPath, exists: true, hasTable: true, count: 0, error: err.message });
            return;
          }

          resolve({ path: dbPath, exists: true, hasTable: true, count: result.count });
        });
      });
    });
  });
};

// Check all database files
const checkAllDatabases = async () => {
  console.log('🔍 Checking all possible database files...\n');
  
  for (const dbPath of possibleDbFiles) {
    const result = await checkDatabaseFile(dbPath);
    
    console.log(`📁 ${dbPath}`);
    console.log(`   Exists: ${result.exists ? '✅' : '❌'}`);
    
    if (result.exists) {
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      } else {
        console.log(`   Has dose_patterns table: ${result.hasTable ? '✅' : '❌'}`);
        if (result.hasTable) {
          console.log(`   Records count: ${result.count}`);
        }
      }
    }
    console.log('');
  }
  
  // Find the database file with dose patterns
  console.log('🎯 FINDING DATABASE WITH DOSE PATTERNS:');
  console.log('=' .repeat(50));
  
  let foundDb = null;
  for (const dbPath of possibleDbFiles) {
    const result = await checkDatabaseFile(dbPath);
    if (result.exists && result.hasTable && result.count > 0) {
      foundDb = result;
      console.log(`✅ Found dose patterns in: ${dbPath}`);
      console.log(`   Records: ${result.count}`);
      break;
    }
  }
  
  if (!foundDb) {
    console.log('❌ No database file found with dose patterns!');
    return;
  }
  
  // Show sample data from the found database
  console.log('\n📋 SAMPLE DATA FROM FOUND DATABASE:');
  console.log('=' .repeat(50));
  
  const db = new sqlite3.Database(foundDb.path, (err) => {
    if (err) {
      console.error('❌ Error opening found database:', err.message);
      return;
    }
    
    const sampleSQL = `SELECT * FROM dose_patterns LIMIT 5`;
    db.all(sampleSQL, [], (err, rows) => {
      if (err) {
        console.error('❌ Error fetching sample data:', err.message);
        return;
      }
      
      rows.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id} | Dose: "${row.dose_value}" | Hindi: "${row.description_hindi}"`);
      });
      
      db.close();
      
      console.log('\n🔧 SOLUTION:');
      console.log('=' .repeat(30));
      console.log('The dose patterns are in the wrong database file!');
      console.log('We need to copy them to backend/opd-emr.db');
      console.log('Or update the backend to use the correct database file.');
    });
  });
};

// Start checking
checkAllDatabases();
