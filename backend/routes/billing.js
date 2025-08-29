const express = require('express');
const { runQuery, getRow, getAll } = require('../database/database');

const router = express.Router();

// Generate unique bill ID
function generateBillId() {
  return `BILL-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
}

// GET all bills with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      patientId, 
      status = '', 
      date = '',
      search = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT b.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.phone as patientPhone,
             p.prescriptionId as prescriptionUniqueId
      FROM billing b
      JOIN patients pat ON b.patientId = pat.id
      LEFT JOIN prescriptions p ON b.prescriptionId = p.id
      WHERE 1=1
    `;
    let params = [];
    
    if (patientId) {
      sql += ` AND b.patientId = ?`;
      params.push(patientId);
    }
    
    if (status) {
      sql += ` AND b.paymentStatus = ?`;
      params.push(status);
    }
    
    if (date) {
      sql += ` AND DATE(b.billDate) = DATE(?)`;
      params.push(date);
    }
    
    if (search) {
      sql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR b.billId LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sql += ` ORDER BY b.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const bills = await getAll(sql, params);
    
    // Parse JSON fields
    bills.forEach(bill => {
      try {
        if (bill.services) {
          bill.services = JSON.parse(bill.services);
        }
      } catch (e) {
        console.warn('Error parsing services JSON:', e);
      }
    });
    
    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM billing b
      JOIN patients pat ON b.patientId = pat.id
      WHERE 1=1
    `;
    let countParams = [];
    
    if (patientId) {
      countSql += ` AND b.patientId = ?`;
      countParams.push(patientId);
    }
    
    if (status) {
      countSql += ` AND b.paymentStatus = ?`;
      countParams.push(status);
    }
    
    if (date) {
      countSql += ` AND DATE(b.billDate) = DATE(?)`;
      countParams.push(date);
    }
    
    if (search) {
      countSql += ` AND (pat.firstName LIKE ? OR pat.lastName LIKE ? OR b.billId LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;
    
    res.json({
      bills,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// GET bill by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const bill = await getRow(`
      SELECT b.*, 
             pat.firstName as patientFirstName, 
             pat.middleName as patientMiddleName,
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId,
             pat.age as patientAge,
             pat.gender as patientGender,
             pat.phone as patientPhone,
             pat.address as patientAddress,
             p.prescriptionId as prescriptionUniqueId,
             p.diagnosis as prescriptionDiagnosis
      FROM billing b
      JOIN patients pat ON b.patientId = pat.id
      LEFT JOIN prescriptions p ON b.prescriptionId = p.id
      WHERE b.id = ? OR b.billId = ?
    `, [id, id]);
    
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    // Parse JSON fields
    try {
      if (bill.services) {
        bill.services = JSON.parse(bill.services);
      }
    } catch (e) {
      console.warn('Error parsing services JSON:', e);
    }
    
    res.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

// POST create new bill
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      prescriptionId,
      billDate,
      services,
      subtotal,
      discount = 0,
      tax = 0,
      total,
      notes
    } = req.body;
    
    // Validation
    if (!patientId || !billDate || !services || !subtotal || !total) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientId, billDate, services, subtotal, total' 
      });
    }
    
    // Check if patient exists
    const patient = await getRow('SELECT id FROM patients WHERE id = ? OR patientId = ?', [patientId, patientId]);
    if (!patient) {
      return res.status(400).json({ error: 'Patient not found' });
    }
    
    // Check if prescription exists (if provided)
    if (prescriptionId) {
      const prescription = await getRow('SELECT id FROM prescriptions WHERE id = ? OR prescriptionId = ?', [prescriptionId, prescriptionId]);
      if (!prescription) {
        return res.status(400).json({ error: 'Prescription not found' });
      }
    }
    
    // Validate calculations
    const calculatedTotal = subtotal - discount + tax;
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return res.status(400).json({ 
        error: 'Total calculation mismatch. Expected: ' + calculatedTotal + ', Received: ' + total 
      });
    }
    
    const billId = generateBillId();
    const servicesJson = JSON.stringify(services);
    
    const result = await runQuery(`
      INSERT INTO billing (
        billId, patientId, prescriptionId, billDate, services, subtotal,
        discount, tax, total, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      billId, patient.id, prescriptionId || null, billDate, servicesJson, subtotal,
      discount, tax, total, notes
    ]);
    
    // Get the created bill
    const newBill = await getRow(`
      SELECT b.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId
      FROM billing b
      JOIN patients pat ON b.patientId = pat.id
      WHERE b.id = ?
    `, [result.id]);
    
    res.status(201).json({
      message: 'Bill created successfully',
      bill: newBill
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// PUT update bill
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if bill exists
    const existingBill = await getRow('SELECT id FROM billing WHERE id = ? OR billId = ?', [id, id]);
    if (!existingBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    // Check if bill is already paid
    const currentBill = await getRow('SELECT paymentStatus FROM billing WHERE id = ?', [existingBill.id]);
    if (currentBill.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Cannot modify paid bills' });
    }
    
    // Prepare update fields
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'billId' && key !== 'createdAt') {
        if (key === 'services' && updateData[key]) {
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
    
    // Recalculate total if financial fields are updated
    if (updateData.subtotal !== undefined || updateData.discount !== undefined || updateData.tax !== undefined) {
      const currentBillData = await getRow('SELECT subtotal, discount, tax FROM billing WHERE id = ?', [existingBill.id]);
      const newSubtotal = updateData.subtotal !== undefined ? updateData.subtotal : currentBillData.subtotal;
      const newDiscount = updateData.discount !== undefined ? updateData.discount : currentBillData.discount;
      const newTax = updateData.tax !== undefined ? updateData.tax : currentBillData.tax;
      const newTotal = newSubtotal - newDiscount + newTax;
      
      fields.push('total = ?');
      values.push(newTotal);
    }
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(existingBill.id);
    
    const sql = `UPDATE billing SET ${fields.join(', ')} WHERE id = ?`;
    await runQuery(sql, values);
    
    // Get updated bill
    const updatedBill = await getRow(`
      SELECT b.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId
      FROM billing b
      JOIN patients pat ON b.patientId = pat.id
      WHERE b.id = ?
    `, [existingBill.id]);
    
    res.json({
      message: 'Bill updated successfully',
      bill: updatedBill
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ error: 'Failed to update bill' });
  }
});

// PUT update payment status
router.put('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, notes } = req.body;
    
    // Check if bill exists
    const existingBill = await getRow('SELECT id FROM billing WHERE id = ? OR billId = ?', [id, id]);
    if (!existingBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    // Validate payment status
    const validStatuses = ['pending', 'partial', 'paid', 'cancelled'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    
    // Update payment information
    await runQuery(`
      UPDATE billing 
      SET paymentStatus = ?, paymentMethod = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [paymentStatus, paymentMethod, notes, existingBill.id]);
    
    // Get updated bill
    const updatedBill = await getRow(`
      SELECT b.*, 
             pat.firstName as patientFirstName, 
             pat.lastName as patientLastName,
             pat.patientId as patientUniqueId
      FROM billing b
      JOIN patients pat ON b.patientId = pat.id
      WHERE b.id = ?
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

// DELETE bill (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if bill exists
    const existingBill = await getRow('SELECT id, paymentStatus FROM billing WHERE id = ? OR billId = ?', [id, id]);
    if (!existingBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    // Check if bill is already paid
    if (existingBill.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Cannot delete paid bills' });
    }
    
    // Soft delete by updating status
    await runQuery(
      'UPDATE billing SET paymentStatus = "cancelled", updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [existingBill.id]
    );
    
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ error: 'Failed to delete bill' });
  }
});

// GET bills by patient ID
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const bills = await getAll(`
      SELECT b.*, 
             p.prescriptionId as prescriptionUniqueId,
             p.diagnosis as prescriptionDiagnosis
      FROM billing b
      LEFT JOIN prescriptions p ON b.prescriptionId = p.id
      WHERE b.patientId = ? OR b.patientId = (SELECT id FROM patients WHERE patientId = ?)
      ORDER BY b.billDate DESC
    `, [patientId, patientId]);
    
    // Parse JSON fields
    bills.forEach(bill => {
      try {
        if (bill.services) {
          bill.services = JSON.parse(bill.services);
        }
      } catch (e) {
        console.warn('Error parsing services JSON:', e);
      }
    });
    
    res.json(bills);
  } catch (error) {
    console.error('Error fetching patient bills:', error);
    res.status(500).json({ error: 'Failed to fetch patient bills' });
  }
});

// GET billing statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBills = await getRow('SELECT COUNT(*) as count FROM billing');
    const pendingBills = await getRow('SELECT COUNT(*) as count FROM billing WHERE paymentStatus = "pending"');
    const paidBills = await getRow('SELECT COUNT(*) as count FROM billing WHERE paymentStatus = "paid"');
    const billsToday = await getRow(
      'SELECT COUNT(*) as count FROM billing WHERE DATE(billDate) = DATE("now")'
    );
    const totalRevenue = await getRow('SELECT SUM(total) as total FROM billing WHERE paymentStatus = "paid"');
    const pendingAmount = await getRow('SELECT SUM(total) as total FROM billing WHERE paymentStatus = "pending"');
    
    res.json({
      total: totalBills.count,
      pending: pendingBills.count,
      paid: paidBills.count,
      today: billsToday.count,
      totalRevenue: totalRevenue.total || 0,
      pendingAmount: pendingAmount.total || 0
    });
  } catch (error) {
    console.error('Error fetching billing statistics:', error);
    res.status(500).json({ error: 'Failed to fetch billing statistics' });
  }
});

// GET revenue report
router.get('/stats/revenue', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = 'AND DATE(billDate) >= DATE("now", "-7 days")';
    } else if (period === 'month') {
      dateFilter = 'AND DATE(billDate) >= DATE("now", "-30 days")';
    } else if (period === 'year') {
      dateFilter = 'AND DATE(billDate) >= DATE("now", "-365 days")';
    }
    
    const revenue = await getRow(`
      SELECT 
        SUM(total) as totalRevenue,
        SUM(subtotal) as totalSubtotal,
        SUM(discount) as totalDiscount,
        SUM(tax) as totalTax,
        COUNT(*) as totalBills
      FROM billing 
      WHERE paymentStatus = "paid" ${dateFilter}
    `);
    
    const dailyRevenue = await getAll(`
      SELECT 
        DATE(billDate) as date,
        SUM(total) as revenue,
        COUNT(*) as bills
      FROM billing 
      WHERE paymentStatus = "paid" ${dateFilter}
      GROUP BY DATE(billDate)
      ORDER BY date DESC
      LIMIT 30
    `);
    
    res.json({
      summary: revenue,
      dailyRevenue
    });
  } catch (error) {
    console.error('Error fetching revenue report:', error);
    res.status(500).json({ error: 'Failed to fetch revenue report' });
  }
});

module.exports = router;
