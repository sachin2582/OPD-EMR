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
  
  console.log('\n=== Creating Complete LIMS Database Schema ===');
  
  // Create sample collection table
  db.run(`
    CREATE TABLE IF NOT EXISTS sample_collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sampleId TEXT UNIQUE NOT NULL,
      prescriptionId INTEGER,
      patientId INTEGER,
      collectionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      collectionTime TEXT,
      collectorName TEXT,
      collectorId TEXT,
      sampleType TEXT,
      containerType TEXT,
      volume TEXT,
      specialInstructions TEXT,
      fastingStatus TEXT,
      collectionSite TEXT,
      status TEXT DEFAULT 'collected',
      priority TEXT DEFAULT 'routine',
      expectedDeliveryTime DATETIME,
      actualDeliveryTime DATETIME,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prescriptionId) REFERENCES prescriptions (id),
      FOREIGN KEY (patientId) REFERENCES patients (id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating sample_collections table:', err.message);
    } else {
      console.log('✅ sample_collections table created');
    }
    
    // Create sample processing table
    db.run(`
      CREATE TABLE IF NOT EXISTS sample_processing (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sampleId TEXT UNIQUE NOT NULL,
        receivedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        receivedTime TEXT,
        processorName TEXT,
        processorId TEXT,
        processingStatus TEXT DEFAULT 'received',
        centrifugationRequired BOOLEAN DEFAULT 0,
        centrifugationTime TEXT,
        centrifugationSpeed TEXT,
        aliquotingRequired BOOLEAN DEFAULT 0,
        aliquotsCreated INTEGER DEFAULT 0,
        storageLocation TEXT,
        storageTemperature TEXT,
        processingNotes TEXT,
        qualityCheckStatus TEXT DEFAULT 'pending',
        qualityCheckBy TEXT,
        qualityCheckDate DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sampleId) REFERENCES sample_collections (sampleId)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating sample_processing table:', err.message);
      } else {
        console.log('✅ sample_processing table created');
      }
      
      // Create test orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS test_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId TEXT UNIQUE NOT NULL,
          sampleId TEXT,
          prescriptionId INTEGER,
          testId INTEGER,
          testName TEXT,
          testCode TEXT,
          priority TEXT DEFAULT 'routine',
          status TEXT DEFAULT 'ordered',
          orderedBy TEXT,
          orderedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          expectedCompletionTime DATETIME,
          actualCompletionTime DATETIME,
          assignedTo TEXT,
          assignedDate DATETIME,
          startedDate DATETIME,
          completedDate DATETIME,
          verifiedBy TEXT,
          verifiedDate DATETIME,
          approvedBy TEXT,
          approvedDate DATETIME,
          resultValue TEXT,
          resultUnit TEXT,
          referenceRange TEXT,
          resultStatus TEXT DEFAULT 'pending',
          criticalValue BOOLEAN DEFAULT 0,
          comments TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sampleId) REFERENCES sample_collections (sampleId),
          FOREIGN KEY (prescriptionId) REFERENCES prescriptions (id),
          FOREIGN KEY (testId) REFERENCES lab_tests (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating test_orders table:', err.message);
        } else {
          console.log('✅ test_orders table created');
        }
        
        // Create test results table
        db.run(`
          CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resultId TEXT UNIQUE NOT NULL,
            testOrderId INTEGER,
            sampleId TEXT,
            testId INTEGER,
            resultValue TEXT,
            resultUnit TEXT,
            referenceRange TEXT,
            referenceRangeMin REAL,
            referenceRangeMax REAL,
            resultStatus TEXT DEFAULT 'pending',
            resultType TEXT,
            resultDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            enteredBy TEXT,
            enteredDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            verifiedBy TEXT,
            verifiedDate DATETIME,
            approvedBy TEXT,
            approvedDate DATETIME,
            resultComments TEXT,
            criticalValue BOOLEAN DEFAULT 0,
            criticalValueReported BOOLEAN DEFAULT 0,
            qualityControlStatus TEXT DEFAULT 'pending',
            instrumentUsed TEXT,
            methodUsed TEXT,
            calibrationDate DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (testOrderId) REFERENCES test_orders (id),
            FOREIGN KEY (sampleId) REFERENCES sample_collections (sampleId),
            FOREIGN KEY (testId) REFERENCES lab_tests (id)
          )
        `, (err) => {
          if (err) {
            console.error('Error creating test_results table:', err.message);
          } else {
            console.log('✅ test_results table created');
          }
          
          // Create quality control table
          db.run(`
            CREATE TABLE IF NOT EXISTS quality_control (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              qcId TEXT UNIQUE NOT NULL,
              testId INTEGER,
              controlType TEXT,
              controlLevel TEXT,
              controlValue REAL,
              expectedValue REAL,
              acceptableRangeMin REAL,
              acceptableRangeMax REAL,
              runDate DATETIME DEFAULT CURRENT_TIMESTAMP,
              runBy TEXT,
              status TEXT DEFAULT 'pending',
              comments TEXT,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (testId) REFERENCES lab_tests (id)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating quality_control table:', err.message);
            } else {
              console.log('✅ quality_control table created');
            }
            
            // Create report templates table
            db.run(`
              CREATE TABLE IF NOT EXISTS report_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                templateId TEXT UNIQUE NOT NULL,
                templateName TEXT,
                templateType TEXT,
                department TEXT,
                headerTemplate TEXT,
                footerTemplate TEXT,
                bodyTemplate TEXT,
                isActive BOOLEAN DEFAULT 1,
                createdBy TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `, (err) => {
              if (err) {
                console.error('Error creating report_templates table:', err.message);
              } else {
                console.log('✅ report_templates table created');
              }
              
              // Create reports table
              db.run(`
                CREATE TABLE IF NOT EXISTS reports (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  reportId TEXT UNIQUE NOT NULL,
                  prescriptionId INTEGER,
                  patientId INTEGER,
                  reportType TEXT,
                  reportDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                  generatedBy TEXT,
                  generatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                  verifiedBy TEXT,
                  verifiedDate DATETIME,
                  approvedBy TEXT,
                  approvedDate DATETIME,
                  reportStatus TEXT DEFAULT 'generated',
                  reportFormat TEXT DEFAULT 'pdf',
                  reportPath TEXT,
                  reportContent TEXT,
                  clinicalInterpretation TEXT,
                  recommendations TEXT,
                  nextSteps TEXT,
                  followUpRequired BOOLEAN DEFAULT 0,
                  followUpDate DATETIME,
                  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (prescriptionId) REFERENCES prescriptions (id),
                  FOREIGN KEY (patientId) REFERENCES patients (id)
                )
              `, (err) => {
                if (err) {
                  console.error('Error creating reports table:', err.message);
                } else {
                  console.log('✅ reports table created');
                }
                
                // Create workflow status table
                db.run(`
                  CREATE TABLE IF NOT EXISTS workflow_status (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    workflowId TEXT UNIQUE NOT NULL,
                    sampleId TEXT,
                    prescriptionId INTEGER,
                    currentStep TEXT,
                    stepStatus TEXT DEFAULT 'pending',
                    stepStartDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    stepEndDate DATETIME,
                    assignedTo TEXT,
                    stepNotes TEXT,
                    nextStep TEXT,
                    estimatedCompletionTime DATETIME,
                    actualCompletionTime DATETIME,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (sampleId) REFERENCES sample_collections (sampleId),
                    FOREIGN KEY (prescriptionId) REFERENCES prescriptions (id)
                  )
                `, (err) => {
                  if (err) {
                    console.error('Error creating workflow_status table:', err.message);
                  } else {
                    console.log('✅ workflow_status table created');
                  }
                  
                  // Create audit trail table
                  db.run(`
                    CREATE TABLE IF NOT EXISTS audit_trail (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      auditId TEXT UNIQUE NOT NULL,
                      tableName TEXT,
                      recordId TEXT,
                      action TEXT,
                      oldValues TEXT,
                      newValues TEXT,
                      changedBy TEXT,
                      changedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                      ipAddress TEXT,
                      userAgent TEXT,
                      sessionId TEXT
                    )
                  `, (err) => {
                    if (err) {
                      console.error('Error creating audit_trail table:', err.message);
                    } else {
                      console.log('✅ audit_trail table created');
                    }
                    
                    console.log('\n=== All LIMS Tables Created Successfully! ===');
                    
                    // Insert sample data for testing
                    insertSampleData();
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

function insertSampleData() {
  console.log('\n=== Inserting Sample LIMS Data ===');
  
  // Insert sample collection for Sachin Gupta
  db.run(`
    INSERT INTO sample_collections (
      sampleId, prescriptionId, patientId, collectionDate, collectionTime,
      collectorName, collectorId, sampleType, containerType, volume,
      specialInstructions, fastingStatus, collectionSite, status, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'SAMPLE-2024-001', 1, 1, new Date().toISOString(), '09:00',
    'Nurse Sarah', 'NUR001', 'Blood', 'Vacutainer Red', '5ml',
    'Handle with care, avoid hemolysis', '12 hours fasting', 'Antecubital vein',
    'collected', 'routine'
  ], function(err) {
    if (err) {
      console.error('Error inserting sample collection:', err.message);
    } else {
      console.log('✅ Sample collection created with ID:', this.lastID);
      
      // Insert sample processing
      db.run(`
        INSERT INTO sample_processing (
          sampleId, receivedDate, receivedTime, processorName, processorId,
          processingStatus, centrifugationRequired, aliquotingRequired
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'SAMPLE-2024-001', new Date().toISOString(), '09:30',
        'Lab Tech John', 'TECH001', 'processing', 1, 1
      ], function(err) {
        if (err) {
          console.error('Error inserting sample processing:', err.message);
        } else {
          console.log('✅ Sample processing created with ID:', this.lastID);
          
          // Insert test order for CRP
          db.run(`
            INSERT INTO test_orders (
              orderId, sampleId, prescriptionId, testId, testName, testCode,
              priority, status, orderedBy, assignedTo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            'ORDER-2024-001', 'SAMPLE-2024-001', 1, 11, 'C-Reactive Protein (CRP)',
            'CRP001', 'routine', 'assigned', 'Dr. Smith', 'Lab Tech John'
          ], function(err) {
            if (err) {
              console.error('Error inserting test order:', err.message);
            } else {
              console.log('✅ Test order created with ID:', this.lastID);
              
              // Insert workflow status
              db.run(`
                INSERT INTO workflow_status (
                  workflowId, sampleId, prescriptionId, currentStep, stepStatus,
                  assignedTo, nextStep
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
              `, [
                'WORKFLOW-2024-001', 'SAMPLE-2024-001', 1, 'Sample Processing',
                'in_progress', 'Lab Tech John', 'Testing'
              ], function(err) {
                if (err) {
                  console.error('Error inserting workflow status:', err.message);
                } else {
                  console.log('✅ Workflow status created with ID:', this.lastID);
                  
                  console.log('\n=== Sample LIMS Data Inserted Successfully! ===');
                  console.log('✅ Sample Collection: SAMPLE-2024-001');
                  console.log('✅ Sample Processing: In Progress');
                  console.log('✅ Test Order: ORDER-2024-001 (CRP)');
                  console.log('✅ Workflow: Sample Processing → Testing → Results → Approval');
                  
                  // Close database
                  db.close();
                  console.log('\nDatabase connection closed');
                }
              });
            }
          });
        }
      });
    }
  });
}
