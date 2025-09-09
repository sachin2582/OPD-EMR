const express = require('express');
const router = express.Router();
const { runQuery, getRow, getAll } = require('../database/database');

// Create a new bill
router.post('/', async (req, res) => {
  try {
    const {
      billNumber,
      billDate,
      patientId,
      patientData,
      selectedServices,
      subtotal,
      discount,
      discountAmount,
      total,
      paymentMethod,
      notes,
      doctorId
    } = req.body;

    // Validate required fields
    if (!billNumber || !patientId || !selectedServices || !total) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: billNumber, patientId, selectedServices, total'
      });
    }

    // Insert bill record with billing_status = 'PAID' and doctor assignment
    const billResult = await runQuery(`
      INSERT INTO bills (
        billNumber, billDate, patientId, patientName, patientPhone, patientAddress,
        subtotal, discount, discountAmount, total, paymentMethod, notes, status, billing_status, doctor_id, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      billNumber,
      billDate,
      patientId,
      `${patientData.firstName}${patientData.middleName ? ` ${patientData.middleName}` : ''} ${patientData.lastName}`.trim(),
      patientData.phone || '',
      patientData.address || '',
      subtotal,
      discount || 0,
      discountAmount || 0,
      total,
      paymentMethod || 'CASH',
      notes || '',
      'PAID',
      'PAID',  // billing_status = 'PAID' when bill is saved
      doctorId || null  // Assign doctor if provided
    ]);

    const billId = billResult.id;

    // Assign patient to doctor if doctorId is provided
    if (doctorId) {
      await runQuery(
        'UPDATE patients SET assigned_doctor_id = ? WHERE id = ?',
        [doctorId, patientId]
      );
      console.log(`✅ Patient ${patientId} assigned to doctor ${doctorId}`);
    }

    // Insert bill items
    for (const service of selectedServices) {
      // Determine service_type based on category
      let serviceType = 'I'; // Default to 'I' for lab tests
      if (service.category === 'Consultation') {
        serviceType = 'CL';
      } else if (service.category === 'Laboratory') {
        serviceType = 'I';
      }
      
      await runQuery(`
        INSERT INTO bill_items (
          billId, serviceName, serviceType, service_type, quantity, unitPrice, totalPrice, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        billId,
        service.name,
        service.category || 'GENERAL',
        serviceType,
        service.quantity,
        service.price,
        service.total
      ]);
    }

    res.json({
      success: true,
      message: 'Bill saved successfully',
      data: {
        billId,
        billNumber,
        total
      }
    });

  } catch (error) {
    console.error('Error saving bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving bill',
      error: error.message
    });
  }
});

// Get all bills with optional date filtering
router.get('/', async (req, res) => {
  try {
    const { date, status, patientId } = req.query;
    
    let whereClause = '';
    let params = [];
    
    // Build WHERE clause based on query parameters
    const conditions = [];
    
    if (date) {
      conditions.push("DATE(b.billDate) = ?");
      params.push(date);
    }
    
    if (status) {
      conditions.push("b.status = ?");
      params.push(status);
    }
    
    if (patientId) {
      conditions.push("b.patientId = ?");
      params.push(patientId);
    }
    
    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }
    
    const bills = await getAll(`
      SELECT b.*, 
             GROUP_CONCAT(bi.serviceName || ' (x' || bi.quantity || ')') as services,
             COUNT(bi.id) as itemCount
      FROM bills b
      LEFT JOIN bill_items bi ON b.id = bi.billId
      ${whereClause}
      GROUP BY b.id
      ORDER BY b.createdAt DESC
    `, params);

    res.json({
      success: true,
      data: bills,
      count: bills.length,
      filters: { date, status, patientId }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bills',
      error: error.message
    });
  }
});

// Get bill by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const bill = await getRow('SELECT * FROM bills WHERE id = ?', [id]);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    const billItems = await getAll('SELECT * FROM bill_items WHERE billId = ?', [id]);

    res.json({
      success: true,
      data: {
        ...bill,
        items: billItems
      }
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bill',
      error: error.message
    });
  }
});

// Update bill status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const result = await runQuery(
      'UPDATE bills SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      message: 'Bill status updated successfully'
    });
  } catch (error) {
    console.error('Error updating bill status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bill status',
      error: error.message
    });
  }
});

module.exports = router;
