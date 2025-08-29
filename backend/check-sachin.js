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
  
  // Check if Sachin Gupta exists
  console.log('\n=== Checking for Sachin Gupta ===');
  db.all("SELECT * FROM patients WHERE firstName LIKE '%sachin%' OR lastName LIKE '%gupta%' OR firstName LIKE '%Sachin%' OR lastName LIKE '%Gupta%'", (err, patients) => {
    if (err) {
      console.error('Error searching patients:', err);
    } else {
      console.log('Patients found:', patients.length);
      patients.forEach(patient => {
        console.log('Patient:', patient);
        
        // Check prescriptions for this patient
        db.all("SELECT * FROM prescriptions WHERE patientId = ?", [patient.id], (err, prescriptions) => {
          if (err) {
            console.error('Error getting prescriptions:', err);
          } else {
            console.log(`\nPrescriptions for patient ${patient.id}:`, prescriptions.length);
            prescriptions.forEach(prescription => {
              console.log('Prescription:', prescription);
              
              // Check if prescription has lab test recommendations
              if (prescription.labTestRecommendations) {
                console.log('Lab Test Recommendations:', prescription.labTestRecommendations);
                try {
                  const labTests = JSON.parse(prescription.labTestRecommendations);
                  console.log('Parsed lab tests:', labTests);
                  
                  // Check if these lab tests exist in lab_tests table
                  if (labTests.length > 0) {
                    const placeholders = labTests.map(() => '?').join(',');
                    db.all(`SELECT * FROM lab_tests WHERE testCode IN (${placeholders})`, labTests, (err, labTestData) => {
                      if (err) {
                        console.error('Error getting lab test data:', err);
                      } else {
                        console.log('Lab test data found:', labTestData.length);
                        labTestData.forEach(test => {
                          console.log('Lab test:', test);
                        });
                      }
                    });
                  }
                } catch (parseError) {
                  console.error('Error parsing lab test recommendations:', parseError);
                }
              } else {
                console.log('No lab test recommendations found');
              }
            });
          }
        });
      });
    }
  });
  
  // Check all prescriptions with lab test recommendations
  console.log('\n=== All Prescriptions with Lab Tests ===');
  db.all("SELECT p.*, pat.firstName, pat.lastName FROM prescriptions p JOIN patients pat ON p.patientId = pat.id WHERE p.labTestRecommendations IS NOT NULL AND p.labTestRecommendations != '[]' AND p.labTestRecommendations != 'null'", (err, prescriptions) => {
    if (err) {
      console.error('Error getting prescriptions with lab tests:', err);
    } else {
      console.log('Total prescriptions with lab tests:', prescriptions.length);
      prescriptions.forEach(prescription => {
        console.log(`\nPatient: ${prescription.firstName} ${prescription.lastName}`);
        console.log('Prescription ID:', prescription.prescriptionId);
        console.log('Lab Test Recommendations:', prescription.labTestRecommendations);
        console.log('Diagnosis:', prescription.diagnosis);
        console.log('Symptoms:', prescription.symptoms);
      });
    }
    
    // Close database after all queries
    setTimeout(() => {
      db.close();
      console.log('\nDatabase connection closed');
    }, 1000);
  });
});
