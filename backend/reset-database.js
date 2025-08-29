const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

console.log('🗄️  Resetting OPD-EMR Database...');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Reset database function
async function resetDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = OFF');
      
      // Drop all tables
      const tables = [
        'medical_records',
        'appointments', 
        'billing',
        'prescriptions',
        'doctors',
        'patients'
      ];
      
      tables.forEach(table => {
        db.run(`DROP TABLE IF EXISTS ${table}`, (err) => {
          if (err) {
            console.log(`⚠️  Warning dropping ${table}:`, err.message);
          } else {
            console.log(`🗑️  Dropped table: ${table}`);
          }
        });
      });
      
      // Re-enable foreign keys
      db.run('PRAGMA foreign_keys = ON');
      
      // Close database
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
          reject(err);
        } else {
          console.log('✅ Database closed successfully');
          resolve();
        }
      });
    });
  });
}

// Run reset
resetDatabase()
  .then(() => {
    console.log('🎯 Database reset completed successfully!');
    console.log('📝 Run "npm run init-db" to recreate tables with fresh structure.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  });
