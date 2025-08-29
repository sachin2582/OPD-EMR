const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, './database/opd-emr.db');

console.log('🔧 Creating dose_patterns table...');

const db = new sqlite3.Database(dbPath);

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS dose_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createTableSQL, (err) => {
  if (err) {
    console.error('❌ Error creating table:', err);
  } else {
    console.log('✅ dose_patterns table created successfully');
  }
  
  // Close database
  db.close();
  console.log('🔒 Database connection closed');
});
