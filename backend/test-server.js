const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('Database path:', dbPath);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!', dbPath });
});

// Lab billing stats endpoint
app.get('/api/lab-billing/stats', async (req, res) => {
  try {
    // Get lab prescription stats from e-prescriptions
    const totalPrescriptions = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM prescriptions WHERE labTestRecommendations IS NOT NULL AND labTestRecommendations != "[]" AND labTestRecommendations != "null"', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const unbilledPrescriptions = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count 
        FROM prescriptions p
        LEFT JOIN lab_bills lb ON p.id = lb.prescriptionId
        WHERE lb.id IS NULL 
          AND p.labTestRecommendations IS NOT NULL 
          AND p.labTestRecommendations != '[]'
          AND p.labTestRecommendations != 'null'
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      bills: {
        total: 0,
        pending: 0,
        paid: 0,
        today: 0,
        totalRevenue: 0,
        pendingAmount: 0
      },
      prescriptions: {
        total: totalPrescriptions.count,
        unbilled: unbilledPrescriptions.count
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get unbilled prescriptions endpoint
app.get('/api/lab-billing/prescriptions/unbilled', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT p.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.phone as patientPhone,
             pat.age as patientAge,
             pat.gender as patientGender,
             d.name as doctorName,
             d.specialization as doctorSpecialization,
             p.date as prescriptionDate
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      JOIN doctors d ON p.doctorId = d.id
      LEFT JOIN lab_bills lb ON p.id = lb.prescriptionId
      WHERE lb.id IS NULL 
        AND p.labTestRecommendations IS NOT NULL 
        AND p.labTestRecommendations != '[]'
        AND p.labTestRecommendations != 'null'
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const prescriptions = await new Promise((resolve, reject) => {
      db.all(sql, [parseInt(limit), offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Process each prescription to get lab test details
    for (let prescription of prescriptions) {
      try {
        if (prescription.labTestRecommendations) {
          const labTestIds = JSON.parse(prescription.labTestRecommendations);
          const labTests = await new Promise((resolve, reject) => {
            const placeholders = labTestIds.map(() => '?').join(',');
            db.all(`
              SELECT id, testName, testCode, category, subcategory, price, instructions
              FROM lab_tests 
              WHERE testCode IN (${placeholders})
            `, labTestIds, (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            });
          });
          
          prescription.prescriptionItems = labTests.map(test => ({
            testId: test.id,
            testName: test.testName,
            testCode: test.testCode,
            category: test.category,
            subcategory: test.subcategory,
            price: test.price,
            instructions: test.instructions
          }));
        }
      } catch (parseError) {
        console.warn('Error parsing lab test recommendations for prescription:', prescription.id, parseError);
        prescription.prescriptionItems = [];
      }
    }
    
    // Get total count
    const countResult = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as total 
        FROM prescriptions p
        LEFT JOIN lab_bills lb ON p.id = lb.prescriptionId
        WHERE lb.id IS NULL 
          AND p.labTestRecommendations IS NOT NULL 
          AND p.labTestRecommendations != '[]'
          AND p.labTestRecommendations != 'null'
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({
      prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching unbilled prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch unbilled prescriptions' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Lab billing stats: http://localhost:${PORT}/api/lab-billing/stats`);
  console.log(`📋 Unbilled prescriptions: http://localhost:${PORT}/api/lab-billing/prescriptions/unbilled`);
});
