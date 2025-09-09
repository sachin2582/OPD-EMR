const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🧪 Testing service_type relationship between lab_tests and bill_items...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Test 1: Check service_type distribution in both tables
console.log('\n📊 Service Type Distribution Comparison:');
console.log('========================================');

// Check lab_tests service_type distribution
db.all(`
  SELECT 
    service_type,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT category) as categories
  FROM lab_tests 
  GROUP BY service_type
  ORDER BY service_type
`, [], (err, labResults) => {
  if (err) {
    console.error('❌ Error querying lab_tests:', err.message);
    return;
  }
  
  console.log('\n🏥 lab_tests table:');
  labResults.forEach(result => {
    const typeName = result.service_type === 'CL' ? 'Consultation' : 'Lab Test/Other';
    console.log(`  ${result.service_type} (${typeName}): ${result.count} tests`);
    console.log(`    Categories: ${result.categories}`);
  });
  
  // Check bill_items service_type distribution
  db.all(`
    SELECT 
      service_type,
      COUNT(*) as count,
      GROUP_CONCAT(DISTINCT serviceName) as services
    FROM bill_items 
    GROUP BY service_type
    ORDER BY service_type
  `, [], (err, billResults) => {
    if (err) {
      console.error('❌ Error querying bill_items:', err.message);
      return;
    }
    
    console.log('\n💰 bill_items table:');
    billResults.forEach(result => {
      const typeName = result.service_type === 'CL' ? 'Consultation' : 'Lab Test/Other';
      console.log(`  ${result.service_type} (${typeName}): ${result.count} items`);
      console.log(`    Services: ${result.services}`);
    });
    
    // Test 2: Show how to join the tables using service_type
    console.log('\n🔗 Relationship Test - Joining tables by service_type:');
    console.log('====================================================');
    
    db.all(`
      SELECT 
        lt.testName as lab_test_name,
        lt.category as lab_category,
        lt.service_type as lab_service_type,
        lt.price as lab_price,
        bi.serviceName as bill_service_name,
        bi.service_type as bill_service_type,
        bi.unitPrice as bill_price,
        b.billNumber
      FROM lab_tests lt
      LEFT JOIN bill_items bi ON lt.service_type = bi.service_type
      LEFT JOIN bills b ON bi.billId = b.id
      WHERE lt.service_type = 'I'
      ORDER BY lt.testName
      LIMIT 10
    `, [], (err, joinResults) => {
      if (err) {
        console.error('❌ Error joining tables:', err.message);
        return;
      }
      
      console.log('\n📋 Sample joined data (Lab Tests with matching Bill Items):');
      joinResults.forEach((row, index) => {
        console.log(`${index + 1}. Lab Test: ${row.lab_test_name} (${row.lab_category})`);
        console.log(`   Service Type: ${row.lab_service_type}`);
        console.log(`   Lab Price: ₹${row.lab_price}`);
        if (row.bill_service_name) {
          console.log(`   Bill Item: ${row.bill_service_name}`);
          console.log(`   Bill Price: ₹${row.bill_price}`);
          console.log(`   Bill Number: ${row.billNumber}`);
        } else {
          console.log(`   Bill Item: Not yet billed`);
        }
        console.log('   ---');
      });
      
      // Test 3: Show service_type consistency
      console.log('\n✅ Service Type Consistency Check:');
      console.log('=================================');
      
      db.all(`
        SELECT 
          service_type,
          COUNT(*) as count
        FROM (
          SELECT service_type FROM lab_tests
          UNION ALL
          SELECT service_type FROM bill_items
        )
        GROUP BY service_type
        ORDER BY service_type
      `, [], (err, consistencyResults) => {
        if (err) {
          console.error('❌ Error checking consistency:', err.message);
          return;
        }
        
        console.log('\n📊 Service Type Usage Across Tables:');
        consistencyResults.forEach(result => {
          const typeName = result.service_type === 'CL' ? 'Consultation' : 'Lab Test/Other';
          console.log(`  ${result.service_type} (${typeName}): ${result.count} total records`);
        });
        
        // Test 4: Show how to get services by type
        console.log('\n🎯 Service Type Query Examples:');
        console.log('==============================');
        
        // Get all consultation services
        db.all(`
          SELECT 
            'lab_tests' as source_table,
            testName as service_name,
            service_type,
            price
          FROM lab_tests 
          WHERE service_type = 'CL'
          UNION ALL
          SELECT 
            'bill_items' as source_table,
            serviceName as service_name,
            service_type,
            unitPrice as price
          FROM bill_items 
          WHERE service_type = 'CL'
        `, [], (err, consultationResults) => {
          if (err) {
            console.error('❌ Error getting consultation services:', err.message);
            return;
          }
          
          console.log('\n🩺 Consultation Services (CL):');
          if (consultationResults.length === 0) {
            console.log('  No consultation services found');
          } else {
            consultationResults.forEach(result => {
              console.log(`  ${result.source_table}: ${result.service_name} - ₹${result.price}`);
            });
          }
          
          // Get all lab test services
          db.all(`
            SELECT 
              'lab_tests' as source_table,
              testName as service_name,
              service_type,
              price
            FROM lab_tests 
            WHERE service_type = 'I'
            LIMIT 5
            UNION ALL
            SELECT 
              'bill_items' as source_table,
              serviceName as service_name,
              service_type,
              unitPrice as price
            FROM bill_items 
            WHERE service_type = 'I'
            LIMIT 5
          `, [], (err, labResults) => {
            if (err) {
              console.error('❌ Error getting lab services:', err.message);
              return;
            }
            
            console.log('\n🧪 Lab Test Services (I) - Sample:');
            labResults.forEach(result => {
              console.log(`  ${result.source_table}: ${result.service_name} - ₹${result.price}`);
            });
            
            console.log('\n✅ Service Type Relationship Test Completed!');
            console.log('🔗 Both tables now have service_type column for proper relation.');
            console.log('📊 You can now:');
            console.log('  - Join tables by service_type');
            console.log('  - Filter services by type (CL/I)');
            console.log('  - Maintain consistency between lab_tests and bill_items');
            console.log('  - Generate reports by service type');
            
            db.close();
          });
        });
      });
    });
  });
});
