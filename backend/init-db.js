const { initDatabase } = require('./database/database');

console.log('🔄 Starting database initialization...');

async function initializeDB() {
  try {
    await initDatabase();
    console.log('✅ Database initialized successfully!');
    
    // Test the database by checking if tables exist
    const { getAll } = require('./database/database');
    
    try {
      const tables = await getAll("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('📋 Tables created:', tables.map(t => t.name));
      
      if (tables.some(t => t.name === 'prescriptions')) {
        const prescriptions = await getAll('SELECT COUNT(*) as count FROM prescriptions');
        console.log('📊 Prescriptions count:', prescriptions[0].count);
        
        if (prescriptions[0].count > 0) {
          const sample = await getAll('SELECT * FROM prescriptions LIMIT 1');
          console.log('📝 Sample prescription:', JSON.stringify(sample[0], null, 2));
        }
      }
      
      if (tables.some(t => t.name === 'patients')) {
        const patients = await getAll('SELECT COUNT(*) as count FROM patients');
        console.log('👥 Patients count:', patients[0].count);
      }
      
      if (tables.some(t => t.name === 'lab_tests')) {
        const labTests = await getAll('SELECT COUNT(*) as count FROM lab_tests');
        console.log('🧪 Lab tests count:', labTests[0].count);
      }
      
    } catch (testErr) {
      console.error('❌ Error testing database:', testErr);
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDB();
