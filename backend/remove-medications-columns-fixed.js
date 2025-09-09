const { runQuery, getRow, getAll } = require('./database/database');

async function removeMedicationsColumns() {
  try {
    console.log('🔧 Removing medications and labTestRecommendations columns from prescriptions table...\n');
    
    // First, check current structure
    console.log('1️⃣ Checking current prescriptions table structure...');
    const columns = await getAll("PRAGMA table_info(prescriptions)");
    console.log('📋 Current prescriptions columns:');
    columns.forEach(col => {
      console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    const hasMedications = columns.some(col => col.name === 'medications');
    const hasLabTestRecommendations = columns.some(col => col.name === 'labTestRecommendations');
    
    console.log(`\n📊 Found medications column: ${hasMedications ? '✅' : '❌'}`);
    console.log(`📊 Found labTestRecommendations column: ${hasLabTestRecommendations ? '❌' : '❌'}`);
    
    if (!hasMedications && !hasLabTestRecommendations) {
      console.log('✅ Both columns already removed or do not exist');
      return;
    }
    
    // Disable foreign keys temporarily
    console.log('\n2️⃣ Temporarily disabling foreign keys...');
    await runQuery('PRAGMA foreign_keys = OFF');
    console.log('✅ Foreign keys disabled');
    
    // Create new prescriptions table without medications and labTestRecommendations
    console.log('\n3️⃣ Creating new prescriptions table structure...');
    
    await runQuery(`
      CREATE TABLE prescriptions_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prescriptionId TEXT UNIQUE NOT NULL,
        patientId INTEGER NOT NULL,
        doctorId INTEGER NOT NULL,
        date TEXT NOT NULL,
        diagnosis TEXT,
        symptoms TEXT,
        examination TEXT,
        instructions TEXT,
        followUp TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ New prescriptions table created');
    
    // Copy data from old table to new table (excluding medications and labTestRecommendations)
    console.log('\n4️⃣ Migrating data to new table...');
    await runQuery(`
      INSERT INTO prescriptions_new (
        id, prescriptionId, patientId, doctorId, date, diagnosis, 
        symptoms, examination, instructions, followUp, notes, 
        status, createdAt, updatedAt
      )
      SELECT 
        id, prescriptionId, patientId, doctorId, date, diagnosis, 
        symptoms, examination, instructions, followUp, notes, 
        status, createdAt, updatedAt
      FROM prescriptions
    `);
    console.log('✅ Data migrated to new table');
    
    // Drop old table
    console.log('\n5️⃣ Dropping old prescriptions table...');
    await runQuery('DROP TABLE prescriptions');
    console.log('✅ Old prescriptions table dropped');
    
    // Rename new table to prescriptions
    console.log('\n6️⃣ Renaming new table to prescriptions...');
    await runQuery('ALTER TABLE prescriptions_new RENAME TO prescriptions');
    console.log('✅ Table renamed to prescriptions');
    
    // Re-enable foreign keys
    console.log('\n7️⃣ Re-enabling foreign keys...');
    await runQuery('PRAGMA foreign_keys = ON');
    console.log('✅ Foreign keys re-enabled');
    
    // Add foreign key constraints
    console.log('\n8️⃣ Adding foreign key constraints...');
    await runQuery(`
      CREATE TABLE prescriptions_temp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prescriptionId TEXT UNIQUE NOT NULL,
        patientId INTEGER NOT NULL,
        doctorId INTEGER NOT NULL,
        date TEXT NOT NULL,
        diagnosis TEXT,
        symptoms TEXT,
        examination TEXT,
        instructions TEXT,
        followUp TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients (id),
        FOREIGN KEY (doctorId) REFERENCES doctors (id)
      )
    `);
    
    await runQuery(`
      INSERT INTO prescriptions_temp (
        id, prescriptionId, patientId, doctorId, date, diagnosis, 
        symptoms, examination, instructions, followUp, notes, 
        status, createdAt, updatedAt
      )
      SELECT 
        id, prescriptionId, patientId, doctorId, date, diagnosis, 
        symptoms, examination, instructions, followUp, notes, 
        status, createdAt, updatedAt
      FROM prescriptions
    `);
    
    await runQuery('DROP TABLE prescriptions');
    await runQuery('ALTER TABLE prescriptions_temp RENAME TO prescriptions');
    console.log('✅ Foreign key constraints added');
    
    // Recreate indexes
    console.log('\n9️⃣ Recreating indexes...');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_prescriptions_patientId ON prescriptions(patientId)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_prescriptions_doctorId ON prescriptions(doctorId)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_prescriptions_prescriptionId ON prescriptions(prescriptionId)');
    console.log('✅ Indexes recreated');
    
    // Verify final structure
    console.log('\n🔟 Verifying final structure...');
    const finalColumns = await getAll("PRAGMA table_info(prescriptions)");
    console.log('📋 Final prescriptions table structure:');
    finalColumns.forEach(col => {
      console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Check if medications and labTestRecommendations columns are gone
    const finalHasMedications = finalColumns.some(col => col.name === 'medications');
    const finalHasLabTestRecommendations = finalColumns.some(col => col.name === 'labTestRecommendations');
    
    console.log(`\n📊 medications column removed: ${!finalHasMedications ? '✅' : '❌'}`);
    console.log(`📊 labTestRecommendations column removed: ${!finalHasLabTestRecommendations ? '✅' : '❌'}`);
    
    // Check data integrity
    const prescriptionCount = await getRow('SELECT COUNT(*) as count FROM prescriptions');
    console.log(`\n📊 Prescriptions count after migration: ${prescriptionCount.count}`);
    
    console.log('\n🎉 Successfully removed medications and labTestRecommendations columns!');
    console.log('📝 Note: Medications and lab recommendations should now be saved to:');
    console.log('   - pharmacy_items table (for medications)');
    console.log('   - lab_orders table (for lab test recommendations)');
    console.log('   - Both tables have prescriptionId foreign key to link to prescriptions');
    
  } catch (error) {
    console.error('❌ Error removing columns:', error);
  }
}

removeMedicationsColumns();
