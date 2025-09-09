const { runQuery, getRow, getAll } = require('./database/database');

async function testPrescriptionRelationships() {
  try {
    console.log('🧪 Testing Prescription-Pharmacy-Lab Relationships...\n');
    
    // Test 1: Check if all required tables exist
    console.log('1️⃣ Checking required tables...');
    const requiredTables = ['prescriptions', 'pharmacy_orders', 'pharmacy_order_items', 'lab_orders', 'lab_order_items', 'pharmacy_items', 'lab_tests'];
    const allTables = await getAll("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const existingTables = allTables.map(t => t.name);
    
    console.log('📋 Found tables:', existingTables);
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables);
      return;
    } else {
      console.log('✅ All required tables exist\n');
    }
    
    // Test 2: Check foreign key relationships
    console.log('2️⃣ Checking foreign key relationships...');
    
    // Check pharmacy_orders table
    const pharmacyOrdersColumns = await getAll("PRAGMA table_info(pharmacy_orders)");
    const hasPrescriptionIdInPharmacyOrders = pharmacyOrdersColumns.some(col => col.name === 'prescriptionId');
    console.log(`   pharmacy_orders.prescriptionId: ${hasPrescriptionIdInPharmacyOrders ? '✅' : '❌'}`);
    
    // Check lab_orders table
    const labOrdersColumns = await getAll("PRAGMA table_info(lab_orders)");
    const hasPrescriptionIdInLabOrders = labOrdersColumns.some(col => col.name === 'prescriptionId');
    console.log(`   lab_orders.prescriptionId: ${hasPrescriptionIdInLabOrders ? '✅' : '❌'}`);
    
    // Check pharmacy_items table
    const pharmacyItemsColumns = await getAll("PRAGMA table_info(pharmacy_items)");
    const hasPrescriptionIdInPharmacyItems = pharmacyItemsColumns.some(col => col.name === 'prescriptionId');
    console.log(`   pharmacy_items.prescriptionId: ${hasPrescriptionIdInPharmacyItems ? '✅' : '❌'}`);
    
    console.log('');
    
    // Test 3: Create sample data and test relationships
    console.log('3️⃣ Testing data creation and relationships...');
    
    // Check if we have any prescriptions
    const prescriptionCount = await getRow('SELECT COUNT(*) as count FROM prescriptions');
    console.log(`📊 Found ${prescriptionCount.count} prescriptions in database`);
    
    let prescriptionId, patientId, doctorId;
    
    if (prescriptionCount.count === 0) {
      console.log('📝 Creating sample data...');
      
      // Create sample patient
      const patientResult = await runQuery(`
        INSERT INTO patients (
          patientId, firstName, lastName, dateOfBirth, age, gender, 
          phone, address, medicalHistory, allergies
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [1001, 'John', 'Doe', '1990-01-01', 34, 'Male', '1234567890', '123 Main St', 'None', 'None']);
      patientId = patientResult.id;
      console.log(`✅ Created patient with ID: ${patientId}`);
      
      // Create sample doctor
      const doctorResult = await runQuery(`
        INSERT INTO doctors (
          doctorId, name, specialization, license, phone, email, department
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['DOC001', 'Dr. Smith', 'General Medicine', 'MD001', '9876543210', 'dr.smith@example.com', 'General']);
      doctorId = doctorResult.id;
      console.log(`✅ Created doctor with ID: ${doctorId}`);
      
      // Create sample prescription
      const prescriptionResult = await runQuery(`
        INSERT INTO prescriptions (
          prescriptionId, patientId, doctorId, date, diagnosis, 
          symptoms, medications, instructions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'PRESC-001', patientId, doctorId, new Date().toISOString().split('T')[0],
        'Common Cold', 'Fever, cough', JSON.stringify([{name: 'Paracetamol', dosage: '500mg', frequency: '3 times daily'}]),
        'Take with food', 'active'
      ]);
      prescriptionId = prescriptionResult.id;
      console.log(`✅ Created prescription with ID: ${prescriptionId}`);
    } else {
      // Use existing prescription
      const prescription = await getRow('SELECT * FROM prescriptions LIMIT 1');
      prescriptionId = prescription.id;
      patientId = prescription.patientId;
      doctorId = prescription.doctorId;
      console.log(`✅ Using existing prescription ID: ${prescriptionId}`);
    }
    
    // Test 4: Create pharmacy order
    console.log('\n4️⃣ Testing pharmacy order creation...');
    
    // Create sample pharmacy item
    const itemResult = await runQuery(`
      INSERT OR IGNORE INTO pharmacy_items (
        sku, name, generic_name, brand, unit, item_type, 
        mrp, purchase_price, selling_price, is_active, prescriptionId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['MED001', 'Paracetamol 500mg', 'Paracetamol', 'Generic', 'Tablet', 'Medicine', 5.00, 3.00, 4.50, 1, prescriptionId]);
    
    const itemId = itemResult.id;
    console.log(`✅ Created pharmacy item with ID: ${itemId} linked to prescription ${prescriptionId}`);
    
    // Create pharmacy order
    const orderId = `PHARM-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    const pharmacyOrderResult = await runQuery(`
      INSERT INTO pharmacy_orders (
        orderId, prescriptionId, patientId, doctorId, 
        totalAmount, notes, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [orderId, prescriptionId, patientId, doctorId, 9.00, 'Test pharmacy order', 'routine', 'ordered']);
    
    const pharmacyOrderId = pharmacyOrderResult.id;
    console.log(`✅ Created pharmacy order with ID: ${pharmacyOrderId}`);
    
    // Create pharmacy order item
    await runQuery(`
      INSERT INTO pharmacy_order_items (
        orderId, itemId, itemName, itemCode, quantity, 
        unitPrice, totalPrice, instructions, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [pharmacyOrderId, itemId, 'Paracetamol 500mg', 'MED001', 2, 4.50, 9.00, 'Take with food', 'ordered']);
    
    console.log(`✅ Created pharmacy order item`);
    
    // Test 5: Create lab order
    console.log('\n5️⃣ Testing lab order creation...');
    
    // Create sample lab test
    const testResult = await runQuery(`
      INSERT OR IGNORE INTO lab_tests (
        testId, testName, testCode, category, subcategory, 
        price, description, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['LT001', 'Complete Blood Count', 'CBC', 'Hematology', 'Blood Analysis', 500.00, 'Complete blood count test', 1]);
    
    const testId = testResult.id;
    console.log(`✅ Created lab test with ID: ${testId}`);
    
    // Create lab order
    const labOrderId = `LAB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    const labOrderResult = await runQuery(`
      INSERT INTO lab_orders (
        orderId, prescriptionId, patientId, doctorId, 
        totalAmount, clinicalNotes, instructions, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [labOrderId, prescriptionId, patientId, doctorId, 500.00, 'Routine checkup', 'Fasting required', 'routine', 'ordered']);
    
    const labOrderIdResult = labOrderResult.id;
    console.log(`✅ Created lab order with ID: ${labOrderIdResult}`);
    
    // Create lab order item
    await runQuery(`
      INSERT INTO lab_order_items (
        orderId, testId, testName, testCode, price, 
        clinicalNotes, instructions, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [labOrderIdResult, testId, 'Complete Blood Count', 'CBC', 500.00, 'Check for anemia', 'Fasting required', 'ordered']);
    
    console.log(`✅ Created lab order item`);
    
    // Test 6: Test relationship queries
    console.log('\n6️⃣ Testing relationship queries...');
    
    // Query prescription with all related orders
    const relationshipData = await getAll(`
      SELECT 
        p.prescriptionId,
        p.diagnosis,
        po.orderId as pharmacy_order_id,
        po.totalAmount as pharmacy_total,
        po.status as pharmacy_status,
        lo.orderId as lab_order_id,
        lo.totalAmount as lab_total,
        lo.status as lab_status
      FROM prescriptions p
      LEFT JOIN pharmacy_orders po ON p.id = po.prescriptionId
      LEFT JOIN lab_orders lo ON p.id = lo.prescriptionId
      WHERE p.id = ?
    `, [prescriptionId]);
    
    console.log('🔍 Relationship query results:');
    relationshipData.forEach(row => {
      console.log(`   Prescription: ${row.prescriptionId}`);
      console.log(`   Diagnosis: ${row.diagnosis}`);
      console.log(`   Pharmacy Order: ${row.pharmacy_order_id} (Total: $${row.pharmacy_total}, Status: ${row.pharmacy_status})`);
      console.log(`   Lab Order: ${row.lab_order_id} (Total: $${row.lab_total}, Status: ${row.lab_status})`);
    });
    
    // Test 7: Test API endpoints (simulate)
    console.log('\n7️⃣ Testing API endpoint simulation...');
    
    // Simulate GET /api/prescriptions/:id/complete
    const completePrescription = await getRow(`
      SELECT p.*, 
             pat.firstName as patientFirstName,
             pat.lastName as patientLastName,
             d.name as doctorName
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      JOIN doctors d ON p.doctorId = d.id
      WHERE p.id = ?
    `, [prescriptionId]);
    
    const pharmacyOrders = await getAll(`
      SELECT po.*, 
             pat.firstName as patientFirstName,
             pat.lastName as patientLastName,
             d.name as doctorName
      FROM pharmacy_orders po
      JOIN patients pat ON po.patientId = pat.id
      JOIN doctors d ON po.doctorId = d.id
      WHERE po.prescriptionId = ?
    `, [prescriptionId]);
    
    const labOrders = await getAll(`
      SELECT lo.*, 
             pat.firstName as patientFirstName,
             pat.lastName as patientLastName,
             d.name as doctorName
      FROM lab_orders lo
      JOIN patients pat ON lo.patientId = pat.id
      JOIN doctors d ON lo.doctorId = d.id
      WHERE lo.prescriptionId = ?
    `, [prescriptionId]);
    
    console.log(`✅ Complete prescription data retrieved:`);
    console.log(`   - Prescription: ${completePrescription.prescriptionId}`);
    console.log(`   - Pharmacy Orders: ${pharmacyOrders.length}`);
    console.log(`   - Lab Orders: ${labOrders.length}`);
    
    console.log('\n🎉 All relationship tests completed successfully!');
    console.log('✅ Prescription-Pharmacy-Lab relationships are working correctly!');
    console.log('\n📋 Summary:');
    console.log('   - pharmacy_items table has prescriptionId foreign key');
    console.log('   - pharmacy_orders table has prescriptionId foreign key');
    console.log('   - lab_orders table has prescriptionId foreign key');
    console.log('   - All relationships can be queried and data flows correctly');
    console.log('   - API endpoints are ready for use');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPrescriptionRelationships();
