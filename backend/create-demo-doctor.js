const bcrypt = require('bcryptjs');
const { runQuery, getRow } = require('./database/database');

async function createDemoDoctor() {
  try {
    console.log('🔄 Creating demo doctor account...');
    
    // Check if demo doctor already exists
    const existingDoctor = await getRow('SELECT id FROM doctors WHERE email = ?', ['demo@opd-emr.com']);
    
    if (existingDoctor) {
      console.log('✅ Demo doctor already exists');
      return;
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('demo123', saltRounds);
    
    // Create demo doctor
    const result = await runQuery(`
      INSERT INTO doctors (doctorId, name, specialization, license, phone, email, department, password, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'DOC-DEMO-001',
      'Dr. John Smith',
      'General Medicine',
      'LIC-DEMO-001',
      '+1234567890',
      'demo@opd-emr.com',
      'Outpatient',
      hashedPassword,
      1
    ]);
    
    console.log('✅ Demo doctor created successfully!');
    console.log('📧 Email: demo@opd-emr.com');
    console.log('🔑 Password: demo123');
    console.log('🆔 Doctor ID:', result.id);
    
  } catch (error) {
    console.error('❌ Error creating demo doctor:', error);
  }
}

// Run the script
createDemoDoctor().then(() => {
  console.log('🎯 Demo doctor setup complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
