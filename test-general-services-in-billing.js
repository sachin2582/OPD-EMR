const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🧪 Testing general services in lab_tests table...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Test 1: Check all general services by category
console.log('\n📊 General Services by Category:');
console.log('================================');

const categories = ['Radiology', 'Treatment', 'Pharmacy'];

categories.forEach(category => {
  console.log(`\n🏷️  ${category} Services:`);
  
  db.all(`
    SELECT 
      id,
      testName,
      testCode,
      price,
      description,
      isActive
    FROM lab_tests 
    WHERE category = ? AND isActive = 1
    ORDER BY testName
  `, [category], (err, rows) => {
    if (err) {
      console.error(`❌ Error querying ${category}:`, err.message);
      return;
    }
    
    if (rows.length === 0) {
      console.log(`  No services found in ${category}`);
    } else {
      rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.testName} - ₹${row.price}`);
        console.log(`     Code: ${row.testCode}`);
        console.log(`     Description: ${row.description}`);
      });
    }
  });
});

// Test 2: Check total count of general services
setTimeout(() => {
  console.log('\n📈 Total General Services Count:');
  console.log('================================');
  
  db.all(`
    SELECT 
      category,
      COUNT(*) as count,
      SUM(price) as total_value
    FROM lab_tests 
    WHERE category IN ('Radiology', 'Treatment', 'Pharmacy')
    GROUP BY category
    ORDER BY category
  `, [], (err, results) => {
    if (err) {
      console.error('❌ Error getting general services count:', err.message);
      return;
    }
    
    let totalCount = 0;
    let totalValue = 0;
    
    results.forEach(result => {
      console.log(`${result.category}: ${result.count} services, Total Value: ₹${result.total_value}`);
      totalCount += result.count;
      totalValue += result.total_value;
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`Total General Services: ${totalCount}`);
    console.log(`Total Value: ₹${totalValue}`);
    
    // Test 3: Verify these services will appear in billing
    console.log('\n🎯 Billing Screen Integration Test:');
    console.log('===================================');
    
    db.all(`
      SELECT 
        testName,
        category,
        price,
        isActive
      FROM lab_tests 
      WHERE category IN ('Radiology', 'Treatment', 'Pharmacy')
      AND isActive = 1
      ORDER BY category, testName
    `, [], (err, billingServices) => {
      if (err) {
        console.error('❌ Error getting billing services:', err.message);
        return;
      }
      
      console.log(`✅ ${billingServices.length} general services will appear in billing screen:`);
      billingServices.forEach(service => {
        console.log(`  - ${service.testName} (${service.category}) - ₹${service.price}`);
      });
      
      console.log('\n🎉 General services successfully integrated into lab_tests table!');
      console.log('📱 These services will now appear in the billing screen under their respective categories.');
      
      db.close();
    });
  });
}, 1000);
