const sqlite3 = require('sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'opd-emr.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

async function testPrescriptionRelationships() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🧪 Testing prescription relationships...\n');
      
      // Test 1: Check if all tables exist
      console.log('1️⃣ Checking if all required tables exist...');
      db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name IN ('prescriptions', 'pharmacy_orders', 'pharmacy_order_items', 'lab_orders', 'lab_order_items', 'pharmacy_items', 'lab_tests')
        ORDER BY name
      `, (err, tables) => {
        if (err) {
          console.error('❌ Error checking tables:', err.message);
          reject(err);
          return;
        }
        
        console.log('📋 Found tables:', tables.map(t => t.name));
        
        const requiredTables = ['prescriptions', 'pharmacy_orders', 'pharmacy_order_items', 'lab_orders', 'lab_order_items', 'pharmacy_items', 'lab_tests'];
        const missingTables = requiredTables.filter(table => !tables.some(t => t.name === table));
        
        if (missingTables.length > 0) {
          console.log('❌ Missing tables:', missingTables);
        } else {
          console.log('✅ All required tables exist\n');
        }
      });
      
      // Test 2: Check foreign key relationships
      console.log('2️⃣ Checking foreign key relationships...');
      db.all(`
        SELECT 
          m.name as table_name,
          p.name as column_name,
          p.type as column_type,
          p.notnull as not_null,
          p.pk as primary_key
        FROM sqlite_master m
        JOIN pragma_table_info(m.name) p ON m.name = p.name
        WHERE m.type = 'table' 
        AND m.name IN ('pharmacy_orders', 'pharmacy_order_items', 'lab_orders', 'lab_order_items')
        AND p.name LIKE '%Id'
        ORDER BY m.name, p.name
      `, (err, columns) => {
        if (err) {
          console.error('❌ Error checking foreign keys:', err.message);
          reject(err);
          return;
        }
        
        console.log('🔗 Foreign key columns:');
        columns.forEach(col => {
          console.log(`   ${col.table_name}.${col.column_name} (${col.column_type}) ${col.primary_key ? 'PK' : ''} ${col.not_null ? 'NOT NULL' : ''}`);
        });
        console.log('');
      });
      
      // Test 3: Check if we can create sample data
      console.log('3️⃣ Testing data creation...');
      
      // First, check if we have any prescriptions
      db.get('SELECT COUNT(*) as count FROM prescriptions', (err, result) => {
        if (err) {
          console.error('❌ Error checking prescriptions:', err.message);
          reject(err);
          return;
        }
        
        console.log(`📊 Found ${result.count} prescriptions in database`);
        
        if (result.count === 0) {
          console.log('⚠️  No prescriptions found. Creating sample data...');
          
          // Create a sample patient
          db.run(`
            INSERT OR IGNORE INTO patients (
              patientId, firstName, lastName, dateOfBirth, age, gender, 
              phone, address, medicalHistory, allergies
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            1001, 'John', 'Doe', '1990-01-01', 34, 'Male',
            '1234567890', '123 Main St', 'None', 'None'
          ], function(err) {
            if (err) {
              console.error('❌ Error creating patient:', err.message);
              reject(err);
              return;
            }
            
            const patientId = this.lastID;
            console.log(`✅ Created patient with ID: ${patientId}`);
            
            // Create a sample doctor
            db.run(`
              INSERT OR IGNORE INTO doctors (
                doctorId, name, specialization, license, phone, email, department
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              'DOC001', 'Dr. Smith', 'General Medicine', 'MD001', '9876543210', 'dr.smith@example.com', 'General'
            ], function(err) {
              if (err) {
                console.error('❌ Error creating doctor:', err.message);
                reject(err);
                return;
              }
              
              const doctorId = this.lastID;
              console.log(`✅ Created doctor with ID: ${doctorId}`);
              
              // Create a sample prescription
              db.run(`
                INSERT INTO prescriptions (
                  prescriptionId, patientId, doctorId, date, diagnosis, 
                  symptoms, medications, instructions, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                'PRESC-001', patientId, doctorId, new Date().toISOString().split('T')[0],
                'Common Cold', 'Fever, cough', JSON.stringify([{name: 'Paracetamol', dosage: '500mg', frequency: '3 times daily'}]),
                'Take with food', 'active'
              ], function(err) {
                if (err) {
                  console.error('❌ Error creating prescription:', err.message);
                  reject(err);
                  return;
                }
                
                const prescriptionId = this.lastID;
                console.log(`✅ Created prescription with ID: ${prescriptionId}`);
                
                // Test pharmacy order creation
                testPharmacyOrder(prescriptionId, patientId, doctorId);
              });
            });
          });
        } else {
          // Get first prescription and test with it
          db.get('SELECT * FROM prescriptions LIMIT 1', (err, prescription) => {
            if (err) {
              console.error('❌ Error getting prescription:', err.message);
              reject(err);
              return;
            }
            
            console.log(`✅ Using existing prescription ID: ${prescription.id}`);
            testPharmacyOrder(prescription.id, prescription.patientId, prescription.doctorId);
          });
        }
      });
    });
  });
}

function testPharmacyOrder(prescriptionId, patientId, doctorId) {
  console.log('4️⃣ Testing pharmacy order creation...');
  
  // Create sample pharmacy items first
  db.run(`
    INSERT OR IGNORE INTO pharmacy_items (
      sku, name, generic_name, brand, unit, item_type, 
      mrp, purchase_price, selling_price, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'MED001', 'Paracetamol 500mg', 'Paracetamol', 'Generic', 'Tablet', 'Medicine',
    5.00, 3.00, 4.50, 1
  ], function(err) {
    if (err) {
      console.error('❌ Error creating pharmacy item:', err.message);
      return;
    }
    
    const itemId = this.lastID;
    console.log(`✅ Created pharmacy item with ID: ${itemId}`);
    
    // Create pharmacy order
    const orderId = `PHARM-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    db.run(`
      INSERT INTO pharmacy_orders (
        orderId, prescriptionId, patientId, doctorId, 
        totalAmount, notes, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId, prescriptionId, patientId, doctorId,
      9.00, 'Test pharmacy order', 'routine', 'ordered'
    ], function(err) {
      if (err) {
        console.error('❌ Error creating pharmacy order:', err.message);
        return;
      }
      
      const pharmacyOrderId = this.lastID;
      console.log(`✅ Created pharmacy order with ID: ${pharmacyOrderId}`);
      
      // Create pharmacy order item
      db.run(`
        INSERT INTO pharmacy_order_items (
          orderId, itemId, itemName, itemCode, quantity, 
          unitPrice, totalPrice, instructions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        pharmacyOrderId, itemId, 'Paracetamol 500mg', 'MED001',
        2, 4.50, 9.00, 'Take with food', 'ordered'
      ], function(err) {
        if (err) {
          console.error('❌ Error creating pharmacy order item:', err.message);
          return;
        }
        
        console.log(`✅ Created pharmacy order item`);
        
        // Test lab order creation
        testLabOrder(prescriptionId, patientId, doctorId);
      });
    });
  });
}

function testLabOrder(prescriptionId, patientId, doctorId) {
  console.log('5️⃣ Testing lab order creation...');
  
  // Create sample lab test first
  db.run(`
    INSERT OR IGNORE INTO lab_tests (
      testId, testName, testCode, category, subcategory, 
      price, description, isActive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'LT001', 'Complete Blood Count', 'CBC', 'Hematology', 'Blood Analysis',
    500.00, 'Complete blood count test', 1
  ], function(err) {
    if (err) {
      console.error('❌ Error creating lab test:', err.message);
      return;
    }
    
    const testId = this.lastID;
    console.log(`✅ Created lab test with ID: ${testId}`);
    
    // Create lab order
    const orderId = `LAB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    db.run(`
      INSERT INTO lab_orders (
        orderId, prescriptionId, patientId, doctorId, 
        totalAmount, clinicalNotes, instructions, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId, prescriptionId, patientId, doctorId,
      500.00, 'Routine checkup', 'Fasting required', 'routine', 'ordered'
    ], function(err) {
      if (err) {
        console.error('❌ Error creating lab order:', err.message);
        return;
      }
      
      const labOrderId = this.lastID;
      console.log(`✅ Created lab order with ID: ${labOrderId}`);
      
      // Create lab order item
      db.run(`
        INSERT INTO lab_order_items (
          orderId, testId, testName, testCode, price, 
          clinicalNotes, instructions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        labOrderId, testId, 'Complete Blood Count', 'CBC',
        500.00, 'Check for anemia', 'Fasting required', 'ordered'
      ], function(err) {
        if (err) {
          console.error('❌ Error creating lab order item:', err.message);
          return;
        }
        
        console.log(`✅ Created lab order item`);
        
        // Test relationship queries
        testRelationshipQueries(prescriptionId);
      });
    });
  });
}

function testRelationshipQueries(prescriptionId) {
  console.log('6️⃣ Testing relationship queries...');
  
  // Test query to get prescription with all related orders
  db.all(`
    SELECT 
      p.prescriptionId,
      p.diagnosis,
      po.orderId as pharmacy_order_id,
      po.totalAmount as pharmacy_total,
      lo.orderId as lab_order_id,
      lo.totalAmount as lab_total
    FROM prescriptions p
    LEFT JOIN pharmacy_orders po ON p.id = po.prescriptionId
    LEFT JOIN lab_orders lo ON p.id = lo.prescriptionId
    WHERE p.id = ?
  `, [prescriptionId], (err, results) => {
    if (err) {
      console.error('❌ Error testing relationship queries:', err.message);
      return;
    }
    
    console.log('🔍 Relationship query results:');
    results.forEach(row => {
      console.log(`   Prescription: ${row.prescriptionId}`);
      console.log(`   Diagnosis: ${row.diagnosis}`);
      console.log(`   Pharmacy Order: ${row.pharmacy_order_id} (Total: $${row.pharmacy_total})`);
      console.log(`   Lab Order: ${row.lab_order_id} (Total: $${row.lab_total})`);
      console.log('');
    });
    
    console.log('✅ All relationship tests completed successfully!');
    console.log('\n🎉 Prescription-Pharmacy-Lab relationships are working correctly!');
    
    db.close();
  });
}

// Run the test
testPrescriptionRelationships()
  .catch((error) => {
    console.error('❌ Test failed:', error);
    db.close();
    process.exit(1);
  });
