const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🧪 Testing Lab Test Order Creation...\n');

const dbPath = path.join(__dirname, 'database', 'opd-emr.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  
  console.log('✅ Connected to database');
  
  // First, let's check if we have a patient and prescription to work with
  db.get('SELECT id, patientId, firstName, lastName FROM patients LIMIT 1', (err, patient) => {
    if (err) {
      console.error('❌ Error getting patient:', err.message);
      db.close();
      return;
    }
    
    if (!patient) {
      console.error('❌ No patients found in database');
      db.close();
      return;
    }
    
    console.log(`👤 Found patient: ${patient.firstName} ${patient.lastName} (ID: ${patient.id})`);
    
    // Check if we have lab tests
    db.get('SELECT COUNT(*) as count FROM lab_tests', (err, result) => {
      if (err) {
        console.error('❌ Error counting lab tests:', err.message);
        db.close();
        return;
      }
      
      console.log(`🧪 Found ${result.count} lab tests in database`);
      
      if (result.count === 0) {
        console.error('❌ No lab tests found');
        db.close();
        return;
      }
      
      // Get a sample lab test
      db.get('SELECT id, testCode, testName, price FROM lab_tests LIMIT 1', (err, test) => {
        if (err) {
          console.error('❌ Error getting lab test:', err.message);
          db.close();
          return;
        }
        
        console.log(`🧪 Sample test: [${test.testCode}] ${test.testName} - ₹${test.price}`);
        
        // Now let's simulate creating a lab test order
        console.log('\n🔧 Simulating lab test order creation...');
        
        // Generate order ID
        const orderId = `LAB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
        const prescriptionId = `PRESC-${Date.now().toString().slice(-6)}`;
        
        console.log(`📋 Generated Order ID: ${orderId}`);
        console.log(`📋 Generated Prescription ID: ${prescriptionId}`);
        
        // Create lab order
        db.run(`
          INSERT INTO lab_orders (orderId, prescriptionId, patientId, doctorId, clinicalNotes, instructions, totalAmount, priority)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [orderId, prescriptionId, patient.id, 1, 'Test diagnosis', 'Test instructions', test.price, 'routine'], function(err) {
          if (err) {
            console.error('❌ Error creating lab order:', err.message);
            db.close();
            return;
          }
          
          console.log(`✅ Lab order created with ID: ${this.lastID}`);
          
          // Create lab order item
          db.run(`
            INSERT INTO lab_order_items (orderId, testId, testName, testCode, price, clinicalNotes, instructions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [this.lastID, test.id, test.testName, test.testCode, test.price, 'Test diagnosis', 'Test instructions'], function(err2) {
            if (err2) {
              console.error('❌ Error creating lab order item:', err2.message);
            } else {
              console.log(`✅ Lab order item created with ID: ${this.lastID}`);
            }
            
            // Create sample collection record
            const collectionId = `SAMP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
            
            db.run(`
              INSERT INTO sample_collection (collectionId, orderId, patientId, status, priority)
              VALUES (?, ?, ?, 'pending', ?)
            `, [collectionId, this.lastID, patient.id, 'routine'], function(err3) {
              if (err3) {
                console.error('❌ Error creating sample collection:', err3.message);
              } else {
                console.log(`✅ Sample collection created with ID: ${this.lastID}`);
              }
              
              // Show final results
              console.log('\n🏁 Final Results:');
              db.get('SELECT COUNT(*) as count FROM lab_orders', (err, result) => {
                if (err) {
                  console.error('❌ Error counting orders:', err.message);
                } else {
                  console.log(`📊 Total lab orders: ${result.count}`);
                }
                
                db.get('SELECT COUNT(*) as count FROM lab_order_items', (err, result2) => {
                  if (err) {
                    console.error('❌ Error counting order items:', err.message);
                  } else {
                    console.log(`📊 Total order items: ${result2.count}`);
                  }
                  
                  db.get('SELECT COUNT(*) as count FROM sample_collection', (err, result3) => {
                    if (err) {
                      console.error('❌ Error counting sample collections:', err.message);
                    } else {
                      console.log(`📊 Total sample collections: ${result3.count}`);
                    }
                    
                    console.log('\n✅ Test completed successfully!');
                    console.log('💡 Now you can check the Lab Test Management screen to see the new order.');
                    db.close();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
