const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔧 Inserting bill series data...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Check current data first
db.all(`
  SELECT 
    id,
    seriesId,
    seriesName,
    prefix,
    suffix,
    startNumber,
    currentNumber,
    format,
    isActive,
    description
  FROM bill_series 
  ORDER BY id
`, [], (err, existingRows) => {
  if (err) {
    console.error('❌ Error querying existing bill_series:', err.message);
    return;
  }
  
  console.log('\n📊 Current bill_series data:');
  if (existingRows.length === 0) {
    console.log('  No data found in bill_series table');
  } else {
    existingRows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.seriesName}: ${row.prefix}${row.currentNumber}${row.suffix || ''} (Active: ${row.isActive})`);
    });
  }
  
  // Define bill series to insert
  const billSeries = [
    {
      seriesId: 'BILL-001',
      seriesName: 'General Billing',
      prefix: 'BILL-',
      suffix: '',
      startNumber: 1,
      currentNumber: 1,
      format: 'BILL-{number}',
      isActive: 1,
      description: 'Main billing series for general services'
    },
    {
      seriesId: 'CONS-001',
      seriesName: 'Consultation Billing',
      prefix: 'CONS-',
      suffix: '',
      startNumber: 1,
      currentNumber: 1,
      format: 'CONS-{number}',
      isActive: 1,
      description: 'Billing series for consultation services'
    },
    {
      seriesId: 'LAB-001',
      seriesName: 'Lab Test Billing',
      prefix: 'LAB-',
      suffix: '',
      startNumber: 1,
      currentNumber: 1,
      format: 'LAB-{number}',
      isActive: 1,
      description: 'Billing series for laboratory tests'
    },
    {
      seriesId: 'PHARM-001',
      seriesName: 'Pharmacy Billing',
      prefix: 'PHARM-',
      suffix: '',
      startNumber: 1,
      currentNumber: 1,
      format: 'PHARM-{number}',
      isActive: 1,
      description: 'Billing series for pharmacy services'
    }
  ];
  
  // Function to check if series already exists
  const checkExistingSeries = (seriesId) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id FROM bill_series 
        WHERE seriesId = ?
      `, [seriesId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? true : false);
        }
      });
    });
  };
  
  // Function to insert series
  const insertSeries = (series) => {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO bill_series (
          seriesId, seriesName, prefix, suffix, startNumber, 
          currentNumber, format, isActive, description, 
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        series.seriesId,
        series.seriesName,
        series.prefix,
        series.suffix,
        series.startNumber,
        series.currentNumber,
        series.format,
        series.isActive,
        series.description
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  };
  
  // Main execution
  async function insertBillSeries() {
    console.log('\n🔄 Inserting bill series data...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const series of billSeries) {
      try {
        // Check if series already exists
        const exists = await checkExistingSeries(series.seriesId);
        
        if (exists) {
          console.log(`⏭️  Skipping ${series.seriesName} - already exists`);
          skippedCount++;
        } else {
          // Insert the series
          const newId = await insertSeries(series);
          console.log(`✅ Added ${series.seriesName}: ${series.format} [ID: ${newId}]`);
          addedCount++;
        }
      } catch (error) {
        console.error(`❌ Error adding ${series.seriesName}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Added: ${addedCount} series`);
    console.log(`  - Skipped: ${skippedCount} series`);
    
    // Show final results
    console.log('\n📋 Final bill_series data:');
    db.all(`
      SELECT 
        id,
        seriesId,
        seriesName,
        prefix,
        currentNumber,
        suffix,
        format,
        isActive,
        description
      FROM bill_series 
      ORDER BY id
    `, [], (err, finalRows) => {
      if (err) {
        console.error('❌ Error getting final results:', err.message);
        return;
      }
      
      finalRows.forEach((row, index) => {
        const currentBill = row.format.replace('{number}', row.currentNumber);
        console.log(`${index + 1}. ${row.seriesName} (${row.seriesId})`);
        console.log(`   Format: ${row.format}`);
        console.log(`   Current: ${currentBill}`);
        console.log(`   Active: ${row.isActive ? 'Yes' : 'No'}`);
        console.log(`   Description: ${row.description}`);
        console.log('   ---');
      });
      
      console.log('\n✅ Bill series data inserted successfully!');
      console.log('🎯 The system can now use these series for billing.');
      
      db.close();
    });
  }
  
  // Execute the function
  insertBillSeries().catch(error => {
    console.error('❌ Error in main execution:', error);
    db.close();
  });
});
