const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '../database/opd-emr.db');

// Connect to database
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking for duplicate lab tests...\n');

// Function to find and remove duplicates
const removeDuplicates = () => {
  return new Promise((resolve, reject) => {
    // First, let's see what we have
    db.all("SELECT testCode, testName, COUNT(*) as count FROM lab_tests GROUP BY testCode, testName HAVING COUNT(*) > 1", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (rows.length === 0) {
        console.log('✅ No duplicate tests found!');
        resolve();
        return;
      }

      console.log('🚨 Found duplicate tests:');
      rows.forEach(row => {
        console.log(`   ${row.testCode} - ${row.testName} (${row.count} times)`);
      });

      console.log('\n🧹 Removing duplicates...');

      // Remove duplicates by keeping only one instance of each test
      const removeQuery = `
        DELETE FROM lab_tests 
        WHERE id NOT IN (
          SELECT MIN(id) 
          FROM lab_tests 
          GROUP BY testCode, testName
        )
      `;

      db.run(removeQuery, function(err) {
        if (err) {
          reject(err);
          return;
        }

        console.log(`✅ Removed ${this.changes} duplicate records`);
        
        // Show final count
        db.get("SELECT COUNT(*) as total FROM lab_tests", (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          console.log(`📊 Total tests remaining: ${row.total}`);
          resolve();
        });
      });
    });
  });
};

// Function to show current test count
const showTestCount = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as total FROM lab_tests", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`📊 Current total tests: ${row.total}`);
      resolve();
    });
  });
};

// Main execution
const main = async () => {
  try {
    await showTestCount();
    await removeDuplicates();
    console.log('\n✅ Duplicate removal completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
};

main();
