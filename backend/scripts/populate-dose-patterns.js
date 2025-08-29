const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path - using the same database file as the backend server
const dbPath = path.join(__dirname, '../database/opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

// Dose patterns data
const dosePatterns = [
  { pattern: '1-0-0', description: 'Once a day, in the morning', category: 'daily' },
  { pattern: '0-0-1', description: 'Once a day, at night', category: 'daily' },
  { pattern: '1-0-1', description: 'Twice a day, morning and night', category: 'daily' },
  { pattern: '1-1-1', description: 'Thrice a day, morning, noon, and night', category: 'daily' },
  { pattern: '1-1-0', description: 'Twice a day, morning and noon', category: 'daily' },
  { pattern: '0-1-0', description: 'Once a day, at noon', category: 'daily' },
  { pattern: '0-1-1', description: 'Twice a day, noon and night', category: 'daily' },
  { pattern: '0-0-0-1', description: 'Once a day, before bed', category: 'daily' },
  { pattern: '0.5-0-0', description: 'Half tablet once daily, morning', category: 'fractional' },
  { pattern: '0.5-0-0.5', description: 'Half tablet twice daily, morning & night', category: 'fractional' },
  { pattern: '1-0-0-0', description: 'Once daily, morning only', category: 'daily' },
  { pattern: '0-0-0-0.5', description: 'Half tablet at bedtime', category: 'fractional' },
  { pattern: '2-0-0', description: 'Two tablets once daily, morning', category: 'daily' },
  { pattern: '0-0-2', description: 'Two tablets once daily, night', category: 'daily' },
  { pattern: '1-1-0-1', description: 'Three times daily, morning, noon, and night', category: 'daily' },
  { pattern: '0.25-0-0', description: 'Quarter tablet once daily, morning', category: 'fractional' },
  { pattern: '1-0-0-0.5', description: 'One tablet morning, half tablet night', category: 'mixed' },
  { pattern: '0-0-0-0.25', description: 'Quarter tablet at bedtime', category: 'fractional' },
  { pattern: '2-1-1', description: 'Two tablets morning, one each noon and night', category: 'mixed' },
  { pattern: '1-0-1-0.5', description: 'One tablet morning and night, half tablet noon', category: 'mixed' }
];

console.log('🚀 Starting dose patterns population...');
console.log('📁 Database path:', dbPath);

// Insert dose patterns
const insertDosePattern = (pattern) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT OR REPLACE INTO dose_patterns (pattern, description, category, isActive, updatedAt)
      VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [pattern.pattern, pattern.description, pattern.category], function(err) {
      if (err) {
        console.error(`❌ Error inserting ${pattern.pattern}:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Inserted: ${pattern.pattern} - ${pattern.description}`);
        resolve();
      }
    });
  });
};

// Main population function
const populateDosePatterns = async () => {
  try {
    console.log(`📊 Found ${dosePatterns.length} dose patterns to insert`);
    
    // Insert all patterns
    for (const pattern of dosePatterns) {
      await insertDosePattern(pattern);
    }
    
    console.log('🎉 All dose patterns populated successfully!');
    
    // Verify the data
    db.all('SELECT * FROM dose_patterns ORDER BY pattern', (err, rows) => {
      if (err) {
        console.error('❌ Error verifying data:', err.message);
      } else {
        console.log(`🔍 Verification: ${rows.length} patterns found in database`);
        console.log('📋 Sample patterns:');
        rows.slice(0, 5).forEach(row => {
          console.log(`   ${row.pattern}: ${row.description}`);
        });
      }
      
      // Close database
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('🔒 Database connection closed');
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Population failed:', error);
    db.close();
  }
};

// Run the population
populateDosePatterns();
