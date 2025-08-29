const bcrypt = require('bcryptjs');
const { runQuery, getRow } = require('./database/database');

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...\n');
    
    // Get current admin user
    const admin = await getRow('SELECT id, username FROM users WHERE username = ?', ['admin']);
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log(`✅ Admin user found: ID ${admin.id}, Username: ${admin.username}`);
    
    // Generate correct password hash
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log(`🔐 New password hash generated for '${password}'`);
    console.log(`   Hash: ${hashedPassword.substring(0, 20)}...\n`);
    
    // Update the password
    await runQuery(
      'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, admin.id]
    );
    
    console.log('✅ Password updated successfully!');
    
    // Verify the new password
    console.log('\n🔍 Verifying new password...');
    const updatedAdmin = await getRow('SELECT password FROM users WHERE id = ?', [admin.id]);
    
    if (updatedAdmin && updatedAdmin.password) {
      const isValid = await bcrypt.compare(password, updatedAdmin.password);
      console.log(`   Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (isValid) {
        console.log('\n🎉 Admin password fixed successfully!');
        console.log('📋 You can now login with:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
}

fixAdminPassword().then(() => {
  console.log('\n🎯 Password fix complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
