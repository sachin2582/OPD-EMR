const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path - use the same path as the main application
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('Starting prescription table migration...');
console.log('Database path:', dbPath);

db.serialize(() => {
  // Check if labTestRecommendations column exists
  db.get("PRAGMA table_info(prescriptions)", (err, rows) => {
    if (err) {
      console.error('Error checking table structure:', err);
      return;
    }
    
    db.all("PRAGMA table_info(prescriptions)", (err, columns) => {
      if (err) {
        console.error('Error getting table columns:', err);
        return;
      }
      
      console.log('Current columns in prescriptions table:', columns.map(col => col.name));
      
      const hasLabTestColumn = columns.some(col => col.name === 'labTestRecommendations');
      
      if (!hasLabTestColumn) {
        console.log('Adding labTestRecommendations column to prescriptions table...');
        
        db.run("ALTER TABLE prescriptions ADD COLUMN labTestRecommendations TEXT", (err) => {
          if (err) {
            console.error('Error adding column:', err);
          } else {
            console.log('Successfully added labTestRecommendations column to prescriptions table');
          }
          
          // Close database connection
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('Migration completed successfully');
            }
          });
        });
      } else {
        console.log('labTestRecommendations column already exists in prescriptions table');
        
        // Close database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('Migration completed successfully');
          }
        });
      }
    });
  });
});
