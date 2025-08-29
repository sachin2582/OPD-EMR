const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Add missing columns to patients table
  console.log('\n=== Adding Missing Columns to Patients Table ===');
  
  db.run('ALTER TABLE patients ADD COLUMN city TEXT', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding city column:', err.message);
    } else {
      console.log('✅ city column added to patients table');
    }
    
    db.run('ALTER TABLE patients ADD COLUMN area TEXT', (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding area column:', err.message);
      } else {
        console.log('✅ area column added to patients table');
      }
      
      db.run('ALTER TABLE patients ADD COLUMN pinCode TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding pinCode column:', err.message);
        } else {
          console.log('✅ pinCode column added to patients table');
        }
        
        // Add missing columns to prescriptions table
        console.log('\n=== Adding Missing Columns to Prescriptions Table ===');
        
        db.run('ALTER TABLE prescriptions ADD COLUMN labTestRecommendations TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding labTestRecommendations column:', err.message);
          } else {
            console.log('✅ labTestRecommendations column added to prescriptions table');
          }
          
          // Verify the changes
          setTimeout(() => {
            console.log('\n=== Verifying Table Structure ===');
            
            db.all('PRAGMA table_info(patients)', (err, columns) => {
              if (err) {
                console.error('Error getting patients structure:', err);
              } else {
                console.log('Updated patients table columns:');
                columns.forEach(col => {
                  console.log(`- ${col.name} (${col.type})`);
                });
              }
              
              db.all('PRAGMA table_info(prescriptions)', (err, columns) => {
                if (err) {
                  console.error('Error getting prescriptions structure:', err);
                } else {
                  console.log('\nUpdated prescriptions table columns:');
                  columns.forEach(col => {
                    console.log(`- ${col.name} (${col.type})`);
                  });
                }
                
                // Close database
                db.close();
                console.log('\nDatabase connection closed');
                console.log('\n✅ All missing columns have been added!');
              });
            });
          }, 1000);
        });
      });
    });
  });
});
