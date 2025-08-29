const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Create Sachin Gupta patient
  console.log('\n=== Creating Sachin Gupta Patient ===');
  db.run(`
    INSERT INTO patients (
      patientId, firstName, lastName, dateOfBirth, age, gender, 
      phone, email, address, city, area, pinCode
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'PAT-2024-002', 'Sachin', 'Gupta', '1990-05-15', 34, 'Male',
    '9876543211', 'sachin.gupta@email.com', '123 Main Street, Sector 15', 'Chandigarh', 'Sector 15', '160015'
  ], function(err) {
    if (err) {
      console.error('Error creating patient:', err);
      return;
    }
    
    const patientId = this.lastID;
    console.log('✅ Patient created with ID:', patientId);
    
    // Get a doctor ID (use the first available doctor)
    db.get('SELECT id FROM doctors LIMIT 1', (err, doctor) => {
      if (err || !doctor) {
        console.error('Error getting doctor:', err);
        return;
      }
      
      const doctorId = doctor.id;
      console.log('✅ Using doctor ID:', doctorId);
      
      // Create prescription with CRP lab test
      console.log('\n=== Creating Prescription with CRP Lab Test ===');
      db.run(`
        INSERT INTO prescriptions (
          prescriptionId, patientId, doctorId, date, diagnosis, symptoms,
          examination, medications, instructions, followUp, notes,
          labTestRecommendations, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'PRESC-2024-002', patientId, doctorId, new Date().toISOString().split('T')[0],
        'Fever and Fatigue', 'High fever, body aches, fatigue, loss of appetite',
        'Patient presents with fever of 102°F, appears fatigued, no other significant findings',
        JSON.stringify([]), // No medications
        'Rest, plenty of fluids, monitor temperature',
        '3 days', 'Patient needs CRP test to rule out bacterial infection',
        JSON.stringify(['CRP001']), // CRP lab test code
        'active'
      ], function(err) {
        if (err) {
          console.error('Error creating prescription:', err);
          return;
        }
        
        const prescriptionId = this.lastID;
        console.log('✅ Prescription created with ID:', prescriptionId);
        
        // Check if CRP test exists in lab_tests
        db.get('SELECT * FROM lab_tests WHERE testCode = ?', ['CRP001'], (err, crpTest) => {
          if (err) {
            console.error('Error checking CRP test:', err);
          } else if (!crpTest) {
            console.log('⚠️ CRP test not found, creating it...');
            
            // Create CRP test if it doesn't exist
            db.run(`
              INSERT INTO lab_tests (testId, testName, testCode, category, subcategory, price, description)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              'LT011', 'C-Reactive Protein (CRP)', 'CRP001', 'Biochemistry', 'Inflammation', 400.00,
              'C-Reactive Protein test to measure inflammation levels in the body'
            ], function(err) {
              if (err) {
                console.error('Error creating CRP test:', err);
              } else {
                console.log('✅ CRP test created with ID:', this.lastID);
              }
            });
          } else {
            console.log('✅ CRP test found:', crpTest);
          }
        });
        
        // Verify the data was created
        setTimeout(() => {
          console.log('\n=== Verifying Created Data ===');
          
          // Check patient
          db.get('SELECT * FROM patients WHERE id = ?', [patientId], (err, patient) => {
            if (err) {
              console.error('Error getting patient:', err);
            } else {
              console.log('✅ Patient verified:', patient);
            }
          });
          
          // Check prescription
          db.get('SELECT * FROM prescriptions WHERE id = ?', [prescriptionId], (err, prescription) => {
            if (err) {
              console.error('Error getting prescription:', err);
            } else {
              console.log('✅ Prescription verified:', prescription);
              console.log('Lab Test Recommendations:', prescription.labTestRecommendations);
            }
          });
          
          // Check total prescriptions with lab tests
          db.get('SELECT COUNT(*) as count FROM prescriptions WHERE labTestRecommendations IS NOT NULL AND labTestRecommendations != "[]" AND labTestRecommendations != "null"', (err, result) => {
            if (err) {
              console.error('Error counting prescriptions:', err);
            } else {
              console.log('✅ Total prescriptions with lab tests:', result.count);
            }
            
            // Close database
            db.close();
            console.log('\nDatabase connection closed');
          });
        }, 1000);
      });
    });
  });
});
