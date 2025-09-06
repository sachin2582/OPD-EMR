const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/opd-emr-new.db');

console.log('🔧 Fixing clinic data to return correct record...');

// First, deactivate the placeholder record (ID 41)
db.run('UPDATE clinic_setup SET isActive = 0 WHERE id = 41', (err) => {
  if (err) {
    console.error('❌ Error deactivating placeholder record:', err);
    db.close();
    return;
  }
  console.log('✅ Deactivated placeholder record (ID 41)');

  // Update the correct record (ID 40) to be more recent
  db.run('UPDATE clinic_setup SET updatedAt = CURRENT_TIMESTAMP WHERE id = 40', (err) => {
    if (err) {
      console.error('❌ Error updating correct record:', err);
      db.close();
      return;
    }
    console.log('✅ Updated correct record (ID 40) timestamp');

    // Verify the active record
    db.all('SELECT * FROM clinic_setup WHERE isActive = 1 ORDER BY id DESC LIMIT 1', (err, rows) => {
      if (err) {
        console.error('❌ Error verifying data:', err);
      } else {
        console.log('✅ Verification - Active clinic data:');
        console.log(JSON.stringify(rows[0], null, 2));
      }
      db.close();
    });
  });
});
