const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'opd-emr.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking doctor data in database...');

// Check users table
db.get('SELECT * FROM users WHERE username = ?', ['dr.suneet.verma'], (err, user) => {
  if (err) {
    console.error('❌ Error querying users:', err);
    return;
  }
  
  if (!user) {
    console.log('❌ User dr.suneet.verma not found in users table');
    db.close();
    return;
  }
  
  console.log('✅ User found:', {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  });
  
  // Check doctors table
  db.get('SELECT * FROM doctors WHERE user_id = ?', [user.id], (err, doctor) => {
    if (err) {
      console.error('❌ Error querying doctors:', err);
      db.close();
      return;
    }
    
    if (!doctor) {
      console.log('❌ No doctor record found for user_id:', user.id);
      console.log('📋 Available doctors:');
      
      // Show all doctors
      db.all('SELECT * FROM doctors', (err, doctors) => {
        if (err) {
          console.error('❌ Error querying all doctors:', err);
        } else {
          console.log('📋 All doctors in database:');
          doctors.forEach(d => {
            console.log(`   ID: ${d.id}, Name: ${d.name}, User ID: ${d.user_id}, Code: ${d.doctor_code}`);
          });
        }
        db.close();
      });
      return;
    }
    
    console.log('✅ Doctor found:', {
      id: doctor.id,
      name: doctor.name,
      user_id: doctor.user_id,
      doctor_code: doctor.doctor_code,
      specialization: doctor.specialization,
      is_active: doctor.is_active
    });
    
    db.close();
  });
});
