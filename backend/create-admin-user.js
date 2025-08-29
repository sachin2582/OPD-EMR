const bcrypt = require('bcryptjs');
const { runQuery, getRow } = require('./database/database');

async function createAdminUser() {
  try {
    console.log('🔄 Creating default admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await getRow(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      ['admin', 'admin@opd-emr.com']
    );
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Hash the default password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    // Create admin user
    const result = await runQuery(`
      INSERT INTO users (userId, username, password, fullName, email, role, department, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'ADMIN001',
      'admin',
      hashedPassword,
      'System Administrator',
      'admin@opd-emr.com',
      'admin',
      'Administration',
      1
    ]);
    
    console.log('✅ Default admin user created successfully!');
    console.log('📋 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@opd-emr.com');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the function
createAdminUser().then(() => {
  console.log('🎯 Admin user setup complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
