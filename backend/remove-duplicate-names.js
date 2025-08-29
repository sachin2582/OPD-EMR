const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/opd-emr.db');

console.log('🔍 Finding and removing duplicate lab tests by name...\n');

// First, let's see what duplicates exist
db.all(`
  SELECT testName, COUNT(*) as count 
  FROM lab_tests 
  GROUP BY testName 
  HAVING COUNT(*) > 1
  ORDER BY count DESC
`, (err, duplicates) => {
  if (err) {
    console.error('❌ Error finding duplicates:', err);
    db.close();
    return;
  }

  if (duplicates.length === 0) {
    console.log('✅ No duplicate test names found!');
    db.close();
    return;
  }

  console.log('⚠️ Found duplicate test names:');
  duplicates.forEach(dup => {
    console.log(`  "${dup.testName}" - appears ${dup.count} times`);
  });

  console.log('\n🗑️ Removing duplicates...\n');

  // For each duplicate name, keep the first occurrence and delete the rest
  duplicates.forEach(duplicate => {
    const testName = duplicate.testName;
    
    // Get all records with this name
    db.all('SELECT id, testCode, testName, price, category, subcategory FROM lab_tests WHERE testName = ? ORDER BY id', [testName], (err, records) => {
      if (err) {
        console.error(`❌ Error getting records for "${testName}":`, err);
        return;
      }

      if (records.length <= 1) return;

      console.log(`\n📋 "${testName}" - ${records.length} records found:`);
      records.forEach((record, index) => {
        console.log(`  ${index + 1}. ID: ${record.id}, Code: ${record.testCode}, Price: ₹${record.price}, Category: ${record.category}/${record.subcategory || 'General'}`);
      });

      // Keep the first record (lowest ID), delete the rest
      const recordsToDelete = records.slice(1);
      const idsToDelete = recordsToDelete.map(r => r.id);

      console.log(`\n💾 Keeping: ID ${records[0].id} (${records[0].testCode})`);
      console.log(`🗑️ Deleting: ${recordsToDelete.length} duplicate(s)`);

      // Delete the duplicates
      const deleteSql = 'DELETE FROM lab_tests WHERE id IN (' + idsToDelete.map(() => '?').join(',') + ')';
      
      db.run(deleteSql, idsToDelete, function(err) {
        if (err) {
          console.error(`❌ Error deleting duplicates for "${testName}":`, err);
        } else {
          console.log(`✅ Successfully deleted ${this.changes} duplicate(s) for "${testName}"`);
        }
      });
    });
  });

  // Wait a bit for all deletions to complete, then show final count
  setTimeout(() => {
    db.get('SELECT COUNT(*) as total FROM lab_tests', (err, result) => {
      if (err) {
        console.error('❌ Error getting final count:', err);
      } else {
        console.log(`\n🏁 Final database state: ${result.total} lab tests remaining`);
      }
      db.close();
    });
  }, 2000);
});
