const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, 'opd-emr.db');
console.log('🔐 Setting up admin password...');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    return;
  }
  
  console.log('✅ Connected to SQLite database');
  
  // Set admin password to 'admin123' (you can change this)
  const newPassword = 'admin123';
  const hashedPassword = hashPassword(newPassword);
  
  const updateQuery = `
    UPDATE users 
    SET password = ?, updatedAt = DATETIME('now')
    WHERE username = 'admin'
  `;
  
  db.run(updateQuery, [hashedPassword], function(err) {
    if (err) {
      console.error('❌ Error updating password:', err.message);
    } else {
      console.log('✅ Admin password updated successfully!');
      console.log(`🔑 New credentials:`);
      console.log(`   Username: admin`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   Hashed: ${hashedPassword.substring(0, 20)}...`);
    }
    db.close();
  });
});
