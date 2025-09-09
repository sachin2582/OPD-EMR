const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'opd-emr.db');

console.log('🔧 Adding general services to lab_tests table...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// General services to add (excluding Consultation services as they should remain separate)
const generalServices = [
  { 
    testName: 'X-Ray', 
    category: 'Radiology', 
    price: 1200, 
    description: 'Chest X-Ray examination',
    testCode: 'XRAY-001',
    subcategory: 'Imaging',
    preparation: 'No special preparation required',
    turnaroundTime: '30 minutes'
  },
  { 
    testName: 'ECG', 
    category: 'Cardiology', 
    price: 600, 
    description: 'Electrocardiogram test',
    testCode: 'ECG-001',
    subcategory: 'Diagnostic',
    preparation: 'No special preparation required',
    turnaroundTime: '15 minutes'
  },
  { 
    testName: 'Ultrasound', 
    category: 'Radiology', 
    price: 1500, 
    description: 'Abdominal ultrasound',
    testCode: 'USG-001',
    subcategory: 'Imaging',
    preparation: 'Fasting for 6-8 hours for abdominal ultrasound',
    turnaroundTime: '45 minutes'
  },
  { 
    testName: 'Dressing', 
    category: 'Treatment', 
    price: 200, 
    description: 'Wound dressing and care',
    testCode: 'DRS-001',
    subcategory: 'Wound Care',
    preparation: 'No special preparation required',
    turnaroundTime: '15 minutes'
  },
  { 
    testName: 'Injection', 
    category: 'Treatment', 
    price: 150, 
    description: 'Intramuscular injection',
    testCode: 'INJ-001',
    subcategory: 'Medication',
    preparation: 'No special preparation required',
    turnaroundTime: '5 minutes'
  },
  { 
    testName: 'Medicine Supply', 
    category: 'Pharmacy', 
    price: 400, 
    description: 'Prescribed medicines',
    testCode: 'MED-001',
    subcategory: 'Pharmacy',
    preparation: 'Prescription required',
    turnaroundTime: '10 minutes'
  }
];

// Function to check if service already exists
const checkExistingService = (testName) => {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT id FROM lab_tests 
      WHERE testName = ? OR testCode = ?
    `, [testName, testName], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? true : false);
      }
    });
  });
};

// Function to add service
const addService = (service) => {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO lab_tests (
        testId, testName, testCode, category, subcategory, 
        price, description, preparation, turnaroundTime, 
        isActive, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      service.testCode,
      service.testName,
      service.testCode,
      service.category,
      service.subcategory,
      service.price,
      service.description,
      service.preparation,
      service.turnaroundTime,
      1 // isActive
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

// Main execution
async function addGeneralServices() {
  console.log('\n🔄 Adding general services to lab_tests table...');
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const service of generalServices) {
    try {
      // Check if service already exists
      const exists = await checkExistingService(service.testName);
      
      if (exists) {
        console.log(`⏭️  Skipping ${service.testName} - already exists`);
        skippedCount++;
      } else {
        // Add the service
        const newId = await addService(service);
        console.log(`✅ Added ${service.testName} (${service.category}) - ₹${service.price} [ID: ${newId}]`);
        addedCount++;
      }
    } catch (error) {
      console.error(`❌ Error adding ${service.testName}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  - Added: ${addedCount} services`);
  console.log(`  - Skipped: ${skippedCount} services`);
  
  // Show updated categories
  console.log('\n📂 Updated categories in lab_tests:');
  db.all(`
    SELECT 
      category,
      COUNT(*) as count
    FROM lab_tests 
    GROUP BY category
    ORDER BY category
  `, [], (err, categories) => {
    if (err) {
      console.error('❌ Error getting categories:', err.message);
      return;
    }
    
    categories.forEach(cat => {
      console.log(`  - ${cat.category}: ${cat.count} tests`);
    });
    
    // Show the newly added services
    console.log('\n🆕 Newly added general services:');
    db.all(`
      SELECT 
        testName,
        category,
        price,
        description
      FROM lab_tests 
      WHERE category IN ('Radiology', 'Treatment', 'Pharmacy')
      ORDER BY category, testName
    `, [], (err, newServices) => {
      if (err) {
        console.error('❌ Error getting new services:', err.message);
        return;
      }
      
      newServices.forEach(service => {
        console.log(`  - ${service.testName} (${service.category}) - ₹${service.price}`);
      });
      
      console.log('\n✅ General services added successfully!');
      console.log('🎯 These services will now appear in the billing screen under their respective categories.');
      
      db.close();
    });
  });
}

// Execute the function
addGeneralServices().catch(error => {
  console.error('❌ Error in main execution:', error);
  db.close();
});
