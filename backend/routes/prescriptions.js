const express = require('express');
const { runQuery, getRow, getAll } = require('../database/database');

const router = express.Router();

// Generate unique prescription ID
function generatePrescriptionId() {
  return `PRESC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
}

// GET all prescriptions with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      patientId, 
      doctorId, 
      status = '', 
      date = '',
      search = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT p.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             d.name as doctorName,
             d.specialization as doctorSpecialization
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      JOIN doctors d ON p.doctorId = d.id
      WHERE 1=1
    `;
    let params = [];
    
    if (patientId) {
      sql += ` AND p.patientId = ?`;
      params.push(patientId);
    }
    
    if (doctorId) {
      sql += ` AND p.doctorId = ?`;
      params.push(doctorId);
    }
    
    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }
    
    if (date) {
      sql += ` AND DATE(p.date) = DATE(?)`;
      params.push(date);
    }
    
    if (search) {
      sql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR p.diagnosis LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sql += ` ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const prescriptions = await getAll(sql, params);
    
    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      WHERE 1=1
    `;
    let countParams = [];
    
    if (patientId) {
      countSql += ` AND p.patientId = ?`;
      countParams.push(patientId);
    }
    
    if (doctorId) {
      countSql += ` AND p.doctorId = ?`;
      countParams.push(doctorId);
    }
    
    if (status) {
      countSql += ` AND p.status = ?`;
      countParams.push(status);
    }
    
    if (date) {
      countSql += ` AND DATE(p.date) = DATE(?)`;
      countParams.push(date);
    }
    
    if (search) {
      countSql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR p.diagnosis LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;
    
    res.json({
      prescriptions,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// GET prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const prescription = await getRow(`
      SELECT p.*, 
             pat.firstName as patientFirstName, 
             pat.middleName as patientMiddleName,
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.age as patientAge,
             pat.gender as patientGender,
             pat.bloodGroup as patientBloodGroup,
             pat.phone as patientPhone,
             pat.address as patientAddress,
             pat.vitalSigns as patientVitalSigns,
             d.name as doctorName,
             d.specialization as doctorSpecialization,
             d.license as doctorLicense
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      JOIN doctors d ON p.doctorId = d.id
      WHERE p.id = ? OR p.prescriptionId = ?
    `, [id, id]);
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Parse JSON fields
    try {
      if (prescription.medications) {
        prescription.medications = JSON.parse(prescription.medications);
      }
      if (prescription.patientVitalSigns) {
        prescription.patientVitalSigns = JSON.parse(prescription.patientVitalSigns);
      }
    } catch (e) {
      console.warn('Error parsing JSON fields:', e);
    }
    
    res.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// POST create new prescription
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      date,
      diagnosis,
      symptoms,
      examination,
      medications,
      instructions,
      followUp,
      notes,
      labTestRecommendations
    } = req.body;
    
    // Validation
    if (!patientId || !doctorId || !date || !medications || medications.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientId, doctorId, date, medications' 
      });
    }
    
    // Check if patient exists
    const patient = await getRow('SELECT id FROM patients WHERE id = ? OR patientId = ?', [patientId, patientId]);
    if (!patient) {
      return res.status(400).json({ error: 'Patient not found' });
    }
    
    // Check if doctor exists in doctors table
    const doctor = await getRow('SELECT id FROM doctors WHERE id = ?', [doctorId]);
    if (!doctor) {
      return res.status(400).json({ error: 'Doctor not found' });
    }
    
    const prescriptionId = generatePrescriptionId();
    const medicationsJson = JSON.stringify(medications);
    const labTestRecommendationsJson = labTestRecommendations ? JSON.stringify(labTestRecommendations) : null;
    
    const result = await runQuery(`
      INSERT INTO prescriptions (
        prescriptionId, patientId, doctorId, date, diagnosis, symptoms,
        examination, medications, instructions, followUp, notes, labTestRecommendations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      prescriptionId, patient.id, doctor.id, date, diagnosis, symptoms,
      examination, medicationsJson, instructions, followUp, notes, labTestRecommendationsJson
    ]);
    
    // Get the created prescription
    const newPrescription = await getRow(`
      SELECT p.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             d.name as doctorName,
             d.specialization as doctorSpecialization
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      JOIN doctors d ON p.doctorId = d.id
      WHERE p.id = ?
    `, [result.id]);
    
    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: newPrescription
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// PUT update prescription
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if prescription exists
    const existingPrescription = await getRow('SELECT id FROM prescriptions WHERE id = ? OR prescriptionId = ?', [id, id]);
    if (!existingPrescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Prepare update fields
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'prescriptionId' && key !== 'createdAt') {
        if (key === 'medications' && updateData[key]) {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(existingPrescription.id);
    
    const sql = `UPDATE prescriptions SET ${fields.join(', ')} WHERE id = ?`;
    await runQuery(sql, values);
    
    // Get updated prescription
    const updatedPrescription = await getRow(`
      SELECT p.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             d.name as doctorName,
             d.specialization as doctorSpecialization
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      JOIN doctors d ON p.doctorId = d.id
      WHERE p.id = ?
    `, [existingPrescription.id]);
    
    res.json({
      message: 'Prescription updated successfully',
      prescription: updatedPrescription
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ error: 'Failed to update prescription' });
  }
});

// DELETE prescription (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if prescription exists
    const existingPrescription = await getRow('SELECT id FROM prescriptions WHERE id = ? OR prescriptionId = ?', [id, id]);
    if (!existingPrescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Check if prescription has associated bills
    const associatedBills = await getRow(
      'SELECT COUNT(*) as count FROM billing WHERE prescriptionId = ?',
      [existingPrescription.id]
    );
    
    if (associatedBills.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete prescription with associated bills' 
      });
    }
    
    // Soft delete by updating status
    await runQuery(
      'UPDATE prescriptions SET status = "cancelled", updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [existingPrescription.id]
    );
    
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
});

// GET prescriptions by patient ID
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const prescriptions = await getAll(`
      SELECT p.*, 
             d.name as doctorName,
             d.specialization as doctorSpecialization
      FROM prescriptions p
      JOIN doctors d ON p.doctorId = d.id
      WHERE p.patientId = ? OR p.patientId = (SELECT id FROM patients WHERE patientId = ?)
      ORDER BY p.date DESC
    `, [patientId, patientId]);
    
    // Parse JSON fields
    prescriptions.forEach(prescription => {
      try {
        if (prescription.medications) {
          prescription.medications = JSON.parse(prescription.medications);
        }
      } catch (e) {
        console.warn('Error parsing medications JSON:', e);
      }
    });
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch patient prescriptions' });
  }
});

// GET prescriptions by doctor ID
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date = '', status = '' } = req.query;
    
    let sql = `
      SELECT p.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.age as patientAge,
             pat.gender as patientGender
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      WHERE p.doctorId = ? OR p.doctorId = (SELECT id FROM doctors WHERE doctorId = ?)
    `;
    let params = [doctorId, doctorId];
    
    if (date) {
      sql += ` AND DATE(p.date) = DATE(?)`;
      params.push(date);
    }
    
    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }
    
    sql += ` ORDER BY p.date DESC`;
    
    const prescriptions = await getAll(sql, params);
    
    // Parse JSON fields
    prescriptions.forEach(prescription => {
      try {
        if (prescription.medications) {
          prescription.medications = JSON.parse(prescription.medications);
        }
      } catch (e) {
        console.warn('Error parsing medications JSON:', e);
      }
    });
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch doctor prescriptions' });
  }
});

// GET prescription statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalPrescriptions = await getRow('SELECT COUNT(*) as count FROM prescriptions');
    const activePrescriptions = await getRow('SELECT COUNT(*) as count FROM prescriptions WHERE status = "active"');
    const prescriptionsToday = await getRow(
      'SELECT COUNT(*) as count FROM prescriptions WHERE DATE(date) = DATE("now")'
    );
    const prescriptionsThisWeek = await getRow(
      'SELECT COUNT(*) as count FROM prescriptions WHERE DATE(date) >= DATE("now", "-7 days")'
    );
    const prescriptionsThisMonth = await getRow(
      'SELECT COUNT(*) as count FROM prescriptions WHERE DATE(date) >= DATE("now", "-30 days")'
    );
    
    res.json({
      total: totalPrescriptions.count,
      active: activePrescriptions.count,
      today: prescriptionsToday.count,
      thisWeek: prescriptionsThisWeek.count,
      thisMonth: prescriptionsThisMonth.count
    });
  } catch (error) {
    console.error('Error fetching prescription statistics:', error);
    res.status(500).json({ error: 'Failed to fetch prescription statistics' });
  }
});

// POST create pharmacy order from prescription
router.post('/:id/pharmacy-order', async (req, res) => {
  try {
    const { id } = req.params;
    const { items, notes, priority = 'routine' } = req.body;
    
    // Check if prescription exists
    const prescription = await getRow('SELECT * FROM prescriptions WHERE id = ? OR prescriptionId = ?', [id, id]);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Pharmacy items are required' });
    }
    
    // Generate order ID
    const orderId = `PHARM-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += (item.quantity || 1) * (item.unitPrice || 0);
    }
    
    // Create pharmacy order
    const orderResult = await runQuery(`
      INSERT INTO pharmacy_orders (
        orderId, prescriptionId, patientId, doctorId, 
        totalAmount, notes, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId, prescription.id, prescription.patientId, prescription.doctorId,
      totalAmount, notes, priority
    ]);
    
    // Create pharmacy order items
    for (const item of items) {
      await runQuery(`
        INSERT INTO pharmacy_order_items (
          orderId, itemId, itemName, itemCode, quantity, 
          unitPrice, totalPrice, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderResult.id, item.itemId, item.itemName, item.itemCode,
        item.quantity || 1, item.unitPrice || 0, 
        (item.quantity || 1) * (item.unitPrice || 0), item.instructions
      ]);
    }
    
    // Get created order with items
    const createdOrder = await getRow(`
      SELECT po.*, 
             pat.firstName as patientFirstName,
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             d.name as doctorName
      FROM pharmacy_orders po
      JOIN patients pat ON po.patientId = pat.id
      JOIN doctors d ON po.doctorId = d.id
      WHERE po.id = ?
    `, [orderResult.id]);
    
    const orderItems = await getAll(`
      SELECT poi.*, pi.name as itemName, pi.sku
      FROM pharmacy_order_items poi
      LEFT JOIN pharmacy_items pi ON poi.itemId = pi.item_id
      WHERE poi.orderId = ?
    `, [orderResult.id]);
    
    res.status(201).json({
      message: 'Pharmacy order created successfully',
      order: createdOrder,
      items: orderItems
    });
  } catch (error) {
    console.error('Error creating pharmacy order:', error);
    res.status(500).json({ error: 'Failed to create pharmacy order' });
  }
});

// POST create lab order from prescription
router.post('/:id/lab-order', async (req, res) => {
  try {
    const { id } = req.params;
    const { tests, clinicalNotes, instructions, priority = 'routine' } = req.body;
    
    // Check if prescription exists
    const prescription = await getRow('SELECT * FROM prescriptions WHERE id = ? OR prescriptionId = ?', [id, id]);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Validation
    if (!tests || tests.length === 0) {
      return res.status(400).json({ error: 'Lab tests are required' });
    }
    
    // Generate order ID
    const orderId = `LAB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    // Calculate total amount
    let totalAmount = 0;
    for (const test of tests) {
      totalAmount += test.price || 0;
    }
    
    // Create separate lab orders for each test (one order per test with direct testId relationship)
    const createdOrders = [];
    
    for (const test of tests) {
      const testData = await getRow('SELECT testName, testCode, price FROM lab_tests WHERE id = ?', [test.testId]);
      if (testData) {
        const testOrderId = `LAB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
        const testPrice = parseFloat(testData.price);
        
        // Create lab order with direct testId relationship
        const orderResult = await runQuery(`
          INSERT INTO lab_orders (orderId, prescriptionId, patientId, doctorId, testId, clinicalNotes, instructions, totalAmount, priority)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [testOrderId, prescription.id, prescription.patientId, prescription.doctorId, test.testId, test.clinicalNotes, test.instructions, testPrice, priority]);
        
        // Create lab order item for this specific test
        await runQuery(`
          INSERT INTO lab_order_items (orderId, testId, testName, testCode, price, clinicalNotes, instructions)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [orderResult.id, test.testId, testData.testName, testData.testCode, testPrice, test.clinicalNotes, test.instructions]);
        
        createdOrders.push(orderResult);
      }
    }
    
    // Get details for all created orders
    const newOrders = [];
    for (const orderResult of createdOrders) {
      const orderDetails = await getRow(`
        SELECT lo.*, 
               p.prescriptionId as prescriptionUniqueId,
               pat.firstName as patientFirstName,
               pat.lastName as patientLastName,
               pat.patientId as patientUniqueId,
               d.name as doctorName,
               lt.testName,
               lt.testCode
        FROM lab_orders lo
        JOIN prescriptions p ON lo.prescriptionId = p.id
        JOIN patients pat ON lo.patientId = pat.id
        JOIN doctors d ON lo.doctorId = d.id
        LEFT JOIN lab_tests lt ON lo.testId = lt.id
        WHERE lo.id = ?
      `, [orderResult.id]);
      
      const orderItems = await getAll(`
        SELECT loi.*, lt.testName, lt.testCode
        FROM lab_order_items loi
        LEFT JOIN lab_tests lt ON loi.testId = lt.id
        WHERE loi.orderId = ?
      `, [orderResult.id]);
      
      newOrders.push({
        ...orderDetails,
        items: orderItems
      });
    }
    
    res.status(201).json({
      message: `${createdOrders.length} lab order(s) created successfully`,
      orders: newOrders,
      orderCount: createdOrders.length
    });
  } catch (error) {
    console.error('Error creating lab order:', error);
    res.status(500).json({ error: 'Failed to create lab order' });
  }
});

// GET pharmacy orders for a prescription
router.get('/:id/pharmacy-orders', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if prescription exists
    const prescription = await getRow('SELECT id FROM prescriptions WHERE id = ? OR prescriptionId = ?', [id, id]);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    const orders = await getAll(`
      SELECT po.*, 
             pat.firstName as patientFirstName,
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             d.name as doctorName
      FROM pharmacy_orders po
      JOIN patients pat ON po.patientId = pat.id
      JOIN doctors d ON po.doctorId = d.id
      WHERE po.prescriptionId = ?
      ORDER BY po.orderDate DESC
    `, [prescription.id]);
    
    // Get items for each order
    for (const order of orders) {
      order.items = await getAll(`
        SELECT poi.*, pi.name as itemName, pi.sku
        FROM pharmacy_order_items poi
        LEFT JOIN pharmacy_items pi ON poi.itemId = pi.item_id
        WHERE poi.orderId = ?
      `, [order.id]);
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching pharmacy orders:', error);
    res.status(500).json({ error: 'Failed to fetch pharmacy orders' });
  }
});

// GET lab orders for a prescription
router.get('/:id/lab-orders', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if prescription exists
    const prescription = await getRow('SELECT id FROM prescriptions WHERE id = ? OR prescriptionId = ?', [id, id]);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    const orders = await getAll(`
      SELECT lo.*, 
             pat.firstName as patientFirstName,
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             d.name as doctorName
      FROM lab_orders lo
      JOIN patients pat ON lo.patientId = pat.id
      JOIN doctors d ON lo.doctorId = d.id
      WHERE lo.prescriptionId = ?
      ORDER BY lo.orderDate DESC
    `, [prescription.id]);
    
    // Get items for each order
    for (const order of orders) {
      order.items = await getAll(`
        SELECT loi.*, lt.testName, lt.testCode
        FROM lab_order_items loi
        LEFT JOIN lab_tests lt ON loi.testId = lt.id
        WHERE loi.orderId = ?
      `, [order.id]);
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching lab orders:', error);
    res.status(500).json({ error: 'Failed to fetch lab orders' });
  }
});

// GET prescription with all related orders
router.get('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get prescription details
    const prescription = await getRow(`
      SELECT p.*, 
             pat.firstName as patientFirstName, 
             pat.middleName as patientMiddleName,
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.age as patientAge,
             pat.gender as patientGender,
             pat.bloodGroup as patientBloodGroup,
             pat.phone as patientPhone,
             pat.address as patientAddress,
             pat.vitalSigns as patientVitalSigns,
             d.name as doctorName,
             d.specialization as doctorSpecialization,
             d.license as doctorLicense
      FROM prescriptions p
      JOIN patients pat ON p.patientId = pat.id
      JOIN doctors d ON p.doctorId = d.id
      WHERE p.id = ? OR p.prescriptionId = ?
    `, [id, id]);
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Parse JSON fields
    try {
      if (prescription.medications) {
        prescription.medications = JSON.parse(prescription.medications);
      }
      if (prescription.patientVitalSigns) {
        prescription.patientVitalSigns = JSON.parse(prescription.patientVitalSigns);
      }
    } catch (e) {
      console.warn('Error parsing JSON fields:', e);
    }
    
    // Get pharmacy orders
    const pharmacyOrders = await getAll(`
      SELECT po.*, 
             pat.firstName as patientFirstName,
             pat.lastName as patientLastName,
             d.name as doctorName
      FROM pharmacy_orders po
      JOIN patients pat ON po.patientId = pat.id
      JOIN doctors d ON po.doctorId = d.id
      WHERE po.prescriptionId = ?
      ORDER BY po.orderDate DESC
    `, [prescription.id]);
    
    // Get lab orders
    const labOrders = await getAll(`
      SELECT lo.*, 
             pat.firstName as patientFirstName,
             pat.lastName as patientLastName,
             d.name as doctorName
      FROM lab_orders lo
      JOIN patients pat ON lo.patientId = pat.id
      JOIN doctors d ON lo.doctorId = d.id
      WHERE lo.prescriptionId = ?
      ORDER BY lo.orderDate DESC
    `, [prescription.id]);
    
    // Get items for each pharmacy order
    for (const order of pharmacyOrders) {
      order.items = await getAll(`
        SELECT poi.*, pi.name as itemName, pi.sku
        FROM pharmacy_order_items poi
        LEFT JOIN pharmacy_items pi ON poi.itemId = pi.item_id
        WHERE poi.orderId = ?
      `, [order.id]);
    }
    
    // Get items for each lab order
    for (const order of labOrders) {
      order.items = await getAll(`
        SELECT loi.*, lt.testName, lt.testCode
        FROM lab_order_items loi
        LEFT JOIN lab_tests lt ON loi.testId = lt.id
        WHERE loi.orderId = ?
      `, [order.id]);
    }
    
    res.json({
      prescription,
      pharmacyOrders,
      labOrders
    });
  } catch (error) {
    console.error('Error fetching complete prescription:', error);
    res.status(500).json({ error: 'Failed to fetch complete prescription' });
  }
});

module.exports = router;
