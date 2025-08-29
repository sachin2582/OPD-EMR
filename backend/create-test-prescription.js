const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'database', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('Creating test prescription with lab tests...');

db.serialize(() => {
  // First, check if we have patients and doctors
  db.get("SELECT id FROM patients LIMIT 1", (err, patient) => {
    if (err || !patient) {
      console.error('No patients found. Please create a patient first.');
      db.close();
      return;
    }
    
    db.get("SELECT id FROM doctors LIMIT 1", (err, doctor) => {
      if (err || !doctor) {
        console.error('No doctors found. Please create a doctor first.');
        db.close();
        return;
      }
      
      // Create a test prescription with lab tests
      const prescriptionData = {
        prescriptionId: 'TEST-PRESC-' + Date.now(),
        patientId: patient.id,
        doctorId: doctor.id,
        date: new Date().toISOString().split('T')[0],
        diagnosis: 'Test diagnosis for lab billing',
        symptoms: 'Test symptoms',
        examination: 'Test examination',
        medications: JSON.stringify([{ name: 'Test Medicine', dosage: '1 tablet', frequency: 'twice daily' }]),
        instructions: 'Test instructions',
        followUp: '1 week',
        notes: 'Test prescription for lab billing system',
        labTestRecommendations: JSON.stringify(['BGA001', 'CBC001']), // Sample lab test codes
        status: 'active'
      };
      
      const sql = `
        INSERT INTO prescriptions (
          prescriptionId, patientId, doctorId, date, diagnosis, symptoms,
          examination, medications, instructions, followUp, notes, labTestRecommendations, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
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
      
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Error creating prescription:', err);
        } else {
          console.log('Successfully created test prescription with ID:', this.lastID);
          console.log('Prescription ID:', prescriptionData.prescriptionId);
          console.log('Lab Tests:', prescriptionData.labTestRecommendations);
        }
        
        db.close();
      });
    });
  });
});
