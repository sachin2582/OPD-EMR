const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

async function resetPatientIds() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔄 Starting patient ID reset process...');
      
      // Begin transaction
      db.run('BEGIN TRANSACTION');
      
      try {
        // Step 1: Get all patients ordered by current ID
        db.all('SELECT id, patientId FROM patients ORDER BY id', [], (err, patients) => {
          if (err) {
            console.error('Error fetching patients:', err);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          console.log(`📋 Found ${patients.length} patients to reset`);
          
          if (patients.length === 0) {
            console.log('✅ No patients found. Database is ready.');
            db.run('COMMIT');
            resolve();
            return;
          }
          
          // Step 2: Create temporary table for new patient IDs
          db.run(`
            CREATE TEMPORARY TABLE temp_patient_ids (
              old_id INTEGER,
              old_patient_id INTEGER,
              new_patient_id INTEGER
            )
          `, [], (err) => {
            if (err) {
              console.error('Error creating temp table:', err);
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            // Step 3: Insert mapping of old to new IDs
            let completed = 0;
            patients.forEach((patient, index) => {
              const newPatientId = index + 1;
              db.run(
                'INSERT INTO temp_patient_ids (old_id, old_patient_id, new_patient_id) VALUES (?, ?, ?)',
                [patient.id, patient.patientId, newPatientId],
                (err) => {
                  if (err) {
                    console.error('Error inserting mapping:', err);
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  
                  completed++;
                  if (completed === patients.length) {
                    console.log('✅ Patient ID mapping created');
                    
                    // Step 4: Update patient IDs
                    updatePatientIds();
                  }
                }
              );
            });
          });
        });
        
        function updatePatientIds() {
          console.log('🔄 Updating patient IDs...');
          
          // Update patients table
          db.run(`
            UPDATE patients 
            SET patientId = (
              SELECT new_patient_id 
              FROM temp_patient_ids 
              WHERE temp_patient_ids.old_id = patients.id
            )
          `, [], (err) => {
            if (err) {
              console.error('Error updating patient IDs:', err);
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            console.log('✅ Patient IDs updated');
            
            // Step 5: Update foreign key references in other tables
            updateForeignKeys();
          });
        }
        
        function updateForeignKeys() {
          console.log('🔄 Updating foreign key references...');
          
          // Update prescriptions table
          db.run(`
            UPDATE prescriptions 
            SET patientId = (
              SELECT new_patient_id 
              FROM temp_patient_ids 
              WHERE temp_patient_ids.old_patient_id = prescriptions.patientId
            )
          `, [], (err) => {
            if (err) {
              console.error('Error updating prescriptions:', err);
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            // Update billing table
            db.run(`
              UPDATE billing 
              SET patientId = (
                SELECT new_patient_id 
                FROM temp_patient_ids 
                WHERE temp_patient_ids.old_patient_id = billing.patientId
              )
            `, [], (err) => {
              if (err) {
                console.error('Error updating billing:', err);
                db.run('ROLLBACK');
                reject(err);
                return;
              }
              
              // Update appointments table if it exists
              db.run(`
                UPDATE appointments 
                SET patientId = (
                  SELECT new_patient_id 
                  FROM temp_patient_ids 
                  WHERE temp_patient_ids.old_patient_id = appointments.patientId
                )
              `, [], (err) => {
                if (err && !err.message.includes('no such table')) {
                  console.error('Error updating appointments:', err);
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                
                // Update clinical_notes table if it exists
                db.run(`
                  UPDATE clinical_notes 
                  SET patientId = (
                    SELECT new_patient_id 
                    FROM temp_patient_ids 
                    WHERE temp_patient_ids.old_patient_id = clinical_notes.patientId
                  )
                `, [], (err) => {
                  if (err && !err.message.includes('no such table')) {
                    console.error('Error updating clinical_notes:', err);
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  
                  console.log('✅ Foreign key references updated');
                  
                  // Step 6: Clean up and commit
                  cleanupAndCommit();
                });
              });
            });
          });
        }
        
        function cleanupAndCommit() {
          console.log('🧹 Cleaning up temporary data...');
          
          // Drop temporary table
          db.run('DROP TABLE temp_patient_ids', [], (err) => {
            if (err) {
              console.error('Error dropping temp table:', err);
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            // Commit transaction
            db.run('COMMIT', [], (err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                reject(err);
                return;
              }
              
              console.log('✅ Patient ID reset completed successfully!');
              console.log('🎯 Patient IDs now start from 1');
              
              // Verify the results
              verifyResults();
            });
          });
        }
        
        function verifyResults() {
          db.all('SELECT id, patientId, firstName, lastName FROM patients ORDER BY patientId LIMIT 5', [], (err, patients) => {
            if (err) {
              console.error('Error verifying results:', err);
              return;
            }
            
            console.log('\n📊 Verification Results:');
            console.log('First 5 patients with new IDs:');
            patients.forEach(patient => {
              console.log(`  Patient ${patient.patientId}: ${patient.firstName} ${patient.lastName}`);
            });
            
            resolve();
          });
        }
        
      } catch (error) {
        console.error('❌ Error during reset process:', error);
        db.run('ROLLBACK');
        reject(error);
      }
    });
  });
}

// Run the reset process
resetPatientIds()
  .then(() => {
    console.log('\n🎉 Patient ID reset process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Patient ID reset failed:', error);
    process.exit(1);
  })
  .finally(() => {
    db.close();
  });
