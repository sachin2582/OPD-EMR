const bcrypt = require('bcryptjs');
const { getRow } = require('./database/database');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login process...\n');
    
    const username = 'admin';
    const password = 'admin123';
    
    console.log(`📝 Login attempt with:`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}\n`);
    
    // Step 1: Check users table
    console.log('1️⃣ Checking users table...');
    let user = await getRow(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND isActive = 1',
      [username, username]
    );
    
    if (user) {
      console.log(`   ✅ User found in users table:`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Username: ${user.username}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Active: ${user.isActive}`);
      console.log(`      Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}\n`);
      
      // Step 2: Verify password
      console.log('2️⃣ Verifying password...');
      if (user.password) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log(`   Password verification result: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
        
        if (isValidPassword) {
          console.log('\n🎉 LOGIN SHOULD SUCCEED!');
        } else {
          console.log('\n❌ LOGIN WILL FAIL - Password mismatch');
        }
      } else {
        console.log('   ❌ No password hash found');
      }
      
    } else {
      console.log('   ❌ User not found in users table\n');
      
      // Check doctors table as fallback
      console.log('1️⃣ Checking doctors table...');
      user = await getRow(
        'SELECT * FROM doctors WHERE (email = ? OR license = ?) AND isActive = 1',
        [username, username]
      );
      
      if (user) {
        console.log(`   ✅ User found in doctors table:`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Name: ${user.name}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      License: ${user.license}`);
        console.log(`      Active: ${user.isActive}`);
        console.log(`      Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}\n`);
        
        // Verify password
        console.log('2️⃣ Verifying password...');
        if (user.password) {
          const isValidPassword = await bcrypt.compare(password, user.password);
          console.log(`   Password verification result: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
        } else {
          console.log('   ❌ No password hash found');
        }
      } else {
        console.log('   ❌ User not found in doctors table either');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugLogin().then(() => {
  console.log('\n🎯 Debug complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
