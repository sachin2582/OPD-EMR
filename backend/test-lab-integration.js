const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🧪 Testing Lab Test Integration...\n');

const dbPath = path.join(__dirname, 'database', 'opd-emr.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  
  console.log('✅ Connected to database');
  
  // Check if lab_orders table exists and has data
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='lab_orders'", (err, row) => {
    if (err) {
      console.error('❌ Error checking lab_orders table:', err.message);
      db.close();
      return;
    }
    
    if (!row) {
      console.error('❌ lab_orders table does not exist!');
      db.close();
      return;
    }
    
    console.log('✅ lab_orders table exists');
    
    // Check if lab_order_items table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='lab_order_items'", (err, row2) => {
      if (err) {
        console.error('❌ Error checking lab_order_items table:', err.message);
        db.close();
        return;
      }
      
      if (!row2) {
        console.error('❌ lab_order_items table does not exist!');
        db.close();
        return;
      }
      
      console.log('✅ lab_order_items table exists');
      
      // Check if sample_collection table exists
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='sample_collection'", (err, row3) => {
        if (err) {
          console.error('❌ Error checking sample_collection table:', err.message);
          db.close();
          return;
        }
        
        if (!row3) {
          console.error('❌ sample_collection table does not exist!');
          db.close();
          return;
        }
        
        console.log('✅ sample_collection table exists');
        
        // Check for existing lab orders
        db.get('SELECT COUNT(*) as count FROM lab_orders', (err, result) => {
          if (err) {
            console.error('❌ Error counting lab orders:', err.message);
            db.close();
            return;
          }
          
          console.log(`📊 Total lab orders: ${result.count}`);
          
          if (result.count > 0) {
            // Show some sample orders
            db.all('SELECT * FROM lab_orders LIMIT 3', (err, orders) => {
              if (err) {
                console.error('❌ Error getting sample orders:', err.message);
              } else {
                console.log('\n📋 Sample lab orders:');
                orders.forEach((order, index) => {
                  console.log(`  ${index + 1}. Order ID: ${order.orderId}, Patient ID: ${order.patientId}, Amount: ₹${order.totalAmount}`);
                });
              }
              
              // Check for order items
              db.get('SELECT COUNT(*) as count FROM lab_order_items', (err, result2) => {
                if (err) {
                  console.error('❌ Error counting order items:', err.message);
                } else {
                  console.log(`📊 Total order items: ${result2.count}`);
                }
                
                // Check for sample collections
                db.get('SELECT COUNT(*) as count FROM sample_collection', (err, result3) => {
                  if (err) {
                    console.error('❌ Error counting sample collections:', err.message);
                  } else {
                    console.log(`📊 Total sample collections: ${result3.count}`);
                  }
                  
                  db.close();
                });
              });
            });
          } else {
            console.log('📋 No lab orders found yet');
            db.close();
          }
        });
      });
    });
  });
});
