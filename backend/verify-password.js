const bcrypt = require('bcryptjs');
const { getRow } = require('./database/database');

async function verifyPassword() {
  try {
    console.log('🔍 Verifying admin password...');
    
    // Get admin user with password
    const admin = await getRow('SELECT id, username, password FROM users WHERE username = ?', ['admin']);
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log(`✅ Admin user found: ID ${admin.id}, Username: ${admin.username}`);
    console.log(`🔐 Password hash: ${admin.password}`);
    
    // Test password verification
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    console.log(`🔑 Testing password '${testPassword}': ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    // Test with wrong password
    const wrongPassword = 'wrongpass';
    const isWrongValid = await bcrypt.compare(wrongPassword, admin.password);
    console.log(`🔑 Testing wrong password '${wrongPassword}': ${isWrongValid ? '❌ WRONGLY VALID' : '✅ CORRECTLY INVALID'}`);
    
    // Hash a new password for comparison
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log(`🆕 New hash for '${testPassword}': ${newHash}`);
    
    // Test new hash
    const isNewValid = await bcrypt.compare(testPassword, newHash);
    console.log(`🔑 Testing new hash: ${isNewValid ? '✅ VALID' : '❌ INVALID'}`);
    
  } catch (error) {
    console.error('❌ Error verifying password:', error);
  }
}

verifyPassword().then(() => {
  console.log('\n🎯 Password verification complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
