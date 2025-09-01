const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'opd-emr.db');
console.log('📊 Checking users in database...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    return;
  }
  
  console.log('✅ Connected to SQLite database');
  
  // Get all users
  const query = `
    SELECT id, userId, username, fullName, email, phone, role, department, isActive, 
           SUBSTR(password, 1, 10) || '...' as passwordPreview
    FROM users 
    ORDER BY id
  `;
  
  db.all(query, (err, users) => {
    if (err) {
      console.error('❌ Error getting users:', err.message);
    } else {
      console.log('\n👥 Users in database:');
      if (users.length === 0) {
        console.log('  ❌ No users found');
      } else {
        users.forEach(user => {
          console.log(`  - ID: ${user.id}, Username: ${user.username}, Name: ${user.fullName}, Role: ${user.role}, Active: ${user.isActive}`);
        });
      }
    }
    db.close();
  });
});
