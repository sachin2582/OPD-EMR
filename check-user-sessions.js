const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking user_sessions table structure...');

// Check user_sessions table structure
db.all("PRAGMA table_info(user_sessions)", (err, columns) => {
  if (err) {
    console.log('❌ Error getting user_sessions table info:', err.message);
    db.close();
    return;
  }
  
  console.log('📋 user_sessions table structure:');
  columns.forEach(col => {
    console.log(`   ${col.name}: ${col.type}`);
  });
  
  // Show sample data
  db.all('SELECT * FROM user_sessions LIMIT 5', (err, sessions) => {
    if (err) {
      console.log('❌ Error querying user_sessions:', err.message);
    } else {
      console.log('\n📋 Sample user_sessions data:');
      sessions.forEach(s => {
        console.log(`   User ID: ${s.user_id}, Token: ${s.token ? s.token.substring(0, 20) + '...' : 'N/A'}, Expires: ${s.expires_at}`);
      });
    }
    db.close();
  });
});
