const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Checking main database file: opd-emr.db');

const dbPath = path.join(__dirname, 'opd-emr.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Cannot access database:', err.message);
    return;
  }
  
  console.log('✅ Database connected successfully');
  
  // Check all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ Error getting tables:', err.message);
      return;
    }
    
    console.log('\n📋 Tables in database:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // Check clinic_setup data
    db.all('SELECT * FROM clinic_setup ORDER BY id DESC', (err, clinicRows) => {
      if (err) {
        console.error('❌ Error getting clinic data:', err.message);
        return;
      }
      
      console.log('\n🏥 Clinic setup data:');
      clinicRows.forEach((row, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`  ID: ${row.id}`);
        console.log(`  Name: ${row.clinicName}`);
        console.log(`  Address: ${row.address}`);
        console.log(`  City: ${row.city}`);
        console.log(`  State: ${row.state}`);
        console.log(`  Active: ${row.isActive}`);
        console.log(`  Created: ${row.createdAt}`);
        console.log(`  Updated: ${row.updatedAt}`);
      });
      
      // Get the active clinic data (what the API will return)
      db.all('SELECT * FROM clinic_setup WHERE isActive = 1 ORDER BY id DESC LIMIT 1', (err, activeClinic) => {
        if (err) {
          console.error('❌ Error getting active clinic:', err.message);
          return;
        }
        
        console.log('\n🎯 Active clinic data (what API returns):');
        if (activeClinic.length > 0) {
          console.log(JSON.stringify(activeClinic[0], null, 2));
        } else {
          console.log('❌ No active clinic found');
        }
        
        db.close();
      });
    });
  });
});
