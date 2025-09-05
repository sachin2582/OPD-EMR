const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔧 Updating all lab test prices to 200...');
console.log('📁 Database path:', dbPath);

// Create database connection with retry logic
function connectToDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.log('⚠️  First attempt failed, retrying...');
        // Try again with different options
        const db2 = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err2) => {
          if (err2) {
            reject(err2);
          } else {
            resolve(db2);
          }
        });
      } else {
        resolve(db);
      }
    });
  });
}

// Update prices function
function updatePrices(db) {
  return new Promise((resolve, reject) => {
    console.log('🔄 Updating prices...');
    
    // First, try to get current count
    db.get('SELECT COUNT(*) as count FROM lab_tests', (err, row) => {
      if (err) {
        console.error('❌ Error getting count:', err.message);
        reject(err);
        return;
      }
      
      console.log(`📊 Found ${row.count} lab tests in database`);
      
      // Update prices
      db.run('UPDATE lab_tests SET price = 200, updatedAt = CURRENT_TIMESTAMP', function(err) {
        if (err) {
          console.error('❌ Error updating prices:', err.message);
          reject(err);
        } else {
          console.log(`✅ Successfully updated ${this.changes} lab test prices to 200`);
          
          // Verify update
          db.get('SELECT COUNT(*) as total, COUNT(CASE WHEN price = 200 THEN 1 END) as updated_count FROM lab_tests', (err, row) => {
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
        }
      });
    });
  });
}

// Main function
async function main() {
  let db;
  
  try {
    // Connect to database
    db = await connectToDatabase();
    console.log('✅ Connected to database successfully');
    
    // Update prices
    await updatePrices(db);
    
    console.log('\n🎉 Price update completed successfully!');
    console.log('✅ All lab test prices have been set to 200');
    
  } catch (error) {
    console.error('❌ Error during price update:', error.message);
    
    // If database is locked, provide alternative solution
    if (error.message.includes('SQLITE_BUSY') || error.message.includes('database is locked')) {
      console.log('\n💡 Database is locked. Here are your options:');
      console.log('1. Stop the backend server temporarily');
      console.log('2. Use a database management tool (like DB Browser for SQLite)');
      console.log('3. Run this command manually:');
      console.log(`   sqlite3 "${dbPath}" "UPDATE lab_tests SET price = 200, updatedAt = CURRENT_TIMESTAMP;"`);
    }
  } finally {
    // Close database connection
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('🔒 Database connection closed');
        }
      });
    }
  }
}

// Run the script
main();
