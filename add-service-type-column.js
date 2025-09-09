const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔧 Adding service_type column to bill_items table...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// First, check if the column already exists
db.all("PRAGMA table_info(bill_items)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error checking table structure:', err.message);
    return;
  }
  
  console.log('\n📋 Current bill_items table structure:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
  
  // Check if service_type column already exists
  const hasServiceType = columns.some(col => col.name === 'service_type');
  
  if (hasServiceType) {
    console.log('\n✅ service_type column already exists!');
    db.close();
    return;
  }
  
  console.log('\n🔧 Adding service_type column...');
  
  // Add the service_type column
  db.run(`
    ALTER TABLE bill_items 
    ADD COLUMN service_type VARCHAR(10) DEFAULT 'I'
  `, [], function(err) {
    if (err) {
      console.error('❌ Error adding service_type column:', err.message);
      return;
    }
    
    console.log('✅ service_type column added successfully!');
    
    // Update existing records based on serviceName
    console.log('\n🔄 Updating existing records with service_type...');
    
    // Update consultation services
    db.run(`
      UPDATE bill_items 
      SET service_type = 'CL' 
      WHERE serviceName LIKE '%consultation%' 
         OR serviceName LIKE '%Consultation%'
         OR serviceName LIKE '%CONSULTATION%'
    `, [], function(err) {
      if (err) {
        console.error('❌ Error updating consultation services:', err.message);
        return;
      }
      
      console.log(`✅ Updated ${this.changes} consultation services to 'CL'`);
      
      // Update lab test services
      db.run(`
        UPDATE bill_items 
        SET service_type = 'I' 
        WHERE serviceName NOT LIKE '%consultation%' 
          AND serviceName NOT LIKE '%Consultation%'
          AND serviceName NOT LIKE '%CONSULTATION%'
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
            GROUP_CONCAT(DISTINCT serviceName) as services
          FROM bill_items 
          GROUP BY service_type
        `, [], (err, results) => {
          if (err) {
            console.error('❌ Error getting final results:', err.message);
            return;
          }
          
          console.log('\n📊 Final service_type distribution:');
          console.log('==================================');
          results.forEach(result => {
            console.log(`${result.service_type}: ${result.count} items`);
            console.log(`  Services: ${result.services}`);
          });
          
          // Show updated table structure
          db.all("PRAGMA table_info(bill_items)", [], (err, newColumns) => {
            if (err) {
              console.error('❌ Error checking updated table structure:', err.message);
              return;
            }
            
            console.log('\n📋 Updated bill_items table structure:');
            newColumns.forEach(col => {
              console.log(`  - ${col.name} (${col.type})`);
            });
            
            console.log('\n✅ service_type column addition completed successfully!');
            db.close();
          });
        });
      });
    });
  });
});
