const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔍 Testing Doctor Patients Query...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Test the exact query used in the API
const query = `
  SELECT DISTINCT p.*, 
         b.billNumber,
         b.billDate,
         b.total as billAmount,
         b.billing_status,
         b.createdAt as billingCompletedAt
  FROM patients p
  INNER JOIN bills b ON p.id = b.patientId
  WHERE b.billing_status = 'PAID'
  ORDER BY b.createdAt DESC
`;

console.log('\n🔍 Executing query:');
console.log(query);

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('❌ Error executing query:', err.message);
    return;
  }
  
  console.log(`\n✅ Query executed successfully`);
  console.log(`📊 Found ${rows.length} patients with completed billing`);
  
  if (rows.length > 0) {
    console.log('\n📋 Patient Details:');
    console.log('==================');
    rows.forEach((patient, index) => {
      console.log(`${index + 1}. Patient ID: ${patient.id}`);
      console.log(`   Name: ${patient.firstName} ${patient.lastName}`);
      console.log(`   Patient ID: ${patient.patientId}`);
      console.log(`   Bill Number: ${patient.billNumber}`);
      console.log(`   Bill Amount: ₹${patient.billAmount}`);
      console.log(`   Billing Status: ${patient.billing_status}`);
      console.log(`   Bill Date: ${patient.billDate}`);
      console.log(`   Created At: ${patient.billingCompletedAt}`);
      console.log('   ---');
    });
    
    // Test prescription check for each patient
    console.log('\n🔍 Checking prescriptions for each patient...');
    let completedChecks = 0;
    
    rows.forEach((patient, index) => {
      db.all(
        'SELECT * FROM prescriptions WHERE patientId = ? ORDER BY createdAt DESC LIMIT 1',
        [patient.id],
        (err, prescriptions) => {
          if (err) {
            console.error(`❌ Error checking prescriptions for patient ${patient.id}:`, err.message);
          } else {
            const hasPrescription = prescriptions && prescriptions.length > 0;
            const status = hasPrescription ? 'completed' : 'waiting';
            console.log(`Patient ${patient.firstName} ${patient.lastName}: ${status} (${hasPrescription ? 'has' : 'no'} prescription)`);
          }
          
          completedChecks++;
          if (completedChecks === rows.length) {
            console.log('\n✅ All prescription checks completed');
            db.close();
          }
        }
      );
    });
  } else {
    console.log('❌ No patients found with completed billing');
    console.log('💡 This means the doctor dashboard will show no patients');
    
    // Check if there are any bills at all
    db.all('SELECT COUNT(*) as count FROM bills', [], (err, result) => {
      if (err) {
        console.error('❌ Error checking bills count:', err.message);
      } else {
        console.log(`📊 Total bills in database: ${result[0].count}`);
      }
      
      // Check billing statuses
      db.all('SELECT DISTINCT billing_status FROM bills', [], (err, statuses) => {
        if (err) {
          console.error('❌ Error checking billing statuses:', err.message);
        } else {
          console.log('📊 Available billing statuses:');
          statuses.forEach(status => {
            console.log(`   - "${status.billing_status}"`);
          });
        }
        
        db.close();
      });
    });
  }
});
