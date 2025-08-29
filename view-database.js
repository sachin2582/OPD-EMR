const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'backend', 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
  console.log('📁 Database file:', dbPath);
  console.log('\n' + '='.repeat(60));
});

// Function to view all tables
function viewAllTables() {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('📋 Available Tables:');
      tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.name}`);
      });
      console.log('\n' + '='.repeat(60));
      resolve(tables);
    });
  });
}

// Function to view table structure
function viewTableStructure(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`\n🏗️  Table Structure: ${tableName}`);
      console.log('Column Name'.padEnd(20) + 'Type'.padEnd(15) + 'Not Null'.padEnd(10) + 'Default'.padEnd(15) + 'Primary Key');
      console.log('-'.repeat(80));
      columns.forEach(col => {
        console.log(
          col.name.padEnd(20) + 
          col.type.padEnd(15) + 
          (col.notnull ? 'YES' : 'NO').padEnd(10) + 
          (col.dflt_value || 'NULL').padEnd(15) + 
          (col.pk ? 'YES' : 'NO')
        );
      });
      resolve(columns);
    });
  });
}

// Function to view table data
function viewTableData(tableName, limit = 5) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName} LIMIT ${limit}`, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`\n📊 Sample Data from ${tableName} (showing ${rows.length} rows):`);
      if (rows.length === 0) {
        console.log('  No data found');
        resolve([]);
        return;
      }
      
      // Get column names
      const columns = Object.keys(rows[0]);
      console.log('  ' + columns.join(' | '));
      console.log('  ' + '-'.repeat(columns.join(' | ').length));
      
      rows.forEach(row => {
        const values = columns.map(col => {
          const value = row[col];
          if (value === null) return 'NULL';
          if (typeof value === 'string' && value.length > 20) return value.substring(0, 20) + '...';
          return value;
        });
        console.log('  ' + values.join(' | '));
      });
      resolve(rows);
    });
  });
}

// Function to count records in table
function countTableRecords(tableName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`\n📈 Total records in ${tableName}: ${result.count}`);
      resolve(result.count);
    });
  });
}

// Main function to view database
async function viewDatabase() {
  try {
    // View all tables
    const tables = await viewAllTables();
    
    // For each table, show structure and sample data
    for (const table of tables) {
      const tableName = table.name;
      
      // Skip system tables
      if (tableName.startsWith('sqlite_')) continue;
      
      await viewTableStructure(tableName);
      await countTableRecords(tableName);
      await viewTableData(tableName, 3); // Show 3 sample rows
      console.log('\n' + '='.repeat(60));
    }
    
    console.log('\n✅ Database inspection complete!');
    console.log('\n💡 To modify the database:');
    console.log('   1. Use SQLite Browser: https://sqlitebrowser.org/');
    console.log('   2. Use VS Code SQLite extension');
    console.log('   3. Use online SQLite viewer: https://sqliteonline.com/');
    
  } catch (error) {
    console.error('❌ Error viewing database:', error);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\n🔒 Database connection closed');
      }
    });
  }
}

// Run the database viewer
viewDatabase();
