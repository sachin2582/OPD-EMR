const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔧 COPYING DOSE PATTERNS TO CORRECT DATABASE');
console.log('=' .repeat(60));

// Source database (where dose patterns currently are)
const sourceDbPath = path.join(__dirname, 'backend', 'opd-emr.db');
// Target database (where backend expects them)
const targetDbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('📁 Source database:', sourceDbPath);
console.log('📁 Target database:', targetDbPath);

// Function to copy dose patterns from source to target
const copyDosePatterns = () => {
  console.log('\n🔍 Step 1: Checking source database...');
  
  const sourceDb = new sqlite3.Database(sourceDbPath, (err) => {
    if (err) {
      console.error('❌ Error opening source database:', err.message);
      return;
    }
    console.log('✅ Connected to source database');
    
    // Check if dose_patterns table exists in source
    const checkTableSQL = `SELECT name FROM sqlite_master WHERE type='table' AND name='dose_patterns'`;
    sourceDb.get(checkTableSQL, [], (err, row) => {
      if (err) {
        console.error('❌ Error checking table:', err.message);
        return;
      }
      
      if (!row) {
        console.log('❌ dose_patterns table does not exist in source database');
        return;
      }
      
      console.log('✅ dose_patterns table exists in source database');
      
      // Count records in source
      const countSQL = `SELECT COUNT(*) as count FROM dose_patterns`;
      sourceDb.get(countSQL, [], (err, result) => {
        if (err) {
          console.error('❌ Error counting records:', err.message);
          return;
        }
        
        console.log(`📊 Source database has ${result.count} dose patterns`);
        
        if (result.count === 0) {
          console.log('❌ Source database has no dose patterns');
          return;
        }
        
        // Get all dose patterns from source
        const selectSQL = `SELECT * FROM dose_patterns`;
        sourceDb.all(selectSQL, [], (err, rows) => {
          if (err) {
            console.error('❌ Error fetching dose patterns:', err.message);
            return;
          }
          
          console.log(`✅ Fetched ${rows.length} dose patterns from source`);
          
          // Close source database
          sourceDb.close();
          
          // Now work with target database
          console.log('\n🔍 Step 2: Working with target database...');
          
          const targetDb = new sqlite3.Database(targetDbPath, (err) => {
            if (err) {
              console.error('❌ Error opening target database:', err.message);
              return;
            }
            console.log('✅ Connected to target database');
            
            // Drop existing dose_patterns table in target
            console.log('🔧 Dropping existing dose_patterns table in target...');
            targetDb.run('DROP TABLE IF EXISTS dose_patterns', (err) => {
              if (err) {
                console.error('❌ Error dropping table:', err.message);
                return;
              }
              
              console.log('✅ Dropped existing dose_patterns table');
              
              // Create dose_patterns table in target
              console.log('🔧 Creating dose_patterns table in target...');
              const createTableSQL = `
                CREATE TABLE dose_patterns (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  dose_value VARCHAR(100) NOT NULL,
                  description_hindi TEXT NOT NULL,
                  description_english TEXT,
                  category VARCHAR(50) DEFAULT 'General',
                  is_active BOOLEAN DEFAULT TRUE,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
              `;
              
              targetDb.run(createTableSQL, (err) => {
                if (err) {
                  console.error('❌ Error creating table:', err.message);
                  return;
                }
                
                console.log('✅ Created dose_patterns table in target');
                
                // Insert dose patterns into target
                console.log('🔧 Inserting dose patterns into target database...');
                
                const insertSQL = `
                  INSERT INTO dose_patterns (dose_value, description_hindi, description_english, category, is_active)
                  VALUES (?, ?, ?, ?, ?)
                `;
                
                let completed = 0;
                let errors = 0;
                
                rows.forEach((row, index) => {
                  targetDb.run(insertSQL, [
                    row.dose_value,
                    row.description_hindi,
                    row.description_english,
                    row.category || 'General',
                    row.is_active || 1
                  ], (err) => {
                    if (err) {
                      console.error(`❌ Error inserting dose pattern ${row.dose_value}:`, err.message);
                      errors++;
                    } else {
                      console.log(`✅ Inserted: ${row.dose_value} - ${row.description_hindi}`);
                    }
                    
                    completed++;
                    if (completed === rows.length) {
                      console.log(`\n📊 INSERTION SUMMARY:`);
                      console.log(`✅ Successfully inserted: ${rows.length - errors} patterns`);
                      if (errors > 0) {
                        console.log(`❌ Failed to insert: ${errors} patterns`);
                      }
                      
                      // Verify insertion
                      console.log('\n🔍 Step 3: Verifying insertion...');
                      const verifySQL = `SELECT COUNT(*) as count FROM dose_patterns`;
                      targetDb.get(verifySQL, [], (err, result) => {
                        if (err) {
                          console.error('❌ Error verifying insertion:', err.message);
                          return;
                        }
                        
                        console.log(`📊 Total records in target database: ${result.count}`);
                        
                        // Show sample data
                        const sampleSQL = `SELECT * FROM dose_patterns LIMIT 5`;
                        targetDb.all(sampleSQL, [], (err, sampleRows) => {
                          if (err) {
                            console.error('❌ Error fetching sample data:', err.message);
                            return;
                          }
                          
                          console.log('\n📋 Sample data in target database:');
                          sampleRows.forEach((row, index) => {
                            console.log(`${index + 1}. ID: ${row.id} | Dose: "${row.dose_value}" | Hindi: "${row.description_hindi}"`);
                          });
                          
                          // Close target database
                          targetDb.close();
                          
                          console.log('\n🎯 FINAL RESULT:');
                          console.log('=' .repeat(50));
                          console.log(`✅ Source: ${sourceDbPath}`);
                          console.log(`✅ Target: ${targetDbPath}`);
                          console.log(`✅ Records: ${result.count} dose patterns`);
                          console.log(`✅ Status: DOSE PATTERNS COPIED SUCCESSFULLY`);
                          console.log('🎉 The dose patterns are now in the correct database file!');
                        });
                      });
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

// Start the copy process
copyDosePatterns();
