const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '../database/opd-emr.db');

// Connect to database
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking for similar lab tests that might cause confusion...\n');

// Function to find similar tests
const findSimilarTests = () => {
  return new Promise((resolve, reject) => {
    // Check for tests with similar names
    const similarQuery = `
      SELECT t1.testCode as code1, t1.testName as name1, t1.category as cat1,
             t2.testCode as code2, t2.testName as name2, t2.category as cat2
      FROM lab_tests t1
      JOIN lab_tests t2 ON t1.id < t2.id
      WHERE (
        (t1.testCode = t2.testCode AND t1.testName != t2.testName) OR
        (t1.testName = t2.testName AND t1.testCode != t2.testCode) OR
        (t1.testCode LIKE '%' || t2.testCode || '%' AND t1.testCode != t2.testCode) OR
        (t1.testName LIKE '%' || t2.testName || '%' AND t1.testName != t2.testName)
      )
      ORDER BY t1.testCode, t1.testName
    `;

    db.all(similarQuery, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (rows.length === 0) {
        console.log('✅ No similar tests found!');
        resolve();
        return;
      }

      console.log('🚨 Found potentially confusing similar tests:');
      rows.forEach((row, index) => {
        console.log(`\n${index + 1}. Similar Tests:`);
        console.log(`   Test 1: [${row.code1}] ${row.name1} (${row.cat1})`);
        console.log(`   Test 2: [${row.code2}] ${row.name2} (${row.cat2})`);
      });

      resolve();
    });
  });
};

// Function to show test distribution by category
const showTestDistribution = () => {
  return new Promise((resolve, reject) => {
    const distQuery = `
      SELECT category, COUNT(*) as count
      FROM lab_tests
      GROUP BY category
      ORDER BY count DESC
    `;

    db.all(distQuery, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      console.log('\n📊 Test Distribution by Category:');
      rows.forEach(row => {
        console.log(`   ${row.category}: ${row.count} tests`);
      });

      resolve();
    });
  });
};

// Function to show test distribution by subcategory
const showSubcategoryDistribution = () => {
  return new Promise((resolve, reject) => {
    const distQuery = `
      SELECT subcategory, COUNT(*) as count
      FROM lab_tests
      GROUP BY subcategory
      ORDER BY count DESC
    `;

    db.all(distQuery, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      console.log('\n📊 Test Distribution by Subcategory:');
      rows.forEach(row => {
        console.log(`   ${row.subcategory || 'General'}: ${row.count} tests`);
      });

      resolve();
    });
  });
};

// Function to show total count
const showTotalCount = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as total FROM lab_tests", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`\n📊 Total tests in database: ${row.total}`);
      resolve();
    });
  });
};

// Main execution
const main = async () => {
  try {
    await showTotalCount();
    await showTestDistribution();
    await showSubcategoryDistribution();
    await findSimilarTests();
    console.log('\n✅ Analysis completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
};

main();
