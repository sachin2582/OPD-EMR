const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// List of database files to check
const dbFiles = [
  
  'opd-emr.db',

];

console.log('🔍 Checking all database files for dose_pattern table...\n');

// Function to check a single database
const checkDatabase = (dbFile) => {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, dbFile);
    
    // Check if file exists
    if (!fs.existsSync(dbPath)) {
      console.log(`❌ ${dbFile}: File does not exist`);
      resolve({ file: dbFile, exists: false });
      return;
    }
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.log(`❌ ${dbFile}: Error opening - ${err.message}`);
        resolve({ file: dbFile, error: err.message });
        return;
      }
    });
    
    // Check if dose_pattern table exists
    const checkTableSQL = `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='dose_pattern'
    `;
    
    db.get(checkTableSQL, [], (err, row) => {
      if (err) {
        console.log(`❌ ${dbFile}: Error checking table - ${err.message}`);
        db.close();
        resolve({ file: dbFile, error: err.message });
        return;
      }
      
      if (!row) {
        console.log(`❌ ${dbFile}: dose_pattern table does not exist`);
        db.close();
        resolve({ file: dbFile, tableExists: false });
        return;
      }
      
      // Count records in dose_pattern table
      const countSQL = `SELECT COUNT(*) as count FROM dose_pattern`;
      db.get(countSQL, [], (err, result) => {
        if (err) {
          console.log(`❌ ${dbFile}: Error counting records - ${err.message}`);
          db.close();
          resolve({ file: dbFile, error: err.message });
          return;
        }
        
        console.log(`✅ ${dbFile}: dose_pattern table exists with ${result.count} records`);
        
        // Show sample data if records exist
        if (result.count > 0) {
          const sampleSQL = `SELECT * FROM dose_pattern LIMIT 3`;
          db.all(sampleSQL, [], (err, rows) => {
            if (err) {
              console.log(`❌ ${dbFile}: Error fetching sample data - ${err.message}`);
            } else {
              console.log(`   Sample data:`);
              rows.forEach(row => {
                console.log(`   - ${row.dose_value}: ${row.description_hindi}`);
              });
            }
            
            db.close();
            resolve({ 
              file: dbFile, 
              tableExists: true, 
              recordCount: result.count,
              sampleData: rows
            });
          });
        } else {
          db.close();
          resolve({ 
            file: dbFile, 
            tableExists: true, 
            recordCount: 0
          });
        }
      });
    });
  });
};

// Check all databases
const checkAllDatabases = async () => {
  console.log('📊 Database Files Found:');
  dbFiles.forEach(file => {
    const dbPath = path.join(__dirname, file);
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`   ${file}: ${(stats.size / 1024).toFixed(1)} KB (Modified: ${stats.mtime.toLocaleString()})`);
    } else {
      console.log(`   ${file}: Not found`);
    }
  });
  
  console.log('\n🔍 Checking dose_pattern table in each database:\n');
  
  const results = [];
  for (const dbFile of dbFiles) {
    const result = await checkDatabase(dbFile);
    results.push(result);
  }
  
  console.log('\n📋 Summary:');
  console.log('=' .repeat(60));
  
  const databasesWithData = results.filter(r => r.recordCount > 0);
  const databasesWithTable = results.filter(r => r.tableExists);
  
  if (databasesWithData.length > 0) {
    console.log('✅ Databases with dose_pattern data:');
    databasesWithData.forEach(r => {
      console.log(`   ${r.file}: ${r.recordCount} records`);
    });
  } else {
    console.log('❌ No databases contain dose_pattern data');
  }
  
  if (databasesWithTable.length > 0) {
    console.log('\n📋 Databases with dose_pattern table (but no data):');
    results.filter(r => r.tableExists && r.recordCount === 0).forEach(r => {
      console.log(`   ${r.file}: Table exists but empty`);
    });
  }
  
  console.log('\n🎯 Recommendation:');
  if (databasesWithData.length > 0) {
    console.log(`   Use database: ${databasesWithData[0].file}`);
    console.log(`   Update backend to use this database file`);
  } else {
    console.log('   Need to insert dose_pattern data into the correct database');
  }
};

// Start the process
checkAllDatabases();
