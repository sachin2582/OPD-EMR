const bcrypt = require('bcryptjs');
const { runQuery, getRow } = require('./database/database');

async function createSachinUser() {
  try {
    console.log('🔄 Creating user account for Sachin...');
    
    const email = 'sachin_gupta25@rediffmail.com';
    const password = '123456';
    
    // Check if user already exists
    const existingUser = await getRow(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, email]
    );
    
    if (existingUser) {
      console.log('✅ User already exists');
      return;
    }
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user account
    const result = await runQuery(`
      INSERT INTO users (userId, username, password, fullName, email, role, department, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'USER001',
      email, // Use email as username
      hashedPassword,
      'Sachin Gupta',
      email,
      'doctor', // Assuming you're a doctor, change this as needed
      'General Medicine',
      1
    ]);
    
    console.log('✅ User account created successfully!');
    console.log('📋 Login Credentials:');
    console.log(`   Username/Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: doctor`);
    
    // Verify the password works
    console.log('\n🔍 Verifying password...');
    const newUser = await getRow('SELECT password FROM users WHERE email = ?', [email]);
    if (newUser) {
      const isValid = await bcrypt.compare(password, newUser.password);
      console.log(`   Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

// Run the function
createSachinUser().then(() => {
  console.log('\n🎯 User creation complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
