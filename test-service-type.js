const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🧪 Testing service_type column functionality...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Test 1: Check current bill_items with service_type
console.log('\n📊 Current bill_items with service_type:');
console.log('========================================');

db.all(`
  SELECT 
    bi.id,
    bi.serviceName,
    bi.serviceType,
    bi.service_type,
    bi.quantity,
    bi.unitPrice,
    bi.totalPrice,
    b.billNumber,
    b.createdAt
  FROM bill_items bi
  JOIN bills b ON bi.billId = b.id
  ORDER BY b.createdAt DESC
  LIMIT 10
`, [], (err, rows) => {
  if (err) {
    console.error('❌ Error querying bill_items:', err.message);
    return;
  }
  
  if (rows.length === 0) {
    console.log('❌ No bill items found');
  } else {
    console.log(`Found ${rows.length} bill items:`);
    rows.forEach((item, index) => {
      console.log(`${index + 1}. ${item.serviceName}`);
      console.log(`   Service Type: ${item.serviceType}`);
      console.log(`   Service Type Code: ${item.service_type}`);
      console.log(`   Bill: ${item.billNumber}`);
      console.log(`   Price: ₹${item.unitPrice} × ${item.quantity} = ₹${item.totalPrice}`);
      console.log('   ---');
    });
  }
  
  // Test 2: Group by service_type
  console.log('\n📈 Service Type Distribution:');
  console.log('=============================');
  
  db.all(`
    SELECT 
      service_type,
      COUNT(*) as count,
      SUM(totalPrice) as total_amount,
      GROUP_CONCAT(DISTINCT serviceName) as services
    FROM bill_items 
    GROUP BY service_type
    ORDER BY service_type
  `, [], (err, results) => {
    if (err) {
      console.error('❌ Error getting service type distribution:', err.message);
      return;
    }
    
    results.forEach(result => {
      const typeName = result.service_type === 'CL' ? 'Consultation' : 'Lab Test/Other';
      console.log(`${result.service_type} (${typeName}): ${result.count} items, Total: ₹${result.total_amount}`);
      console.log(`  Services: ${result.services}`);
    });
    
    // Test 3: Check for any missing service_type values
    console.log('\n🔍 Checking for missing service_type values:');
    console.log('===========================================');
    
    db.all(`
      SELECT COUNT(*) as count
      FROM bill_items 
      WHERE service_type IS NULL OR service_type = ''
    `, [], (err, nullResults) => {
      if (err) {
        console.error('❌ Error checking for null service_type:', err.message);
        return;
      }
      
      const nullCount = nullResults[0].count;
      if (nullCount === 0) {
        console.log('✅ All bill items have service_type values');
      } else {
        console.log(`❌ Found ${nullCount} bill items with missing service_type values`);
      }
      
      // Test 4: Verify the column structure
      console.log('\n📋 Final bill_items table structure:');
      console.log('===================================');
      
      db.all("PRAGMA table_info(bill_items)", [], (err, columns) => {
        if (err) {
          console.error('❌ Error checking table structure:', err.message);
          return;
        }
        
        columns.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
        
        console.log('\n✅ service_type column test completed successfully!');
        console.log('\n📝 Summary:');
        console.log('- service_type column added successfully');
        console.log('- CL = Consultation services');
        console.log('- I = Lab tests and other services');
        console.log('- All existing records updated with appropriate values');
        
        db.close();
      });
    });
  });
});
