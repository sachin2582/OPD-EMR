const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔧 Updating all lab test prices to 200...');
console.log('📁 Database path:', dbPath);

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database successfully');
});

// Update all lab test prices to 200
const updatePrices = () => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE lab_tests SET price = 200, updatedAt = CURRENT_TIMESTAMP';
    
    db.run(sql, [], function(err) {
      if (err) {
        console.error('❌ Error updating prices:', err.message);
        reject(err);
      } else {
        console.log(`✅ Successfully updated ${this.changes} lab test prices to 200`);
        resolve(this.changes);
      }
    });
  });
};

// Verify the update
const verifyUpdate = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT(*) as total, COUNT(CASE WHEN price = 200 THEN 1 END) as updated_count FROM lab_tests';
    
    db.get(sql, [], (err, row) => {
      if (err) {
        console.error('❌ Error verifying update:', err.message);
        reject(err);
      } else {
        console.log(`📊 Verification Results:`);
        console.log(`   Total lab tests: ${row.total}`);
        console.log(`   Tests with price 200: ${row.updated_count}`);
        console.log(`   Success rate: ${((row.updated_count / row.total) * 100).toFixed(1)}%`);
        resolve(row);
      }
    });
  });
};

// Show some sample records
const showSampleRecords = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT testId, testName, testCode, price, category FROM lab_tests LIMIT 5';
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('❌ Error fetching sample records:', err.message);
        reject(err);
      } else {
        console.log(`\n📋 Sample Records (showing first 5):`);
        console.log('┌─────────┬─────────────────────────────┬──────────┬───────┬─────────────┐');
        console.log('│ Test ID │ Test Name                   │ Test Code│ Price │ Category    │');
        console.log('├─────────┼─────────────────────────────┼──────────┼───────┼─────────────┤');
        
        rows.forEach(row => {
          const testId = (row.testId || '').padEnd(7);
          const testName = (row.testName || '').substring(0, 27).padEnd(27);
          const testCode = (row.testCode || '').padEnd(8);
          const price = (row.price || 0).toString().padStart(5);
          const category = (row.category || '').substring(0, 11).padEnd(11);
          
          console.log(`│ ${testId} │ ${testName} │ ${testCode} │ ${price} │ ${category} │`);
        });
        
        console.log('└─────────┴─────────────────────────────┴──────────┴───────┴─────────────┘');
        resolve(rows);
      }
    });
  });
};

// Main execution
async function main() {
  try {
    console.log('\n🚀 Starting price update process...\n');
    
    // Update prices
    const updatedCount = await updatePrices();
    
    // Verify update
    await verifyUpdate();
    
    // Show sample records
    await showSampleRecords();
    
    console.log('\n🎉 Price update completed successfully!');
    console.log(`✅ All ${updatedCount} lab test prices have been set to 200`);
    
  } catch (error) {
    console.error('❌ Error during price update:', error.message);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('\n🔒 Database connection closed');
      }
      process.exit(0);
    });
  }
}

// Run the script
main();
