const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔍 Checking lab_tests table structure...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Check table structure
db.all("PRAGMA table_info(lab_tests)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error checking table structure:', err.message);
    return;
  }
  
  console.log('\n📋 Current lab_tests table structure:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
  
  // Check current data
  db.all(`
    SELECT 
      id,
      testName,
      category,
      price,
      description,
      isActive
    FROM lab_tests 
    ORDER BY category, testName
    LIMIT 10
  `, [], (err, rows) => {
    if (err) {
      console.error('❌ Error querying lab_tests:', err.message);
      return;
    }
    
    console.log('\n📊 Current lab_tests data (first 10 records):');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.testName} (${row.category}) - ₹${row.price}`);
    });
    
    // Check categories
    db.all(`
      SELECT 
        category,
        COUNT(*) as count
      FROM lab_tests 
      GROUP BY category
      ORDER BY category
    `, [], (err, categories) => {
      if (err) {
        console.error('❌ Error getting categories:', err.message);
        return;
      }
      
      console.log('\n📂 Current categories in lab_tests:');
      categories.forEach(cat => {
        console.log(`  - ${cat.category}: ${cat.count} tests`);
      });
      
      db.close();
    });
  });
});
