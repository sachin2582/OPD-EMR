const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔍 Checking billing status values in database...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Check if bills table exists and get billing status values
db.all(`
  SELECT 
    billing_status,
    COUNT(*) as count,
    status,
    COUNT(*) as status_count
  FROM bills 
  GROUP BY billing_status, status
  ORDER BY billing_status, status
`, [], (err, rows) => {
  if (err) {
    console.error('❌ Error querying bills table:', err.message);
    return;
  }
  
  console.log('\n📊 Billing Status Summary:');
  console.log('========================');
  
  if (rows.length === 0) {
    console.log('❌ No bills found in database');
  } else {
    rows.forEach(row => {
      console.log(`Billing Status: "${row.billing_status}" | Status: "${row.status}" | Count: ${row.count}`);
    });
  }
  
  // Get sample bills
  db.all(`
    SELECT 
      id,
      billNumber,
      patientId,
      billing_status,
      status,
      total,
      createdAt
    FROM bills 
    ORDER BY createdAt DESC 
    LIMIT 10
  `, [], (err, sampleRows) => {
    if (err) {
      console.error('❌ Error getting sample bills:', err.message);
      return;
    }
    
    console.log('\n📋 Sample Bills (Latest 10):');
    console.log('============================');
    
    if (sampleRows.length === 0) {
      console.log('❌ No bills found');
    } else {
      sampleRows.forEach(bill => {
        console.log(`ID: ${bill.id} | Bill: ${bill.billNumber} | Patient: ${bill.patientId} | Billing Status: "${bill.billing_status}" | Status: "${bill.status}" | Total: ₹${bill.total} | Date: ${bill.createdAt}`);
      });
    }
    
    // Check patients with completed billing
    db.all(`
      SELECT DISTINCT 
        p.id,
        p.firstName,
        p.lastName,
        p.patientId,
        b.billNumber,
        b.billing_status,
        b.status,
        b.total,
        b.createdAt
      FROM patients p
      INNER JOIN bills b ON p.id = b.patientId
      WHERE b.billing_status = 'PAID'
      ORDER BY b.createdAt DESC
      LIMIT 10
    `, [], (err, paidBills) => {
      if (err) {
        console.error('❌ Error getting paid bills:', err.message);
        return;
      }
      
      console.log('\n✅ Patients with PAID billing status:');
      console.log('====================================');
      
      if (paidBills.length === 0) {
        console.log('❌ No patients found with PAID billing status');
        console.log('💡 This explains why doctor dashboard shows no patients!');
      } else {
        console.log(`Found ${paidBills.length} patients with PAID billing status:`);
        paidBills.forEach(patient => {
          console.log(`Patient: ${patient.firstName} ${patient.lastName} (ID: ${patient.patientId}) | Bill: ${patient.billNumber} | Status: "${patient.billing_status}" | Total: ₹${patient.total}`);
        });
      }
      
      // Check for other possible billing status values
      db.all(`
        SELECT DISTINCT billing_status FROM bills
      `, [], (err, statuses) => {
        if (err) {
          console.error('❌ Error getting billing statuses:', err.message);
          return;
        }
        
        console.log('\n🔍 All billing status values in database:');
        console.log('========================================');
        statuses.forEach(status => {
          console.log(`"${status.billing_status}"`);
        });
        
        db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err.message);
          } else {
            console.log('\n✅ Database connection closed');
          }
        });
      });
    });
  });
});
