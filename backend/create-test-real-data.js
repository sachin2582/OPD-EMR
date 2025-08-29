const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('Creating real patient and prescription for lab billing system...');

db.serialize(() => {
  // Create a real patient
  const patientData = {
    patientId: 'PAT-2024-001',
    firstName: 'Priya',
    lastName: 'Verma',
    age: 28,
    gender: 'Female',
    phone: '9876543210',
    email: 'priya.verma@email.com',
    address: '456 Park Avenue, Sector 22, Chandigarh',
    city: 'Chandigarh',
    area: 'Sector 22',
    pinCode: '160022',
    dateOfBirth: '1996-03-15'
  };
  
  const patientSql = `
    INSERT INTO patients (
      patientId, firstName, lastName, age, gender, phone, email, address, 
      city, area, pinCode, dateOfBirth
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const patientParams = [
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
  
  db.run(patientSql, patientParams, function(err) {
    if (err) {
      console.error('Error creating patient:', err);
      db.close();
      return;
    }
    
    console.log('✅ Created real patient:', patientData.firstName, patientData.lastName);
    console.log('Patient ID:', this.lastID);
    
    // Now create a prescription with lab tests
    createPrescription(this.lastID);
  });
  
  function createPrescription(patientDbId) {
    // Get first doctor
    db.get("SELECT id FROM doctors LIMIT 1", (err, doctor) => {
      if (err || !doctor) {
        console.error('No doctors found. Please create a doctor first.');
        db.close();
        return;
      }
      
      // Create a prescription with lab tests
      const prescriptionData = {
        prescriptionId: 'PRESC-2024-001',
        patientId: patientDbId,
        doctorId: doctor.id,
        date: new Date().toISOString().split('T')[0],
        diagnosis: 'Annual Health Checkup',
        symptoms: 'No specific symptoms, routine checkup',
        examination: 'General physical examination',
        medications: JSON.stringify([]),
        instructions: 'Complete blood work and basic health screening',
        followUp: '2 weeks',
        notes: 'Patient requested comprehensive health screening',
        labTestRecommendations: JSON.stringify(['CBC001', 'BGA001', 'LFT001']), // Lab test codes
        status: 'active'
      };
      
      const prescriptionSql = `
        INSERT INTO prescriptions (
          prescriptionId, patientId, doctorId, date, diagnosis, symptoms,
          examination, medications, instructions, followUp, notes, labTestRecommendations, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const prescriptionParams = [
        prescriptionData.prescriptionId,
        prescriptionData.patientId,
        prescriptionData.doctorId,
        prescriptionData.date,
        prescriptionData.diagnosis,
        prescriptionData.symptoms,
        prescriptionData.examination,
        prescriptionData.medications,
        prescriptionData.instructions,
        prescriptionData.followUp,
        prescriptionData.notes,
        prescriptionData.labTestRecommendations,
        prescriptionData.status
      ];
      
      db.run(prescriptionSql, prescriptionParams, function(err) {
        if (err) {
          console.error('Error creating prescription:', err);
          db.close();
          return;
        }
        
        console.log('✅ Created prescription with lab tests');
        console.log('Prescription ID:', this.lastID);
        console.log('Lab Tests:', prescriptionData.labTestRecommendations);
        
        console.log('\n🎯 Lab Billing System Ready!');
        console.log('Now check Lab Billing to see real patient data and lab tests.');
        db.close();
      });
    });
  }
});
