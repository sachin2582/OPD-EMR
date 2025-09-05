const fs = require('fs');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔧 Updating all lab test prices to 200...');
console.log('📁 Database path:', dbPath);

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file not found:', dbPath);
  process.exit(1);
}

// Try to read the database file and update it
try {
  // Read the database file
  const dbBuffer = fs.readFileSync(dbPath);
  console.log('✅ Database file read successfully');
  
  // For now, let's create a simple SQL update script
  const sqlScript = `
-- Update all lab test prices to 200
UPDATE lab_tests SET price = 200, updatedAt = CURRENT_TIMESTAMP;

-- Verify the update
SELECT COUNT(*) as total, COUNT(CASE WHEN price = 200 THEN 1 END) as updated_count FROM lab_tests;
`;

  // Write the SQL script to a file
  const scriptPath = path.join(__dirname, 'update-prices.sql');
  fs.writeFileSync(scriptPath, sqlScript);
  
  console.log('📝 SQL script created:', scriptPath);
  console.log('💡 You can run this script using any SQLite tool or database manager');
  console.log('🔧 The script will:');
  console.log('   1. Update all lab test prices to 200');
  console.log('   2. Update the updatedAt timestamp');
  console.log('   3. Verify the update was successful');
  
  console.log('\n📋 SQL Script Content:');
  console.log('─'.repeat(50));
  console.log(sqlScript);
  console.log('─'.repeat(50));
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
