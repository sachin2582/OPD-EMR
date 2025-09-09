const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔧 Adding service_type column to lab_tests table...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// First, check if the column already exists
db.all("PRAGMA table_info(lab_tests)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error checking table structure:', err.message);
    return;
  }
  
  console.log('\n📋 Current lab_tests table structure:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
  
  // Check if service_type column already exists
  const hasServiceType = columns.some(col => col.name === 'service_type');
  
  if (hasServiceType) {
    console.log('\n✅ service_type column already exists!');
    updateExistingRecords();
    return;
  }
  
  console.log('\n🔧 Adding service_type column...');
  
  // Add the service_type column
  db.run(`
    ALTER TABLE lab_tests 
    ADD COLUMN service_type VARCHAR(10) DEFAULT 'I'
  `, [], function(err) {
    if (err) {
      console.error('❌ Error adding service_type column:', err.message);
      return;
    }
    
    console.log('✅ service_type column added successfully!');
    updateExistingRecords();
  });
});

function updateExistingRecords() {
  console.log('\n🔄 Updating existing lab_tests records with service_type...');
  
  // Update consultation services (if any exist in lab_tests)
  db.run(`
    UPDATE lab_tests 
    SET service_type = 'CL' 
    WHERE testName LIKE '%consultation%' 
       OR testName LIKE '%Consultation%'
       OR testName LIKE '%CONSULTATION%'
       OR category = 'Consultation'
  `, [], function(err) {
    if (err) {
      console.error('❌ Error updating consultation services:', err.message);
      return;
    }
    
    console.log(`✅ Updated ${this.changes} consultation services to 'CL'`);
    
    // Update lab test services
    db.run(`
      UPDATE lab_tests 
      SET service_type = 'I' 
      WHERE testName NOT LIKE '%consultation%' 
        AND testName NOT LIKE '%Consultation%'
        AND testName NOT LIKE '%CONSULTATION%'
        AND category != 'Consultation'
    `, [], function(err) {
      if (err) {
        console.error('❌ Error updating lab test services:', err.message);
        return;
      }
      
      console.log(`✅ Updated ${this.changes} lab test services to 'I'`);
      
      // Show final results
      db.all(`
        SELECT 
          service_type,
          COUNT(*) as count,
          GROUP_CONCAT(DISTINCT category) as categories
        FROM lab_tests 
        GROUP BY service_type
      `, [], (err, results) => {
        if (err) {
          console.error('❌ Error getting final results:', err.message);
          return;
        }
        
        console.log('\n📊 Final service_type distribution in lab_tests:');
        console.log('==============================================');
        results.forEach(result => {
          const typeName = result.service_type === 'CL' ? 'Consultation' : 'Lab Test/Other';
          console.log(`${result.service_type} (${typeName}): ${result.count} tests`);
          console.log(`  Categories: ${result.categories}`);
        });
        
        // Show updated table structure
        db.all("PRAGMA table_info(lab_tests)", [], (err, newColumns) => {
          if (err) {
            console.error('❌ Error checking updated table structure:', err.message);
            return;
          }
          
          console.log('\n📋 Updated lab_tests table structure:');
          newColumns.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
          });
          
          // Show sample data with service_type
          console.log('\n📊 Sample lab_tests data with service_type:');
          db.all(`
            SELECT 
              testName,
              category,
              service_type,
              price
            FROM lab_tests 
            ORDER BY service_type, category, testName
            LIMIT 10
          `, [], (err, sampleRows) => {
            if (err) {
              console.error('❌ Error getting sample data:', err.message);
              return;
            }
            
            sampleRows.forEach((row, index) => {
              console.log(`${index + 1}. ${row.testName} (${row.category}) - ${row.service_type} - ₹${row.price}`);
            });
            
            console.log('\n✅ service_type column addition to lab_tests completed successfully!');
            console.log('🔗 Now lab_tests and bill_items tables both have service_type for proper relation.');
            
            db.close();
          });
        });
      });
    });
  });
}
