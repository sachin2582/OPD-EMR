const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ [DATABASE] Error opening database:', err.message);
    console.error('❌ [DATABASE] Database path:', dbPath);
    console.error('❌ [DATABASE] Error code:', err.code);
    console.error('❌ [DATABASE] Full error:', err);
  } else {
    console.log('✅ [DATABASE] Connected to SQLite database successfully');
    console.log('📁 [DATABASE] Database path:', dbPath);
    console.log('🔗 [DATABASE] Connection established at:', new Date().toISOString());
  }
});

// Helper functions for database operations
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    console.log('🔍 [DATABASE] Executing query:', sql);
    console.log('📝 [DATABASE] Parameters:', params);
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ [DATABASE] Query failed:', err.message);
        console.error('❌ [DATABASE] SQL:', sql);
        console.error('❌ [DATABASE] Parameters:', params);
        console.error('❌ [DATABASE] Error code:', err.code);
        reject(err);
      } else {
        console.log('✅ [DATABASE] Query executed successfully');
        console.log('📊 [DATABASE] Last ID:', this.lastID);
        console.log('📊 [DATABASE] Changes:', this.changes);
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function getRow(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Initialize database with tables
async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');

      // Create patients table
      db.run(`
        CREATE TABLE IF NOT EXISTS patients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patientId INTEGER UNIQUE NOT NULL,
          firstName TEXT NOT NULL,
          middleName TEXT,
          lastName TEXT NOT NULL,
          dateOfBirth TEXT NOT NULL,
          age INTEGER NOT NULL,
          gender TEXT NOT NULL,
          bloodGroup TEXT,
          phone TEXT NOT NULL,
          email TEXT,
          address TEXT NOT NULL,
          emergencyContact TEXT,
          emergencyPhone TEXT,
          medicalHistory TEXT,
          allergies TEXT,
          familyHistory TEXT,
          lifestyle TEXT,
          numberOfChildren INTEGER DEFAULT 0,
          vitalSigns TEXT,
          chiefComplaint TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Reset patientId sequence to start from 1 if table is empty
      db.run(`
        INSERT OR IGNORE INTO sqlite_sequence (name, seq) VALUES ('patients', 0)
      `, [], (err) => {
        if (err) {
          console.error('Warning: Could not reset patient sequence:', err.message);
        }
      });

      // Create doctors table
      db.run(`
        CREATE TABLE IF NOT EXISTS doctors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          doctorId TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          specialization TEXT NOT NULL,
          license TEXT UNIQUE NOT NULL,
          phone TEXT,
          email TEXT,
          department TEXT,
          password TEXT,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create prescriptions table
      db.run(`
        CREATE TABLE IF NOT EXISTS prescriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          prescriptionId TEXT UNIQUE NOT NULL,
          patientId INTEGER NOT NULL,
          doctorId INTEGER NOT NULL,
          date TEXT NOT NULL,
          diagnosis TEXT,
          symptoms TEXT,
          examination TEXT,
          medications TEXT NOT NULL,
          instructions TEXT,
          followUp TEXT,
          notes TEXT,
          labTestRecommendations TEXT,
          status TEXT DEFAULT 'active',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patientId) REFERENCES patients (id),
          FOREIGN KEY (doctorId) REFERENCES doctors (id)
        )
      `);

      // Create billing table
      db.run(`
        CREATE TABLE IF NOT EXISTS billing (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          billId TEXT UNIQUE NOT NULL,
          patientId INTEGER NOT NULL,
          prescriptionId INTEGER,
          billDate TEXT NOT NULL,
          services TEXT NOT NULL,
          subtotal REAL NOT NULL,
          discount REAL DEFAULT 0,
          tax REAL DEFAULT 0,
          total REAL NOT NULL,
          paymentStatus TEXT DEFAULT 'pending',
          paymentMethod TEXT,
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patientId) REFERENCES patients (id),
          FOREIGN KEY (prescriptionId) REFERENCES prescriptions (id)
        )
      `);

      // Create lab_prescriptions table for lab test prescriptions
      db.run(`
        CREATE TABLE IF NOT EXISTS lab_prescriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          prescriptionId TEXT UNIQUE NOT NULL,
          patientId INTEGER NOT NULL,
          doctorId INTEGER NOT NULL,
          prescriptionDate TEXT NOT NULL,
          diagnosis TEXT,
          symptoms TEXT,
          notes TEXT,
          status TEXT DEFAULT 'pending',
          priority TEXT DEFAULT 'routine',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patientId) REFERENCES patients (id),
          FOREIGN KEY (doctorId) REFERENCES doctors (id)
        )
      `);

      // Create lab_prescription_items table for individual lab tests in prescriptions
      db.run(`
        CREATE TABLE IF NOT EXISTS lab_prescription_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          prescriptionId INTEGER NOT NULL,
          testId INTEGER NOT NULL,
          testName TEXT NOT NULL,
          testCode TEXT,
          category TEXT,
          subcategory TEXT,
          price REAL NOT NULL,
          instructions TEXT,
          status TEXT DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (prescriptionId) REFERENCES lab_prescriptions (id),
          FOREIGN KEY (testId) REFERENCES lab_tests (id)
        )
      `);

      // Create lab_bills table for lab test billing
      db.run(`
        CREATE TABLE IF NOT EXISTS lab_bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          billId TEXT UNIQUE NOT NULL,
          patientId INTEGER NOT NULL,
          prescriptionId INTEGER,
          billDate TEXT NOT NULL,
          dueDate TEXT,
          subtotal REAL NOT NULL,
          discount REAL DEFAULT 0,
          tax REAL DEFAULT 0,
          total REAL NOT NULL,
          paymentStatus TEXT DEFAULT 'pending',
          paymentMethod TEXT,
          collectedBy TEXT,
          collectedAt TEXT,
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patientId) REFERENCES patients (id),
          FOREIGN KEY (prescriptionId) REFERENCES lab_prescriptions (id)
        )
      `);

      // Create lab_bill_items table for individual items in lab bills
      db.run(`
        CREATE TABLE IF NOT EXISTS lab_bill_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          billId INTEGER NOT NULL,
          testId INTEGER NOT NULL,
          testName TEXT NOT NULL,
          testCode TEXT,
          category TEXT,
          subcategory TEXT,
          price REAL NOT NULL,
          quantity INTEGER DEFAULT 1,
          total REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (billId) REFERENCES lab_bills (id),
          FOREIGN KEY (testId) REFERENCES lab_tests (id)
        )
      `);

      // Create appointments table
      db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          appointmentId TEXT UNIQUE NOT NULL,
          patientId INTEGER NOT NULL,
          doctorId INTEGER NOT NULL,
          appointmentDate TEXT NOT NULL,
          appointmentTime TEXT NOT NULL,
          appointmentType TEXT DEFAULT 'consultation',
          notes TEXT,
          status TEXT DEFAULT 'scheduled',
          priority TEXT DEFAULT 'normal',
          duration INTEGER DEFAULT 30,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patientId) REFERENCES patients (id),
          FOREIGN KEY (doctorId) REFERENCES doctors (id)
        )
      `);

      // Create clinical_notes table
      db.run(`
        CREATE TABLE IF NOT EXISTS clinical_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patientId INTEGER NOT NULL,
          doctorId INTEGER NOT NULL,
          noteDate TEXT NOT NULL,
          subjective TEXT NOT NULL,
          objective TEXT NOT NULL,
          assessment TEXT NOT NULL,
          plan TEXT NOT NULL,
          diagnosis TEXT,
          medications TEXT,
          followUp TEXT,
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patientId) REFERENCES patients (id),
          FOREIGN KEY (doctorId) REFERENCES doctors (id)
        )
      `);

      // Create medical_records table
      db.run(`
        CREATE TABLE IF NOT EXISTS medical_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recordId TEXT UNIQUE NOT NULL,
          patientId INTEGER NOT NULL,
          recordType TEXT NOT NULL,
          recordData TEXT NOT NULL,
          doctorId INTEGER,
          recordDate TEXT NOT NULL,
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patientId) REFERENCES patients (id),
          FOREIGN KEY (doctorId) REFERENCES doctors (id)
        )
      `);

      // Create users table for admin management
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          fullName TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          role TEXT NOT NULL,
          department TEXT,
          isActive BOOLEAN DEFAULT 1,
          permissions TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create user_rights table for granular access control
      db.run(`
        CREATE TABLE IF NOT EXISTS user_rights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          pageName TEXT NOT NULL,
          canView BOOLEAN DEFAULT 0,
          canCreate BOOLEAN DEFAULT 0,
          canEdit BOOLEAN DEFAULT 0,
          canDelete BOOLEAN DEFAULT 0,
          canExport BOOLEAN DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(userId, pageName)
        )
      `);

      // Create pages table for system pages
      db.run(`
        CREATE TABLE IF NOT EXISTS system_pages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pageName TEXT UNIQUE NOT NULL,
          pageTitle TEXT NOT NULL,
          pageDescription TEXT,
          category TEXT NOT NULL,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default system pages
      const defaultPages = [
        { pageName: 'overview', pageTitle: 'System Overview', pageDescription: 'System dashboard and statistics', category: 'admin' },
        { pageName: 'users', pageTitle: 'User Management', pageDescription: 'Manage system users and roles', category: 'admin' },
        { pageName: 'doctors', pageTitle: 'Doctor Management', pageDescription: 'Manage doctor profiles and specializations', category: 'admin' },
        { pageName: 'services', pageTitle: 'Service Management', pageDescription: 'Manage medical services and pricing', category: 'admin' },
        { pageName: 'bill-series', pageTitle: 'Bill Series Management', pageDescription: 'Manage billing series and formats', category: 'admin' },
        { pageName: 'specializations', pageTitle: 'Specialization Management', pageDescription: 'Manage medical specializations', category: 'admin' },
        { pageName: 'rights', pageTitle: 'Rights Management', pageDescription: 'Manage user access rights and permissions', category: 'admin' }
      ];

      defaultPages.forEach(page => {
        db.run(`
          INSERT OR IGNORE INTO system_pages (pageName, pageTitle, pageDescription, category)
          VALUES (?, ?, ?, ?)
        `, [page.pageName, page.pageTitle, page.pageDescription, page.category]);
      });

      // Create services table for billing
      db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          serviceId TEXT UNIQUE NOT NULL,
          serviceName TEXT NOT NULL,
          serviceType TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          isActive BOOLEAN DEFAULT 1,
          category TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create bill_series table for billing configuration
      db.run(`
        CREATE TABLE IF NOT EXISTS bill_series (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          seriesId TEXT UNIQUE NOT NULL,
          seriesName TEXT NOT NULL,
          prefix TEXT,
          suffix TEXT,
          startNumber INTEGER DEFAULT 1,
          currentNumber INTEGER DEFAULT 1,
          format TEXT,
          isActive BOOLEAN DEFAULT 1,
          description TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create specializations table for doctor specializations
      db.run(`
        CREATE TABLE IF NOT EXISTS specializations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          specializationId TEXT UNIQUE NOT NULL,
          specializationName TEXT NOT NULL,
          description TEXT,
          category TEXT,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create lab_tests table for laboratory test definitions
      db.run(`
        CREATE TABLE IF NOT EXISTS lab_tests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          testId TEXT UNIQUE NOT NULL,
          testName TEXT NOT NULL,
          testCode TEXT UNIQUE NOT NULL,
          category TEXT NOT NULL,
          subcategory TEXT,
          price DECIMAL(10,2) NOT NULL,
          description TEXT,
          preparation TEXT,
          turnaroundTime TEXT,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create lab_orders table for test orders from prescriptions
      db.run(`
        CREATE TABLE IF NOT EXISTS lab_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId TEXT UNIQUE NOT NULL,
          prescriptionId INTEGER NOT NULL,
          patientId INTEGER NOT NULL,
          doctorId INTEGER NOT NULL,
          orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'ordered',
          priority TEXT DEFAULT 'routine',
          clinicalNotes TEXT,
          instructions TEXT,
          totalAmount DECIMAL(10,2) DEFAULT 0,
          paymentStatus TEXT DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id),
          FOREIGN KEY (patientId) REFERENCES patients(id),
          FOREIGN KEY (doctorId) REFERENCES doctors(id)
        )
      `);

      // Create lab_order_items table for individual test items in an order
      db.run(`
        CREATE TABLE IF NOT EXISTS lab_order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId INTEGER NOT NULL,
          testId INTEGER NOT NULL,
          testName TEXT NOT NULL,
          testCode TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'ordered',
          clinicalNotes TEXT,
          instructions TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (orderId) REFERENCES lab_orders(id),
          FOREIGN KEY (testId) REFERENCES lab_tests(id)
        )
      `);

      // Create sample_collection table for tracking sample collection
      db.run(`
        CREATE TABLE IF NOT EXISTS sample_collection (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          collectionId TEXT UNIQUE NOT NULL,
          orderId INTEGER NOT NULL,
          patientId INTEGER NOT NULL,
          collectionDate DATETIME,
          collectionTime TEXT,
          collectorName TEXT,
          collectorId TEXT,
          sampleType TEXT,
          sampleQuantity TEXT,
          collectionNotes TEXT,
          status TEXT DEFAULT 'pending',
          priority TEXT DEFAULT 'routine',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (orderId) REFERENCES lab_orders(id),
          FOREIGN KEY (patientId) REFERENCES patients(id)
        )
      `);

      // Create dose_patterns table
      db.run(`
        CREATE TABLE IF NOT EXISTS dose_patterns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pattern TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL,
          category TEXT DEFAULT 'general',
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default specializations
      db.run(`
        INSERT OR IGNORE INTO specializations (specializationId, specializationName, description, category)
        VALUES
        ('SP001', 'Cardiology', 'Heart and cardiovascular system', 'Internal Medicine'),
        ('SP002', 'Dermatology', 'Skin, hair, and nails', 'Clinical'),
        ('SP003', 'Orthopedics', 'Bones, joints, and muscles', 'Surgical'),
        ('SP004', 'Pediatrics', 'Child and adolescent health', 'Clinical'),
        ('SP005', 'Neurology', 'Nervous system and brain', 'Internal Medicine'),
        ('SP006', 'General Medicine', 'General medical practice', 'Internal Medicine'),
        ('SP007', 'Gynecology', 'Women''s reproductive health', 'Clinical'),
        ('SP008', 'Psychiatry', 'Mental health and behavior', 'Clinical')
      `);

      // Insert default doctor if not exists
      db.run(`
        INSERT OR IGNORE INTO doctors (doctorId, name, specialization, license, phone, email, department)
        VALUES ('DOC001', 'Dr. [Your Name]', 'General Physician', 'MD[Your License]', '[Your Phone]', '[Your Email]', 'General Medicine')
      `);

      // Insert default admin user
      db.run(`
        INSERT OR IGNORE INTO users (userId, username, password, fullName, email, role, department)
        VALUES ('ADMIN001', 'admin', '$2a$10$demo.hash.for.admin', 'System Administrator', 'admin@opd-emr.com', 'admin', 'Administration')
      `);

      // Insert default system pages for rights management
      db.run(`
        INSERT OR IGNORE INTO system_pages (pageName, pageTitle, pageDescription, category)
        VALUES
        ('dashboard', 'Dashboard', 'Main dashboard and overview', 'Core'),
        ('patients', 'Patient Management', 'Patient registration and management', 'Patient Care'),
        ('appointments', 'Appointments', 'Appointment scheduling and management', 'Patient Care'),
        ('prescriptions', 'Prescriptions', 'Electronic prescription management', 'Clinical'),
        ('billing', 'Billing', 'Patient billing and payments', 'Financial'),
        ('doctors', 'Doctor Management', 'Doctor registration and management', 'Staff'),
        ('clinical-notes', 'Clinical Notes', 'Patient clinical notes and records', 'Clinical'),
        ('lab-tests', 'Laboratory Tests', 'Laboratory test management and sample collection', 'Clinical'),
        ('pharmacy', 'Pharmacy Management', 'Complete pharmacy inventory and sales management', 'Clinical'),
        ('pharmacy-inventory', 'Pharmacy Inventory', 'Manage pharmacy stock, items, and suppliers', 'Clinical'),
        ('pharmacy-sales', 'Pharmacy Sales', 'Process pharmacy sales and generate invoices', 'Clinical'),
        ('pharmacy-purchases', 'Pharmacy Purchases', 'Manage purchase orders and supplier relationships', 'Clinical'),
        ('pharmacy-reports', 'Pharmacy Reports', 'Pharmacy analytics and financial reports', 'Analytics'),
        ('admin-panel', 'Admin Panel', 'System administration and settings', 'Administration'),
        ('reports', 'Reports', 'System reports and analytics', 'Analytics'),
        ('settings', 'Settings', 'System configuration and preferences', 'Administration')
      `);

      // Insert default lab tests
      db.run(`
        INSERT OR IGNORE INTO lab_tests (testId, testName, testCode, category, subcategory, price, description, preparation, turnaroundTime)
        VALUES
        ('LT001', 'Complete Blood Count (CBC)', 'CBC', 'Hematology', 'Blood Analysis', 800.00, 'Complete blood count including RBC, WBC, hemoglobin, and platelets', 'Fasting for 8-12 hours', '4-6 hours'),
        ('LT002', 'Blood Glucose (Fasting)', 'FBG', 'Biochemistry', 'Diabetes Screening', 300.00, 'Fasting blood glucose test for diabetes diagnosis', 'Fasting for 8-12 hours', '2-4 hours'),
        ('LT003', 'Lipid Profile', 'LIPID', 'Biochemistry', 'Cardiovascular', 600.00, 'Complete lipid profile including cholesterol and triglycerides', 'Fasting for 12-14 hours', '4-6 hours'),
        ('LT004', 'Liver Function Test (LFT)', 'LFT', 'Biochemistry', 'Hepatology', 700.00, 'Liver function tests including enzymes and proteins', 'Fasting for 8-12 hours', '4-6 hours'),
        ('LT005', 'Kidney Function Test (KFT)', 'KFT', 'Biochemistry', 'Nephrology', 600.00, 'Kidney function tests including creatinine and urea', 'Fasting for 8-12 hours', '4-6 hours'),
        ('LT006', 'Urine Analysis', 'UA', 'Urinalysis', 'General', 300.00, 'Complete urinalysis including physical, chemical, and microscopic examination', 'First morning urine sample', '2-3 hours'),
        ('LT007', 'Thyroid Function Test', 'TFT', 'Endocrinology', 'Thyroid', 800.00, 'Thyroid function tests including TSH, T3, and T4', 'No special preparation required', '6-8 hours'),
        ('LT008', 'Electrocardiogram (ECG)', 'ECG', 'Cardiology', 'Heart', 500.00, 'Electrocardiogram for heart rhythm and function', 'No special preparation required', 'Immediate'),
        ('LT009', 'X-Ray Chest', 'CXR', 'Radiology', 'Chest', 800.00, 'Chest X-ray for lung and heart examination', 'No special preparation required', '1-2 hours'),
        ('LT010', 'Ultrasound Abdomen', 'USG-ABD', 'Radiology', 'Abdomen', 1200.00, 'Abdominal ultrasound for organ examination', 'Fasting for 6-8 hours', '2-3 hours')
      `);

      // Sample pharmacy data insertion (simplified)
      console.log('📦 Inserting basic sample data...');
      
      // Insert a basic admin user for testing
      db.run(`
        INSERT OR IGNORE INTO users (userId, username, password, fullName, email, role, department)
        VALUES ('ADMIN001', 'admin', '$2a$10$demo.hash.for.admin', 'System Administrator', 'admin@opd-emr.com', 'admin', 'Administration')
      `);
      
      console.log('✅ Basic sample data inserted successfully');

      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_patients_patientId ON patients(patientId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_prescriptions_patientId ON prescriptions(patientId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_prescriptions_doctorId ON prescriptions(doctorId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_billing_patientId ON billing(patientId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_appointments_patientId ON appointments(patientId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_appointments_doctorId ON appointments(doctorId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_lab_orders_patientId ON lab_orders(patientId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_lab_orders_prescriptionId ON lab_orders(prescriptionId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_lab_orders_doctorId ON lab_orders(doctorId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_lab_order_items_orderId ON lab_order_items(orderId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_sample_collection_orderId ON sample_collection(orderId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_sample_collection_patientId ON sample_collection(patientId)');
      
      // Pharmacy indexes (will be created when pharmacy schema is executed)
      console.log('📊 Database indexes created successfully');

      // Initialize Pharmacy Module Tables (temporarily skipped)
      console.log('🏥 Pharmacy Module initialization skipped for now...');
      
      // Create basic pharmacy tables manually
      db.run(`
        CREATE TABLE IF NOT EXISTS pharmacy_items (
          item_id INTEGER PRIMARY KEY AUTOINCREMENT,
          sku VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          generic_name VARCHAR(255),
          brand VARCHAR(255),
          unit VARCHAR(50) NOT NULL,
          item_type VARCHAR(100) NOT NULL,
          hsn_sac VARCHAR(20),
          mrp DECIMAL(10,2) NOT NULL,
          purchase_price DECIMAL(10,2) NOT NULL,
          selling_price DECIMAL(10,2) NOT NULL,
          min_stock INTEGER DEFAULT 0,
          reorder_level INTEGER DEFAULT 0,
          tax_rate DECIMAL(5,2) DEFAULT 0.00,
          is_prescription_required BOOLEAN DEFAULT FALSE,
          barcode VARCHAR(100),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      db.run(`
        CREATE TABLE IF NOT EXISTS pharmacy_suppliers (
          supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(255) NOT NULL,
          contact_person VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          gst_number VARCHAR(20),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Basic pharmacy tables created successfully');
      console.log('✅ Database tables created successfully');
      resolve();
    });
  });
}

// Close database connection
function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database connection closed');
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  initDatabase,
  runQuery,
  getRow,
  getAll,
  closeDatabase
};
