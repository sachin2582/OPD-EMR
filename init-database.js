const { initDatabase } = require('./backend/database/database');

async function initializeDB() {
  try {
    console.log('🔧 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDB();
urm