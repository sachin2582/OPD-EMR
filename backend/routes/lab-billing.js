const express = require('express');
const { runQuery, getRow, getAll } = require('../database/database');

const router = express.Router();

// Generate unique lab prescription ID
function generateLabPrescriptionId() {
  return `LAB-PRESC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
}

// Generate unique lab bill ID
function generateLabBillId() {
  return `LAB-BILL-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
}

// ==================== LAB PRESCRIPTIONS ====================

// GET all lab prescriptions with pagination and filters
router.get('/prescriptions', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      patientId, 
      doctorId, 
      status = '', 
      date = '',
      search = '',
      billingStatus = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT lp.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.phone as patientPhone,
             pat.age as patientAge,
             pat.gender as patientGender,
             d.name as doctorName,
             d.specialization as doctorSpecialization,
             CASE 
               WHEN lb.id IS NOT NULL THEN 'billed'
               ELSE 'unbilled'
             END as billingStatus
      FROM lab_prescriptions lp
      JOIN patients pat ON lp.patientId = pat.id
      JOIN doctors d ON lp.doctorId = d.id
      LEFT JOIN lab_bills lb ON lp.id = lb.prescriptionId
      WHERE 1=1
    `;
    let params = [];
    
    if (patientId) {
      sql += ` AND lp.patientId = ?`;
      params.push(patientId);
    }
    
    if (doctorId) {
      sql += ` AND lp.doctorId = ?`;
      params.push(doctorId);
    }
    
    if (status) {
      sql += ` AND lp.status = ?`;
      params.push(status);
    }
    
    if (billingStatus) {
      if (billingStatus === 'billed') {
        sql += ` AND lb.id IS NOT NULL`;
      } else if (billingStatus === 'unbilled') {
        sql += ` AND lb.id IS NULL`;
      }
    }
    
    if (date) {
      sql += ` AND DATE(lp.prescriptionDate) = DATE(?)`;
      params.push(date);
    }
    
    if (search) {
      sql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR lp.diagnosis LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sql += ` ORDER BY lp.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const prescriptions = await getAll(sql, params);
    
    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM lab_prescriptions lp
      JOIN patients pat ON lp.patientId = pat.id
      LEFT JOIN lab_bills lb ON lp.id = lb.prescriptionId
      WHERE 1=1
    `;
    let countParams = [];
    
    if (patientId) {
      countSql += ` AND lp.patientId = ?`;
      countParams.push(patientId);
    }
    
    if (doctorId) {
      countSql += ` AND lp.doctorId = ?`;
      countParams.push(doctorId);
    }
    
    if (status) {
      countSql += ` AND lp.status = ?`;
      countParams.push(status);
    }
    
    if (billingStatus) {
      if (billingStatus === 'billed') {
        countSql += ` AND lb.id IS NOT NULL`;
      } else if (billingStatus === 'unbilled') {
        countSql += ` AND lb.id IS NULL`;
      }
    }
    
    if (date) {
      countSql += ` AND DATE(lp.prescriptionDate) = DATE(?)`;
      countParams.push(date);
    }
    
    if (search) {
      countSql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR lp.diagnosis LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;
    
    res.json({
      prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching lab prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch lab prescriptions' });
  }
});

// GET unbilled prescriptions from regular prescription system (for billing staff)
router.get('/prescriptions/unbilled/regular', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get prescriptions with lab tests from regular prescriptions table
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
             p.date as prescriptionDate,
             p.id as prescriptionId
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
    
    const prescriptions = await getAll(sql, [parseInt(limit), offset]);
    
    // Process each prescription to get lab test details
    for (let prescription of prescriptions) {
      try {
        // Parse lab test recommendations
        if (prescription.labTestRecommendations) {
          let labTestIds;
          
          console.log('Raw labTestRecommendations:', prescription.labTestRecommendations);
          console.log('Type:', typeof prescription.labTestRecommendations);
          
          // Handle different data formats
          if (typeof prescription.labTestRecommendations === 'string') {
            try {
              // Check if it's already a JSON string or needs parsing
              if (prescription.labTestRecommendations.startsWith('[') || prescription.labTestRecommendations.startsWith('{')) {
                labTestIds = JSON.parse(prescription.labTestRecommendations);
              } else {
                // It might be a string representation of an object
                console.log('Attempting to parse string as JSON...');
                labTestIds = JSON.parse(prescription.labTestRecommendations);
              }
            } catch (error) {
              console.error('Error parsing lab test recommendations:', error);
              console.error('Raw data:', prescription.labTestRecommendations);
              labTestIds = [];
            }
          } else if (Array.isArray(prescription.labTestRecommendations)) {
            labTestIds = prescription.labTestRecommendations;
          } else if (typeof prescription.labTestRecommendations === 'object') {
            // Handle case where it's already an object
            console.log('Data is already an object, converting to array...');
            labTestIds = [prescription.labTestRecommendations];
          } else {
            console.error('Invalid lab test recommendations format:', prescription.labTestRecommendations);
            labTestIds = [];
          }
          
          console.log('Parsed labTestIds:', labTestIds);
          
          // Extract test codes from the parsed data
          const testCodes = labTestIds.map(item => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item.testCode) return item.testCode;
            return null;
          }).filter(code => code !== null);
          
          console.log('Extracted test codes:', testCodes);
          
          if (testCodes.length === 0) {
            prescription.prescriptionItems = [];
            continue;
          }
          
          // Get lab test details from lab_tests table
          const labTests = await getAll(`
            SELECT id, testName, testCode, category, subcategory, price, description
            FROM lab_tests 
            WHERE testCode IN (${testCodes.map(() => '?').join(',')})
          `, testCodes);
          
          // Add lab test details to prescription
          prescription.prescriptionItems = labTests.map(test => ({
            testId: test.id,
            testName: test.testName,
            testCode: test.testCode,
            category: test.category,
            subcategory: test.subcategory,
            price: test.price,
            description: test.description
          }));
        }
      } catch (parseError) {
        console.warn('Error parsing lab test recommendations for prescription:', prescription.id, parseError);
        prescription.prescriptionItems = [];
      }
    }
    
    // Get total count
    const countResult = await getRow(`
      SELECT COUNT(*) as total 
      FROM prescriptions p
      LEFT JOIN lab_bills lb ON p.id = lb.prescriptionId
      WHERE lb.id IS NULL 
        AND p.labTestRecommendations IS NOT NULL 
        AND p.labTestRecommendations != '[]'
        AND p.labTestRecommendations != 'null'
    `);
    
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
    console.error('Error fetching unbilled prescriptions from regular system:', error);
    res.status(500).json({ error: 'Failed to fetch unbilled prescriptions' });
  }
});

// GET unbilled prescriptions (for billing staff) - MUST BE BEFORE /:id route
router.get('/prescriptions/unbilled', async (req, res) => {
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
    
    const prescriptions = await getAll(sql, [parseInt(limit), offset]);
    
    // Process each prescription to get lab test details from labTestRecommendations
    for (let prescription of prescriptions) {
      try {
        if (prescription.labTestRecommendations) {
          const labTestIds = JSON.parse(prescription.labTestRecommendations);
          const labTests = await getAll(`
            SELECT id, testName, testCode, category, subcategory, price, instructions
            FROM lab_tests 
            WHERE testCode IN (${labTestIds.map(() => '?').join(',')})
          `, labTestIds);
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
    const countResult = await getRow(`
      SELECT COUNT(*) as total 
      FROM prescriptions p
      LEFT JOIN lab_bills lb ON p.id = lb.prescriptionId
      WHERE lb.id IS NULL 
        AND p.labTestRecommendations IS NOT NULL 
        AND p.labTestRecommendations != '[]'
        AND p.labTestRecommendations != 'null'
    `);
    
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

// GET lab prescription by ID with items
router.get('/prescriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const prescription = await getRow(`
      SELECT lp.*, 
             pat.firstName as patientFirstName, 
             pat.middleName as patientMiddleName,
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.age as patientAge,
             pat.gender as patientGender,
             pat.phone as patientPhone,
             pat.address as patientAddress,
             d.name as doctorName,
             d.specialization as doctorSpecialization,
             d.license as doctorLicense
      FROM lab_prescriptions lp
      JOIN patients pat ON lp.patientId = pat.id
      JOIN doctors d ON lp.doctorId = d.id
      WHERE lp.id = ? OR lp.prescriptionId = ?
    `, [id, id]);
    
    if (!prescription) {
      return res.status(404).json({ error: 'Lab prescription not found' });
    }
    
    // Get prescription items (lab tests)
    const prescriptionItems = await getAll(`
      SELECT lpi.*, lt.testName as originalTestName, lt.testCode as originalTestCode
      FROM lab_prescription_items lpi
      LEFT JOIN lab_tests lt ON lpi.testId = lt.id
      WHERE lpi.prescriptionId = ?
    `, [prescription.id]);
    
    // Check if already billed
    const existingBill = await getRow(`
      SELECT * FROM lab_bills WHERE prescriptionId = ?
    `, [prescription.id]);
    
    res.json({
      ...prescription,
      prescriptionItems,
      isBilled: !!existingBill,
      existingBill
    });
  } catch (error) {
    console.error('Error fetching lab prescription:', error);
    res.status(500).json({ error: 'Failed to fetch lab prescription' });
  }
});

// POST create new lab prescription
router.post('/prescriptions', async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      prescriptionDate,
      diagnosis,
      symptoms,
      notes,
      priority = 'routine',
      tests
    } = req.body;
    
    // Validation
    if (!patientId || !doctorId || !prescriptionDate || !tests || tests.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientId, doctorId, prescriptionDate, tests' 
      });
    }
    
    // Check if patient exists
    const patient = await getRow('SELECT id FROM patients WHERE id = ? OR patientId = ?', [patientId, patientId]);
    if (!patient) {
      return res.status(400).json({ error: 'Patient not found' });
    }
    
    // Check if doctor exists
    const doctor = await getRow('SELECT id FROM doctors WHERE id = ? OR doctorId = ?', [doctorId, doctorId]);
    if (!doctor) {
      return res.status(400).json({ error: 'Doctor not found' });
    }
    
    const prescriptionId = generateLabPrescriptionId();
    
    // Create prescription
    const result = await runQuery(`
      INSERT INTO lab_prescriptions (
        prescriptionId, patientId, doctorId, prescriptionDate, diagnosis, symptoms, notes, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      prescriptionId, patient.id, doctor.id, prescriptionDate, diagnosis, symptoms, notes, priority
    ]);
    
    const prescriptionDbId = result.lastID;
    
    // Create prescription items
    for (const test of tests) {
      await runQuery(`
        INSERT INTO lab_prescription_items (
          prescriptionId, testId, testName, testCode, category, subcategory, price, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prescriptionDbId, test.testId, test.testName, test.testCode, 
        test.category, test.subcategory, test.price, test.instructions || ''
      ]);
    }
    
    // Get the created prescription with items
    const newPrescription = await getRow(`
      SELECT lp.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             d.name as doctorName,
             d.specialization as doctorSpecialization
      FROM lab_prescriptions lp
      JOIN patients pat ON lp.patientId = pat.id
      JOIN doctors d ON lp.doctorId = d.id
      WHERE lp.id = ?
    `, [prescriptionDbId]);
    
    const prescriptionItems = await getAll(`
      SELECT * FROM lab_prescription_items WHERE prescriptionId = ?
    `, [prescriptionDbId]);
    
    res.status(201).json({
      message: 'Lab prescription created successfully',
      prescription: {
        ...newPrescription,
        prescriptionItems
      }
    });
  } catch (error) {
    console.error('Error creating lab prescription:', error);
    res.status(500).json({ error: 'Failed to create lab prescription' });
  }
});

// ==================== LAB BILLING ====================

// GET all lab bills with pagination and filters
router.get('/bills', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      patientId, 
      status = '', 
      date = '',
      search = '',
      paymentStatus = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT lb.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.phone as patientPhone,
             lp.prescriptionId as prescriptionUniqueId,
             d.name as doctorName,
             d.specialization as doctorSpecialization
      FROM lab_bills lb
      JOIN patients pat ON lb.patientId = pat.id
      LEFT JOIN lab_prescriptions lp ON lb.prescriptionId = lp.id
      LEFT JOIN doctors d ON lp.doctorId = d.id
      WHERE 1=1
    `;
    let params = [];
    
    if (patientId) {
      sql += ` AND lb.patientId = ?`;
      params.push(patientId);
    }
    
    if (status) {
      sql += ` AND lb.status = ?`;
      params.push(status);
    }
    
    if (paymentStatus) {
      sql += ` AND lb.paymentStatus = ?`;
      params.push(paymentStatus);
    }
    
    if (date) {
      sql += ` AND DATE(lb.billDate) = DATE(?)`;
      params.push(date);
    }
    
    if (search) {
      sql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR lb.billId LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sql += ` ORDER BY lb.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const bills = await getAll(sql, params);
    
    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM lab_bills lb
      JOIN patients pat ON lb.patientId = pat.id
      WHERE 1=1
    `;
    let countParams = [];
    
    if (patientId) {
      countSql += ` AND lb.patientId = ?`;
      countParams.push(patientId);
    }
    
    if (status) {
      countSql += ` AND lb.status = ?`;
      countParams.push(status);
    }
    
    if (paymentStatus) {
      countSql += ` AND lb.paymentStatus = ?`;
      countParams.push(paymentStatus);
    }
    
    if (date) {
      countSql += ` AND DATE(lb.billDate) = DATE(?)`;
      countParams.push(date);
    }
    
    if (search) {
      countSql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR lb.billId LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;
    
    res.json({
      bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching lab bills:', error);
    res.status(500).json({ error: 'Failed to fetch lab bills' });
  }
});

// GET lab bill by ID with items
router.get('/bills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const bill = await getRow(`
      SELECT lb.*, 
             pat.firstName as patientFirstName, 
             pat.middleName as patientMiddleName,
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.age as patientAge,
             pat.gender as patientGender,
             pat.phone as patientPhone,
             pat.address as patientAddress,
             lp.prescriptionId as prescriptionUniqueId,
             lp.diagnosis as prescriptionDiagnosis,
             lp.symptoms as prescriptionSymptoms,
             d.name as doctorName,
             d.specialization as doctorSpecialization
      FROM lab_bills lb
      JOIN patients pat ON lb.patientId = pat.id
      LEFT JOIN lab_prescriptions lp ON lb.prescriptionId = lp.id
      LEFT JOIN doctors d ON lp.doctorId = d.id
      WHERE lb.id = ? OR lb.billId = ?
    `, [id, id]);
    
    if (!bill) {
      return res.status(404).json({ error: 'Lab bill not found' });
    }
    
    // Get bill items
    const billItems = await getAll(`
      SELECT * FROM lab_bill_items WHERE billId = ?
    `, [bill.id]);
    
    res.json({
      ...bill,
      billItems
    });
  } catch (error) {
    console.error('Error fetching lab bill:', error);
    res.status(500).json({ error: 'Failed to fetch lab bill' });
  }
});

// POST create new lab bill from prescription
router.post('/bills', async (req, res) => {
  try {
    const {
      prescriptionId,
      patientId,
      billDate,
      dueDate,
      discount = 0,
      tax = 0,
      notes,
      collectedBy
    } = req.body;
    
    // Validation
    if (!prescriptionId || !patientId || !billDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: prescriptionId, patientId, billDate' 
      });
    }
    
    // Check if prescription exists and get items from regular prescriptions table
    const prescription = await getRow(`
      SELECT p.*, 
             pat.id as patientDbId,
             pat.firstName as patientFirstName,
             pat.lastName as patientLastName
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      WHERE p.id = ? OR p.prescriptionId = ?
    `, [prescriptionId, prescriptionId]);
    
    if (!prescription) {
      return res.status(400).json({ error: 'Prescription not found' });
    }
    
    // Check if already billed
    const existingBill = await getRow(`
      SELECT id FROM lab_bills WHERE prescriptionId = ?
    `, [prescription.id]);
    
    if (existingBill) {
      return res.status(400).json({ error: 'This prescription has already been billed' });
    }
    
    // Process lab test recommendations to get prescription items
    if (!prescription.labTestRecommendations) {
      return res.status(400).json({ error: 'No lab tests found in prescription' });
    }
    
    let labTestIds;
    
    // Handle different data formats
    if (typeof prescription.labTestRecommendations === 'string') {
      try {
        if (prescription.labTestRecommendations.startsWith('[') || prescription.labTestRecommendations.startsWith('{')) {
          labTestIds = JSON.parse(prescription.labTestRecommendations);
        } else {
          labTestIds = JSON.parse(prescription.labTestRecommendations);
        }
      } catch (error) {
        console.error('Error parsing lab test recommendations:', error);
        labTestIds = [];
      }
    } else if (Array.isArray(prescription.labTestRecommendations)) {
      labTestIds = prescription.labTestRecommendations;
    } else if (typeof prescription.labTestRecommendations === 'object') {
      labTestIds = [prescription.labTestRecommendations];
    } else {
      labTestIds = [];
    }
    
    // Extract test codes from the parsed data
    const testCodes = labTestIds.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item.testCode) return item.testCode;
      return null;
    }).filter(code => code !== null);
    
    if (testCodes.length === 0) {
      return res.status(400).json({ error: 'No valid lab test codes found in prescription' });
    }
    
    // Get lab test details from lab_tests table
    const labTests = await getAll(`
      SELECT id, testName, testCode, category, subcategory, price, description
      FROM lab_tests 
      WHERE testCode IN (${testCodes.map(() => '?').join(',')})
    `, testCodes);
    
    if (labTests.length === 0) {
      return res.status(400).json({ error: 'No lab tests found in database for the specified codes' });
    }
    
    // Create prescription items
    const prescriptionItems = labTests.map(test => ({
      testId: test.id,
      testName: test.testName,
      testCode: test.testCode,
      category: test.category,
      subcategory: test.subcategory,
      price: test.price,
      description: test.description
    }));
    
    // Calculate totals
    const subtotal = prescriptionItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const total = subtotal - discount + tax;
    
    const billId = generateLabBillId();
    
    // Create bill
    const result = await runQuery(`
      INSERT INTO lab_bills (
        billId, patientId, prescriptionId, billDate, dueDate, subtotal,
        discount, tax, total, notes, collectedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      billId, prescription.patientDbId, prescription.id, billDate, dueDate, subtotal,
      discount, tax, total, notes, collectedBy
    ]);
    
    const billDbId = result.lastID;
    
    // Create bill items
    for (const item of prescriptionItems) {
      await runQuery(`
        INSERT INTO lab_bill_items (
          billId, testId, testName, testCode, category, subcategory, price, quantity, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        billDbId, item.testId, item.testName, item.testCode, 
        item.category, item.subcategory, item.price, 1, item.price
      ]);
    }
    
    // Get the created bill with items
    const newBill = await getRow(`
      SELECT lb.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId
      FROM lab_bills lb
      JOIN patients pat ON lb.patientId = pat.id
      WHERE lb.id = ?
    `, [billDbId]);
    
    const billItems = await getAll(`
      SELECT * FROM lab_bill_items WHERE billId = ?
    `, [billDbId]);
    
    res.status(201).json({
      message: 'Lab bill created successfully',
      bill: {
        ...newBill,
        billItems
      }
    });
  } catch (error) {
    console.error('Error creating lab bill:', error);
    res.status(500).json({ error: 'Failed to create lab bill' });
  }
});

// PUT update lab bill payment status
router.put('/bills/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, collectedBy, notes } = req.body;
    
    // Check if bill exists
    const existingBill = await getRow('SELECT id FROM lab_bills WHERE id = ? OR billId = ?', [id, id]);
    if (!existingBill) {
      return res.status(404).json({ error: 'Lab bill not found' });
    }
    
    // Validate payment status
    const validStatuses = ['pending', 'partial', 'paid', 'cancelled'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    
    const collectedAt = paymentStatus === 'paid' ? new Date().toISOString() : null;
    
    // Update payment information
    await runQuery(`
      UPDATE lab_bills 
      SET paymentStatus = ?, 
          paymentMethod = ?, 
          collectedBy = ?,
          collectedAt = ?,
          notes = ?, 
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [paymentStatus, paymentMethod, collectedBy, collectedAt, notes, existingBill.id]);
    
    // Get updated bill
    const updatedBill = await getRow(`
      SELECT lb.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId
      FROM lab_bills lb
      JOIN patients pat ON lb.patientId = pat.id
      WHERE lb.id = ?
    `, [existingBill.id]);
    
    res.json({
      message: 'Payment status updated successfully',
      bill: updatedBill
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// GET lab billing statistics
router.get('/stats', async (req, res) => {
  try {
    const totalBills = await getRow('SELECT COUNT(*) as count FROM lab_bills');
    const pendingBills = await getRow('SELECT COUNT(*) as count FROM lab_bills WHERE paymentStatus = "pending"');
    const paidBills = await getRow('SELECT COUNT(*) as count FROM lab_bills WHERE paymentStatus = "paid"');
    const billsToday = await getRow(
      'SELECT COUNT(*) as count FROM lab_bills WHERE DATE(billDate) = DATE("now")'
    );
    const totalRevenue = await getRow('SELECT SUM(total) as total FROM lab_bills WHERE paymentStatus = "paid"');
    const pendingAmount = await getRow('SELECT SUM(total) as total FROM lab_bills WHERE paymentStatus = "pending"');
    
    // Lab prescription stats
    const totalPrescriptions = await getRow('SELECT COUNT(*) as count FROM prescriptions WHERE labTestRecommendations IS NOT NULL AND labTestRecommendations != "[]" AND labTestRecommendations != "null"');
    const unbilledPrescriptions = await getRow(`
      SELECT COUNT(*) as count 
      FROM prescriptions p
      LEFT JOIN lab_bills lb ON p.id = lb.prescriptionId
      WHERE lb.id IS NULL 
        AND p.labTestRecommendations IS NOT NULL 
        AND p.labTestRecommendations != '[]'
        AND p.labTestRecommendations != 'null'
    `);
    
    res.json({
      bills: {
        total: totalBills.count,
        pending: pendingBills.count,
        paid: paidBills.count,
        today: billsToday.count,
        totalRevenue: totalRevenue.total || 0,
        pendingAmount: pendingAmount.total || 0
      },
      prescriptions: {
        total: totalPrescriptions.count,
        unbilled: unbilledPrescriptions.count
      }
    });
  } catch (error) {
    console.error('Error fetching lab billing statistics:', error);
    res.status(500).json({ error: 'Failed to fetch lab billing statistics' });
  }
});

module.exports = router;
