const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking user and doctor data...');

// Check users table for dr.suneet.verma
db.get('SELECT * FROM users WHERE username = ?', ['dr.suneet.verma'], (err, user) => {
  if (err) {
    console.error('❌ Error querying users:', err);
    db.close();
    return;
  }
  
  if (!user) {
    console.log('❌ User dr.suneet.verma not found in users table');
    console.log('📋 Available users:');
    
    // Show all users
    db.all('SELECT id, username, fullName, email, role FROM users', (err, users) => {
      if (err) {
        console.error('❌ Error querying all users:', err);
      } else {
        users.forEach(u => {
          console.log(`   ID: ${u.id}, Username: ${u.username}, Name: ${u.fullName}, Role: ${u.role}`);
        });
      }
      db.close();
    });
    return;
  }
  
  console.log('✅ User found:', {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role
  });
  
  // Check doctors table for matching doctor
  db.get('SELECT * FROM doctors WHERE user_id = ? OR name LIKE ? OR email = ?', 
    [user.id, `%${user.fullName || user.username}%`, user.email], (err, doctor) => {
    if (err) {
      console.error('❌ Error querying doctors:', err);
      db.close();
      return;
    }
    
    if (!doctor) {
      console.log('❌ No doctor record found for user');
      console.log('📋 Available doctors:');
      
      // Show all doctors
      db.all('SELECT id, doctorId, name, email, user_id FROM doctors', (err, doctors) => {
        if (err) {
          console.error('❌ Error querying all doctors:', err);
        } else {
          doctors.forEach(d => {
            console.log(`   ID: ${d.id}, Doctor ID: ${d.doctorId}, Name: ${d.name}, Email: ${d.email}, User ID: ${d.user_id}`);
          });
        }
        db.close();
      });
      return;
    }
    
    console.log('✅ Doctor found:', {
      id: doctor.id,
      doctorId: doctor.doctorId,
      name: doctor.name,
      email: doctor.email,
      user_id: doctor.user_id,
      specialization: doctor.specialization
    });
    
    db.close();
  });
});
