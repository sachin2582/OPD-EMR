const { runQuery, getRow } = require('./database/database');

async function testClinicAPI() {
  try {
    console.log('🧪 Testing clinic API functionality...');
    
    // Test fetching clinic data
    console.log('📝 Testing GET /api/clinic...');
    const clinic = await getRow('SELECT * FROM clinic_setup WHERE isActive = 1 ORDER BY id DESC LIMIT 1');
    
    if (clinic) {
      console.log('✅ Clinic data found:');
      console.log('   - Clinic Name:', clinic.clinicName);
      console.log('   - Address:', clinic.address);
      console.log('   - City:', clinic.city);
      console.log('   - State:', clinic.state);
      console.log('   - Phone:', clinic.phone);
      console.log('   - Email:', clinic.email);
      console.log('   - Website:', clinic.website);
      console.log('   - License:', clinic.license);
      console.log('   - Prescription Validity:', clinic.prescriptionValidity, 'days');
    } else {
      console.log('❌ No clinic data found');
    }
    
    // Test updating clinic data
    console.log('\n📝 Testing POST /api/clinic (update)...');
    const updateResult = await runQuery(`
      UPDATE clinic_setup 
      SET clinicName = ?, address = ?, city = ?, state = ?, pincode = ?, 
          phone = ?, email = ?, website = ?, license = ?, registration = ?, 
          prescriptionValidity = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      'Test Clinic Name',
      'Test Address', 
      'Test City',
      'Test State',
      '123456',
      '123-456-7890',
      'test@clinic.com',
      'https://www.testclinic.com',
      'TEST-LICENSE-001',
      'TEST-REG-001',
      45,
      clinic.id
    ]);
    
    console.log('✅ Update test completed. Changes:', updateResult.changes);
    
    // Verify the update
    const updatedClinic = await getRow('SELECT * FROM clinic_setup WHERE id = ?', [clinic.id]);
    console.log('✅ Updated clinic data:');
    console.log('   - Clinic Name:', updatedClinic.clinicName);
    console.log('   - Prescription Validity:', updatedClinic.prescriptionValidity, 'days');
    
    console.log('\n🎉 All clinic API tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing clinic API:', error);
  }
}

testClinicAPI();
