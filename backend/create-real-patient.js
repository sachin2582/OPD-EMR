const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('Creating real patient with proper details...');

db.serialize(() => {
  // Create a real patient with only existing columns
  const patientData = {
    patientId: 'PAT-001',
    firstName: 'Rahul',
    lastName: 'Sharma',
    age: 35,
    gender: 'Male',
    phone: '9876543210',
    email: 'rahul.sharma@email.com',
    address: '123 Main Street, Sector 15, Chandigarh',
    city: 'Chandigarh',
    area: 'Sector 15',
    pinCode: '160015',
    dateOfBirth: '1988-05-15'
  };
  
  const sql = `
    INSERT INTO patients (
      patientId, firstName, lastName, age, gender, phone, email, address, 
      city, area, pinCode, dateOfBirth
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    patientData.patientId,
    patientData.firstName,
    patientData.lastName,
    patientData.age,
    patientData.gender,
    patientData.phone,
    patientData.email,
    patientData.address,
    patientData.city,
    patientData.area,
    patientData.pinCode,
    patientData.dateOfBirth
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error creating patient:', err);
      db.close();
      return;
    }
    
    console.log('Successfully created real patient with ID:', this.lastID);
    console.log('Patient Details:', patientData);
    
    // Now create a real lab prescription for this patient
    createRealPrescription(this.lastID);
  });
  
  function createRealPrescription(patientDbId) {
    // Get first doctor
    db.get("SELECT id FROM doctors LIMIT 1", (err, doctor) => {
      if (err || !doctor) {
        console.error('No doctors found. Please create a doctor first.');
        db.close();
        return;
      }
      
      // Create a real lab prescription
      const prescriptionData = {
        prescriptionId: 'LAB-PRESC-REAL-' + Date.now(),
        patientId: patientDbId,
        doctorId: doctor.id,
        prescriptionDate: new Date().toISOString().split('T')[0],
        diagnosis: 'Diabetes Type 2 - Routine Checkup',
        symptoms: 'Increased thirst, frequent urination, fatigue',
        notes: 'Patient needs regular monitoring of blood sugar levels',
        priority: 'routine',
        status: 'pending'
      };
      
      const prescriptionSql = `
        INSERT INTO lab_prescriptions (
          prescriptionId, patientId, doctorId, prescriptionDate, diagnosis, 
          symptoms, notes, priority, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const prescriptionParams = [
        prescriptionData.prescriptionId,
        prescriptionData.patientId,
        prescriptionData.doctorId,
        prescriptionData.prescriptionDate,
        prescriptionData.diagnosis,
        prescriptionData.symptoms,
        prescriptionData.notes,
        prescriptionData.priority,
        prescriptionData.status
      ];
      
      db.run(prescriptionSql, prescriptionParams, function(err) {
        if (err) {
          console.error('Error creating prescription:', err);
          db.close();
          return;
        }
        
        console.log('Successfully created real prescription with ID:', this.lastID);
        console.log('Prescription Details:', prescriptionData);
        
        // Add lab test items to the prescription
        addLabTestItems(this.lastID);
      });
    });
  }
  
  function addLabTestItems(prescriptionDbId) {
    // Get some real lab tests
    db.all("SELECT id, testName, testCode, category, price FROM lab_tests LIMIT 3", (err, tests) => {
      if (err || tests.length === 0) {
        console.error('No lab tests found');
        db.close();
        return;
      }
      
      console.log(`Adding ${tests.length} lab tests to prescription...`);
      
      let completed = 0;
      tests.forEach(test => {
        // Use only the columns that exist in the table
        const itemSql = `
          INSERT INTO lab_prescription_items (
            prescriptionId, testId
          ) VALUES (?, ?)
        `;
        
        db.run(itemSql, [prescriptionDbId, test.id], function(err) {
          if (err) {
            console.error('Error adding lab test item:', err);
          } else {
            console.log(`Added lab test: ${test.testName} (${test.testCode})`);
          }
          
          completed++;
          if (completed === tests.length) {
            console.log('\n✅ Real patient and prescription created successfully!');
            console.log('Now check Lab Billing to see real data instead of "Test" values.');
            db.close();
          }
        });
      });
    });
  }
});
