const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking latest user_sessions...');

// Get the latest session for user 203
db.get('SELECT * FROM user_sessions WHERE user_id = 203 ORDER BY created_at DESC LIMIT 1', (err, session) => {
  if (err) {
    console.log('❌ Error querying latest session:', err.message);
    db.close();
    return;
  }
  
  if (!session) {
    console.log('❌ No session found for user 203');
  } else {
    console.log('✅ Latest session found:');
    console.log(`   User ID: ${session.user_id}`);
    console.log(`   Token: ${session.token ? session.token.substring(0, 20) + '...' : 'N/A'}`);
    console.log(`   Expires: ${session.expires_at}`);
    console.log(`   Created: ${session.created_at}`);
    
    // Check if token is expired
    const now = new Date();
    const expires = new Date(session.expires_at);
    console.log(`   Is expired: ${now > expires}`);
  }
  
  db.close();
});
