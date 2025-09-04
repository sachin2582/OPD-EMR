const { runQuery, getRow, getAll } = require('./database/database');

async function migrateDoctorsTable() {
  try {
    console.log('🔄 [MIGRATION] Starting doctors table migration...');
    
    // Check if new columns already exist
    const tableInfo = await getAll('PRAGMA table_info(doctors)');
    const existingColumns = tableInfo.map(col => col.name);
    
    console.log('📋 [MIGRATION] Existing columns:', existingColumns);
    
    // Add missing columns
    const newColumns = [
      { name: 'qualification', type: 'TEXT', nullable: true },
      { name: 'experienceYears', type: 'INTEGER', nullable: true },
      { name: 'availability', type: 'TEXT', nullable: true }
    ];
    
    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`➕ [MIGRATION] Adding column: ${column.name}`);
        const nullable = column.nullable ? '' : 'NOT NULL';
        await runQuery(`ALTER TABLE doctors ADD COLUMN ${column.name} ${column.type} ${nullable}`);
        console.log(`✅ [MIGRATION] Column ${column.name} added successfully`);
      } else {
        console.log(`⏭️ [MIGRATION] Column ${column.name} already exists`);
      }
    }
    
    // Update existing records with default values if needed
    console.log('🔄 [MIGRATION] Updating existing records...');
    
    // Set default availability for existing doctors
    await runQuery(`
      UPDATE doctors 
      SET availability = 'Mon-Fri 9AM-5PM' 
      WHERE availability IS NULL OR availability = ''
    `);
    
    console.log('✅ [MIGRATION] Doctors table migration completed successfully!');
    
    // Show final table structure
    const finalTableInfo = await getAll('PRAGMA table_info(doctors)');
    console.log('📋 [MIGRATION] Final table structure:');
    finalTableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ [MIGRATION] Error during migration:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDoctorsTable()
    .then(() => {
      console.log('🎉 [MIGRATION] Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [MIGRATION] Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateDoctorsTable };
