// Fix foreign key mismatch issue
const { runQuery, getRow, getAll } = require('./backend/database/database');

async function fixForeignKeyIssue() {
  console.log('🔧 Fixing foreign key mismatch issue...\n');

  try {
    // Check the users table structure
    console.log('📋 Checking users table structure...');
    const usersTableInfo = await getAll(`
      PRAGMA table_info(users)
    `);
    console.log('Users table columns:', usersTableInfo.map(col => `${col.name} (${col.type})`));

    // Check the user_sessions table structure
    console.log('\n📋 Checking user_sessions table structure...');
    const sessionsTableInfo = await getAll(`
      PRAGMA table_info(user_sessions)
    `);
    console.log('User_sessions table columns:', sessionsTableInfo.map(col => `${col.name} (${col.type})`));

    // Check foreign key constraints
    console.log('\n🔗 Checking foreign key constraints...');
    const foreignKeys = await getAll(`
      PRAGMA foreign_key_list(user_sessions)
    `);
    console.log('Foreign keys:', foreignKeys);

    // Check if the doctor user exists and get their ID
    console.log('\n👨‍⚕️ Checking Dr. Suneet Verma...');
    const user = await getRow(`
      SELECT id, username, role, fullName, isActive
      FROM users 
      WHERE username = ?
    `, ['dr.suneet.verma']);

    if (user) {
      console.log('✅ User found:');
      console.log('   ID:', user.id);
      console.log('   Username:', user.username);
      console.log('   Role:', user.role);
      console.log('   Full Name:', user.fullName);
      console.log('   Active:', user.isActive ? 'Yes' : 'No');

      // Check if there are any existing sessions for this user
      console.log('\n📊 Checking existing sessions...');
      const existingSessions = await getAll(`
        SELECT * FROM user_sessions WHERE user_id = ?
      `, [user.id]);
      console.log('Existing sessions:', existingSessions.length);

      // Test inserting a session manually
      console.log('\n🧪 Testing session insertion...');
      try {
        const testToken = 'test-token-' + Date.now();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        const result = await runQuery(`
          INSERT INTO user_sessions (user_id, token, expires_at)
          VALUES (?, ?, ?)
        `, [user.id, testToken, expiresAt]);
        
        console.log('✅ Session insertion successful!');
        console.log('   Session ID:', result.id);
        
        // Clean up test session
        await runQuery(`
          DELETE FROM user_sessions WHERE id = ?
        `, [result.id]);
        console.log('🧹 Test session cleaned up');
        
      } catch (error) {
        console.log('❌ Session insertion failed:', error.message);
        
        // Try to recreate the user_sessions table with proper foreign key
        console.log('\n🔧 Recreating user_sessions table...');
        await runQuery(`DROP TABLE IF EXISTS user_sessions`);
        await runQuery(`
          CREATE TABLE user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          )
        `);
        console.log('✅ user_sessions table recreated');
        
        // Test again
        const testToken = 'test-token-' + Date.now();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        const result = await runQuery(`
          INSERT INTO user_sessions (user_id, token, expires_at)
          VALUES (?, ?, ?)
        `, [user.id, testToken, expiresAt]);
        
        console.log('✅ Session insertion now successful!');
        console.log('   Session ID:', result.id);
        
        // Clean up test session
        await runQuery(`
          DELETE FROM user_sessions WHERE id = ?
        `, [result.id]);
        console.log('🧹 Test session cleaned up');
      }
      
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
fixForeignKeyIssue();
