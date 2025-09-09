const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🧪 Testing doctor dashboard consultation filter...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Test 1: Check current billing data
console.log('\n📊 Current Billing Data Analysis:');
console.log('=================================');

// Check all bills with their items
db.all(`
  SELECT 
    b.id as billId,
    b.billNumber,
    b.patientId,
    b.billing_status,
    b.total as billTotal,
    bi.serviceName,
    bi.service_type,
    bi.unitPrice,
    bi.totalPrice
  FROM bills b
  LEFT JOIN bill_items bi ON b.id = bi.billId
  WHERE b.billing_status = 'PAID'
  ORDER BY b.billNumber, bi.serviceName
`, [], (err, allBills) => {
  if (err) {
    console.error('❌ Error querying bills:', err.message);
    return;
  }
  
  console.log('\n💰 All PAID Bills with Items:');
  allBills.forEach((bill, index) => {
    console.log(`${index + 1}. Bill ${bill.billNumber} (Patient: ${bill.patientId})`);
    console.log(`   Status: ${bill.billing_status}, Total: ₹${bill.billTotal}`);
    if (bill.serviceName) {
      console.log(`   - ${bill.serviceName} (${bill.service_type}) - ₹${bill.unitPrice}`);
    }
    console.log('   ---');
  });
  
  // Test 2: Check consultation-only bills
  console.log('\n🩺 Consultation-Only Bills:');
  console.log('==========================');
  
  db.all(`
    SELECT DISTINCT 
      b.id as billId,
      b.billNumber,
      b.patientId,
      b.billing_status,
      b.total as billTotal,
      GROUP_CONCAT(bi.serviceName) as services,
      GROUP_CONCAT(bi.service_type) as service_types
    FROM bills b
    INNER JOIN bill_items bi ON b.id = bi.billId
    WHERE b.billing_status = 'PAID'
      AND bi.service_type = 'CL'
    GROUP BY b.id, b.billNumber, b.patientId, b.billing_status, b.total
    ORDER BY b.billNumber
  `, [], (err, consultationBills) => {
    if (err) {
      console.error('❌ Error querying consultation bills:', err.message);
      return;
    }
    
    if (consultationBills.length === 0) {
      console.log('❌ No consultation bills found');
    } else {
      consultationBills.forEach((bill, index) => {
        console.log(`${index + 1}. Bill ${bill.billNumber} (Patient: ${bill.patientId})`);
        console.log(`   Services: ${bill.services}`);
        console.log(`   Service Types: ${bill.service_types}`);
        console.log(`   Total: ₹${bill.billTotal}`);
        console.log('   ---');
      });
    }
    
    // Test 3: Check lab test-only bills
    console.log('\n🧪 Lab Test-Only Bills:');
    console.log('======================');
    
    db.all(`
      SELECT DISTINCT 
        b.id as billId,
        b.billNumber,
        b.patientId,
        b.billing_status,
        b.total as billTotal,
        GROUP_CONCAT(bi.serviceName) as services,
        GROUP_CONCAT(bi.service_type) as service_types
      FROM bills b
      INNER JOIN bill_items bi ON b.id = bi.billId
      WHERE b.billing_status = 'PAID'
        AND bi.service_type = 'I'
      GROUP BY b.id, b.billNumber, b.patientId, b.billing_status, b.total
      ORDER BY b.billNumber
    `, [], (err, labBills) => {
      if (err) {
        console.error('❌ Error querying lab bills:', err.message);
        return;
      }
      
      if (labBills.length === 0) {
        console.log('❌ No lab test bills found');
      } else {
        labBills.forEach((bill, index) => {
          console.log(`${index + 1}. Bill ${bill.billNumber} (Patient: ${bill.patientId})`);
          console.log(`   Services: ${bill.services}`);
          console.log(`   Service Types: ${bill.service_types}`);
          console.log(`   Total: ₹${bill.billTotal}`);
          console.log('   ---');
        });
      }
      
      // Test 4: Test the new doctor dashboard query
      console.log('\n🎯 Doctor Dashboard Query Test:');
      console.log('==============================');
      
      db.all(`
        SELECT DISTINCT p.*, 
               b.billNumber,
               b.billDate,
               b.total as billAmount,
               b.billing_status,
               b.createdAt as billingCompletedAt
        FROM patients p
        INNER JOIN bills b ON p.id = b.patientId
        INNER JOIN bill_items bi ON b.id = bi.billId
        WHERE b.billing_status = 'PAID'
          AND bi.service_type = 'CL'
        ORDER BY b.createdAt DESC
      `, [], (err, dashboardPatients) => {
        if (err) {
          console.error('❌ Error testing doctor dashboard query:', err.message);
          return;
        }
        
        console.log(`\n👥 Patients for Doctor Dashboard (Consultation Only): ${dashboardPatients.length}`);
        if (dashboardPatients.length === 0) {
          console.log('❌ No patients found for doctor dashboard');
        } else {
          dashboardPatients.forEach((patient, index) => {
            console.log(`${index + 1}. Patient: ${patient.firstName} ${patient.lastName}`);
            console.log(`   ID: ${patient.id}, Bill: ${patient.billNumber}`);
            console.log(`   Bill Amount: ₹${patient.billAmount}`);
            console.log(`   Billing Date: ${patient.billingCompletedAt}`);
            console.log('   ---');
          });
        }
        
        // Test 5: Compare with old query (all billing)
        console.log('\n📊 Comparison with Old Query (All Billing):');
        console.log('==========================================');
        
        db.all(`
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
        `, [], (err, allPatients) => {
          if (err) {
            console.error('❌ Error testing old query:', err.message);
            return;
          }
          
          console.log(`\n👥 All Patients with Any Billing: ${allPatients.length}`);
          console.log(`👥 Patients with Consultation Billing Only: ${dashboardPatients.length}`);
          console.log(`📉 Filtered Out: ${allPatients.length - dashboardPatients.length} patients`);
          
          if (allPatients.length > dashboardPatients.length) {
            console.log('\n✅ Filter is working! Lab test patients are now excluded from doctor dashboard.');
          } else {
            console.log('\n⚠️  No difference found. All patients may have consultation billing.');
          }
          
          console.log('\n🎉 Doctor Dashboard Consultation Filter Test Completed!');
          console.log('🩺 Only patients with consultation billing will now appear on doctor dashboard.');
          
          db.close();
        });
      });
    });
  });
});
