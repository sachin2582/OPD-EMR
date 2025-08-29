const { getAll } = require('./database/database');

async function checkUsers() {
  try {
    console.log('🔍 Checking users table...');
    
    const users = await getAll('SELECT id, userId, username, email, role, isActive FROM users');
    console.log('📋 Users found:', users.length);
    
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`   ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
      });
    } else {
      console.log('   No users found in users table');
    }
    
    console.log('\n🔍 Checking doctors table...');
    const doctors = await getAll('SELECT id, doctorId, name, email, license, isActive FROM doctors');
    console.log('📋 Doctors found:', doctors.length);
    
    if (doctors.length > 0) {
      doctors.forEach(doctor => {
        console.log(`   ID: ${doctor.id}, DoctorID: ${doctor.doctorId}, Name: ${doctor.name}, Email: ${doctor.email}, License: ${doctor.license}, Active: ${doctor.isActive}`);
      });
    } else {
      console.log('   No doctors found in doctors table');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

checkUsers().then(() => {
  console.log('\n🎯 User check complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
