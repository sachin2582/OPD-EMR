// Check doctor password and create user_sessions table if needed
const { runQuery, getRow, getAll } = require('./database/database');
const bcrypt = require('bcryptjs');

async function checkDoctorPassword() {
  console.log('🔍 Checking doctor password and database setup...\n');

  try {
    // Check if user_sessions table exists
    console.log('📋 Checking user_sessions table...');
    try {
      await runQuery('SELECT COUNT(*) as count FROM user_sessions');
      console.log('✅ user_sessions table exists');
    } catch (error) {
      console.log('❌ user_sessions table does not exist. Creating it...');
      await runQuery(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
      console.log('✅ user_sessions table created');
    }

    // Check the doctor user
    console.log('\n👨‍⚕️ Checking Dr. Suneet Verma...');
    const user = await getRow(`
      SELECT id, username, password, role, isActive, fullName, email
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
      console.log('   Password Hash:', user.password ? 'Set' : 'Not set');
      
      // Test password
      console.log('\n🔐 Testing password...');
      const testPasswords = ['12345', 'password', 'admin123'];
      
      for (const testPassword of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPassword, user.password);
          if (isValid) {
            console.log(`✅ Password "${testPassword}" is correct!`);
            break;
          } else {
            console.log(`❌ Password "${testPassword}" is incorrect`);
          }
        } catch (error) {
          console.log(`❌ Error testing password "${testPassword}":`, error.message);
        }
      }
      
      // Update password if needed
      console.log('\n🔧 Setting password to "12345"...');
      const hashedPassword = await bcrypt.hash('12345', 10);
      await runQuery(`
        UPDATE users 
        SET password = ? 
        WHERE username = ?
      `, [hashedPassword, 'dr.suneet.verma']);
      console.log('✅ Password updated to "12345"');
      
      // Verify the new password
      const isValidNewPassword = await bcrypt.compare('12345', hashedPassword);
      console.log('✅ New password verification:', isValidNewPassword ? 'Success' : 'Failed');
      
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the check
checkDoctorPassword();
