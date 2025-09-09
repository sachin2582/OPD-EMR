const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔍 Verifying service_type relationship...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Check both tables have service_type column
console.log('\n📋 Checking service_type column in both tables:');

// Check lab_tests
db.all("PRAGMA table_info(lab_tests)", [], (err, labColumns) => {
  if (err) {
    console.error('❌ Error checking lab_tests structure:', err.message);
    return;
  }
  
  const labHasServiceType = labColumns.some(col => col.name === 'service_type');
  console.log(`🏥 lab_tests has service_type: ${labHasServiceType ? '✅ Yes' : '❌ No'}`);
  
  // Check bill_items
  db.all("PRAGMA table_info(bill_items)", [], (err, billColumns) => {
    if (err) {
      console.error('❌ Error checking bill_items structure:', err.message);
      return;
    }
    
    const billHasServiceType = billColumns.some(col => col.name === 'service_type');
    console.log(`💰 bill_items has service_type: ${billHasServiceType ? '✅ Yes' : '❌ No'}`);
    
    if (labHasServiceType && billHasServiceType) {
      console.log('\n✅ Both tables have service_type column!');
      
      // Show sample data
      console.log('\n📊 Sample data from both tables:');
      
      // Lab tests sample
      db.all(`
        SELECT testName, category, service_type, price
        FROM lab_tests 
        WHERE service_type = 'I'
        LIMIT 3
      `, [], (err, labSample) => {
        if (err) {
          console.error('❌ Error getting lab sample:', err.message);
          return;
        }
        
        console.log('\n🏥 lab_tests sample (service_type = I):');
        labSample.forEach((row, index) => {
          console.log(`  ${index + 1}. ${row.testName} (${row.category}) - ${row.service_type} - ₹${row.price}`);
        });
        
        // Bill items sample
        db.all(`
          SELECT serviceName, service_type, unitPrice
          FROM bill_items 
          WHERE service_type = 'I'
          LIMIT 3
        `, [], (err, billSample) => {
          if (err) {
            console.error('❌ Error getting bill sample:', err.message);
            return;
          }
          
          console.log('\n💰 bill_items sample (service_type = I):');
          billSample.forEach((row, index) => {
            console.log(`  ${index + 1}. ${row.serviceName} - ${row.service_type} - ₹${row.unitPrice}`);
          });
          
          // Show counts
          db.all(`
            SELECT 
              'lab_tests' as table_name,
              service_type,
              COUNT(*) as count
            FROM lab_tests 
            GROUP BY service_type
            UNION ALL
            SELECT 
              'bill_items' as table_name,
              service_type,
              COUNT(*) as count
            FROM bill_items 
            GROUP BY service_type
            ORDER BY table_name, service_type
          `, [], (err, counts) => {
            if (err) {
              console.error('❌ Error getting counts:', err.message);
              return;
            }
            
            console.log('\n📈 Service Type Counts:');
            counts.forEach(row => {
              const typeName = row.service_type === 'CL' ? 'Consultation' : 'Lab Test/Other';
              console.log(`  ${row.table_name}: ${row.service_type} (${typeName}) - ${row.count} records`);
            });
            
            console.log('\n✅ Service Type Relationship Verified!');
            console.log('🔗 Both tables now have service_type column for proper relation.');
            console.log('📊 You can now join tables by service_type and maintain consistency.');
            
            db.close();
          });
        });
      });
    } else {
      console.log('\n❌ One or both tables missing service_type column');
      db.close();
    }
  });
});
