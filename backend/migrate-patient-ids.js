const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'opd-emr.db');

console.log('Starting patient ID migration...');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database for migration');
  }
});

async function migratePatientIds() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      try {
        console.log('Starting migration process...');
        
        // First, let's backup the current data
        console.log('Creating backup of current patients...');
        db.run('CREATE TABLE IF NOT EXISTS patients_backup AS SELECT * FROM patients', (err) => {
          if (err) {
            console.error('Error creating backup:', err);
            reject(err);
            return;
          }
          console.log('✓ Backup created successfully');
          
          // Get all patients ordered by creation date
          db.all('SELECT * FROM patients ORDER BY createdAt ASC', (err, patients) => {
            if (err) {
              console.error('Error fetching patients:', err);
              reject(err);
              return;
            }
            
            console.log(`Found ${patients.length} patients to migrate`);
            
            if (patients.length === 0) {
              console.log('No patients to migrate');
              resolve();
              return;
            }
            
            // Update each patient with sequential ID
            let completed = 0;
            patients.forEach((patient, index) => {
              const newPatientId = index + 1;
              console.log(`Migrating patient ${patient.firstName} ${patient.lastName} from ID ${patient.patientId} to ${newPatientId}`);
              
              db.run('UPDATE patients SET patientId = ? WHERE id = ?', [newPatientId, patient.id], (err) => {
                if (err) {
                  console.error(`Error updating patient ${patient.id}:`, err);
                } else {
                  completed++;
                  console.log(`✓ Updated patient ${patient.firstName} ${patient.lastName} to ID ${newPatientId}`);
                  
                  if (completed === patients.length) {
                    console.log('\n🎉 Migration completed successfully!');
                    console.log(`Updated ${completed} patients with sequential IDs starting from 1`);
                    resolve();
                  }
                }
              });
            });
          });
        });
        
      } catch (error) {
        console.error('Migration error:', error);
        reject(error);
      }
    });
  });
}

async function runMigration() {
  try {
    await migratePatientIds();
    console.log('\nMigration completed successfully!');
    console.log('You can now restart your application with the new patient ID system.');
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
