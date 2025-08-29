const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '../database/opd-emr.db');

// Connect to database
const db = new sqlite3.Database(dbPath);

console.log('🧹 Cleaning up confusing duplicate lab tests...\n');

// Function to remove confusing duplicates
const cleanupConfusingTests = () => {
  return new Promise((resolve, reject) => {
    // List of tests to remove (keeping the standardized versions)
    const testsToRemove = [
      // Remove short codes, keep standardized ones
      { testCode: 'CBC', reason: 'Duplicate of CBC001' },
      { testCode: 'FBG', reason: 'Duplicate of GLU001' },
      { testCode: 'LIPID', reason: 'Duplicate of LIPID001' },
      
      // Remove redundant tissue biopsy tests, keep the main one
      { testCode: 'LCTB001', reason: 'Redundant with TB001' },
      { testCode: 'LTB001', reason: 'Redundant with TB001' },
      { testCode: 'MTB001', reason: 'Redundant with TB001' },
      { testCode: 'STB001', reason: 'Redundant with TB001' }
    ];

    console.log('🗑️  Tests to be removed:');
    testsToRemove.forEach(test => {
      console.log(`   [${test.testCode}] - ${test.reason}`);
    });

    console.log('\n🧹 Removing confusing tests...');

    let removedCount = 0;
    let currentIndex = 0;

    const removeNext = () => {
      if (currentIndex >= testsToRemove.length) {
        console.log(`\n✅ Cleanup completed! Removed ${removedCount} tests.`);
        resolve();
        return;
      }

      const test = testsToRemove[currentIndex];
      
      db.run("DELETE FROM lab_tests WHERE testCode = ?", [test.testCode], function(err) {
        if (err) {
          console.error(`❌ Error removing ${test.testCode}:`, err);
        } else {
          if (this.changes > 0) {
            removedCount += this.changes;
            console.log(`   ✅ Removed [${test.testCode}] - ${test.reason}`);
          } else {
            console.log(`   ⚠️  [${test.testCode}] not found in database`);
          }
        }
        
        currentIndex++;
        removeNext();
      });
    };

    removeNext();
  });
};

// Function to show final test count
const showFinalCount = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as total FROM lab_tests", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`\n📊 Final total tests: ${row.total}`);
      resolve();
    });
  });
};

// Function to verify no more confusing tests
const verifyCleanup = () => {
  return new Promise((resolve, reject) => {
    const verifyQuery = `
      SELECT t1.testCode as code1, t1.testName as name1, t1.category as cat1,
             t2.testCode as code2, t2.testName as name2, t2.category as cat2
      FROM lab_tests t1
      JOIN lab_tests t2 ON t1.id < t2.id
      WHERE (
        (t1.testCode = t2.testCode AND t1.testName != t2.testName) OR
        (t1.testName = t2.testName AND t1.testCode != t2.testCode)
      )
      ORDER BY t1.testCode, t1.testName
    `;

    db.all(verifyQuery, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (rows.length === 0) {
        console.log('✅ Verification passed: No more confusing similar tests!');
      } else {
        console.log('⚠️  Still found some similar tests:');
        rows.forEach((row, index) => {
          console.log(`   ${index + 1}. [${row.code1}] ${row.name1} vs [${row.code2}] ${row.name2}`);
        });
      }

      resolve();
    });
  });
};

// Main execution
const main = async () => {
  try {
    await cleanupConfusingTests();
    await showFinalCount();
    await verifyCleanup();
    console.log('\n🎉 Cleanup and verification completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
};

main();
