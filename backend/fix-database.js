const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Starting database check...\n');

// Use absolute path to database
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  
  console.log('✅ Connected to database successfully');
  
  // Check if table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='lab_tests'", (err, row) => {
    if (err) {
      console.error('❌ Error checking table:', err.message);
      db.close();
      return;
    }
    
    if (!row) {
      console.error('❌ lab_tests table does not exist!');
      db.close();
      return;
    }
    
    console.log('✅ lab_tests table exists');
    
    // Check total count
    db.get('SELECT COUNT(*) as total FROM lab_tests', (err, result) => {
      if (err) {
        console.error('❌ Error counting tests:', err.message);
        db.close();
        return;
      }
      
      console.log(`📊 Total lab tests: ${result.total}`);
      
      // Check for duplicates
      db.all('SELECT testName, COUNT(*) as count FROM lab_tests GROUP BY testName HAVING COUNT(*) > 1', (err, duplicates) => {
        if (err) {
          console.error('❌ Error checking duplicates:', err.message);
          db.close();
          return;
        }
        
        if (duplicates.length === 0) {
          console.log('✅ No duplicate names found');
        } else {
          console.log('⚠️ Duplicates found:');
          duplicates.forEach(d => console.log(`  "${d.testName}" - ${d.count} times`));
          
          // Remove duplicates
          console.log('\n🗑️ Removing duplicates...');
          duplicates.forEach(duplicate => {
            const testName = duplicate.testName;
            
            db.all('SELECT id, testCode FROM lab_tests WHERE testName = ? ORDER BY id', [testName], (err, records) => {
              if (err) {
                console.error(`❌ Error getting records for "${testName}":`, err.message);
                return;
              }
              
              if (records.length <= 1) return;
              
              // Keep first, delete rest
              const idsToDelete = records.slice(1).map(r => r.id);
              const deleteSql = 'DELETE FROM lab_tests WHERE id IN (' + idsToDelete.map(() => '?').join(',') + ')';
              
              db.run(deleteSql, idsToDelete, function(err) {
                if (err) {
                  console.error(`❌ Error deleting duplicates for "${testName}":`, err.message);
                } else {
                  console.log(`✅ Deleted ${this.changes} duplicate(s) for "${testName}"`);
                }
              });
            });
          });
        }
        
        // Final count
        setTimeout(() => {
          db.get('SELECT COUNT(*) as total FROM lab_tests', (err, result) => {
            if (err) {
              console.error('❌ Error getting final count:', err.message);
            } else {
              console.log(`\n🏁 Final count: ${result.total} lab tests`);
            }
            db.close();
          });
        }, 1000);
      });
    });
  });
});
