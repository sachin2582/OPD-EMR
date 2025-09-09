// Script to check and create doctor user
const { runQuery, getRow, getAll } = require('./backend/database/database');
const bcrypt = require('bcryptjs');

async function checkAndCreateDoctor() {
  console.log('🔍 Checking doctor user in database...\n');

  try {
    // Check if user exists
    const existingUser = await getRow(`
      SELECT id, username, role, fullName, email, isActive
      FROM users 
      WHERE username = ?
    `, ['dr.suneet.verma']);

    if (existingUser) {
      console.log('✅ User found in database:');
      console.log('   ID:', existingUser.id);
      console.log('   Username:', existingUser.username);
      console.log('   Role:', existingUser.role);
      console.log('   Full Name:', existingUser.fullName);
      console.log('   Email:', existingUser.email);
      console.log('   Active:', existingUser.isActive ? 'Yes' : 'No');
      
      // Check if there's a linked doctor profile
      const doctorProfile = await getRow(`
        SELECT d.*, u.username
        FROM doctors d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.user_id = ?
      `, [existingUser.id]);
      
      if (doctorProfile) {
        console.log('\n👨‍⚕️ Doctor profile found:');
        console.log('   Doctor ID:', doctorProfile.id);
        console.log('   Name:', doctorProfile.name);
        console.log('   Specialization:', doctorProfile.specialization);
        console.log('   Active:', doctorProfile.isActive ? 'Yes' : 'No');
      } else {
        console.log('\n❌ No doctor profile linked to this user');
      }
      
    } else {
      console.log('❌ User not found. Creating doctor user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('12345', 10);
      console.log('🔐 Password hashed');
      
      // Create user account
      const userResult = await runQuery(`
        INSERT INTO users (username, password, role, fullName, email, phone, isActive, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, ['dr.suneet.verma', hashedPassword, 'doctor', 'Dr. Suneet Verma', 'suneet.verma@hospital.com', '9876543210', 1, 'D']);
      
      console.log('✅ User account created with ID:', userResult.id);
      
      // Create doctor profile
      const doctorResult = await runQuery(`
        INSERT INTO doctors (
          doctorId, name, specialization, phone, email, 
          qualification, experienceYears, availability, isActive, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `DOC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
        'Dr. Suneet Verma',
        'Cardiology',
        '9876543210',
        'suneet.verma@hospital.com',
        'MBBS, MD',
        10,
        'Mon-Fri 9AM-5PM',
        1,
        userResult.id
      ]);
      
      console.log('✅ Doctor profile created with ID:', doctorResult.id);
      console.log('🎉 Doctor user created successfully!');
    }
    
    // Test login
    console.log('\n🔐 Testing login...');
    const testUser = await getRow(`
      SELECT id, username, password, role, fullName, email
      FROM users 
      WHERE username = ? AND isActive = 1
    `, ['dr.suneet.verma']);
    
    if (testUser) {
      const isValidPassword = await bcrypt.compare('12345', testUser.password);
      if (isValidPassword) {
        console.log('✅ Password verification successful!');
        console.log('🎫 User can login with credentials:');
        console.log('   Username: dr.suneet.verma');
        console.log('   Password: 12345');
      } else {
        console.log('❌ Password verification failed!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the check
checkAndCreateDoctor();
