const express = require('express');
const router = express.Router();
const { runQuery, getRow, getAll } = require('../database/database');

// Get clinic setup information
router.get('/', async (req, res) => {
  try {
    const clinic = await getRow('SELECT * FROM clinic_setup WHERE isActive = 1 ORDER BY id DESC LIMIT 1');
    
    if (!clinic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Clinic setup not found' 
      });
    }

    res.json({
      success: true,
      data: clinic
    });
  } catch (error) {
    console.error('Error fetching clinic setup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching clinic setup',
      error: error.message 
    });
  }
});

// Create or update clinic setup
router.post('/', async (req, res) => {
  try {
    const {
      clinicName,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      website,
      license,
      registration,
      prescriptionValidity
    } = req.body;

    // Validate required fields
    if (!clinicName || !address || !city || !state || !pincode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: clinicName, address, city, state, pincode, phone'
      });
    }

    // Check if clinic setup already exists
    const existingClinic = await getRow('SELECT * FROM clinic_setup WHERE isActive = 1 ORDER BY id DESC LIMIT 1');

    if (existingClinic) {
      // Update existing clinic setup
      const result = await runQuery(`
        UPDATE clinic_setup 
        SET clinicName = ?, address = ?, city = ?, state = ?, pincode = ?, 
            phone = ?, email = ?, website = ?, license = ?, registration = ?, 
            prescriptionValidity = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        clinicName, address, city, state, pincode, phone, email, website, 
        license, registration, prescriptionValidity || 30, existingClinic.id
      ]);

      res.json({
        success: true,
        message: 'Clinic setup updated successfully',
        data: { id: existingClinic.id, changes: result.changes }
      });
    } else {
      // Create new clinic setup
      const result = await runQuery(`
        INSERT INTO clinic_setup (clinicName, address, city, state, pincode, phone, email, website, license, registration, prescriptionValidity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clinicName, address, city, state, pincode, phone, email, website, 
        license, registration, prescriptionValidity || 30
      ]);

      res.json({
        success: true,
        message: 'Clinic setup created successfully',
        data: { id: result.id, changes: result.changes }
      });
    }
  } catch (error) {
    console.error('Error saving clinic setup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving clinic setup',
      error: error.message 
    });
  }
});

// Update clinic setup by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clinicName,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      website,
      license,
      registration,
      prescriptionValidity
    } = req.body;

    // Validate required fields
    if (!clinicName || !address || !city || !state || !pincode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: clinicName, address, city, state, pincode, phone'
      });
    }

    const result = await runQuery(`
      UPDATE clinic_setup 
      SET clinicName = ?, address = ?, city = ?, state = ?, pincode = ?, 
          phone = ?, email = ?, website = ?, license = ?, registration = ?, 
          prescriptionValidity = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      clinicName, address, city, state, pincode, phone, email, website, 
      license, registration, prescriptionValidity || 30, id
    ]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clinic setup not found'
      });
    }

    res.json({
      success: true,
      message: 'Clinic setup updated successfully',
      data: { id, changes: result.changes }
    });
  } catch (error) {
    console.error('Error updating clinic setup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating clinic setup',
      error: error.message 
    });
  }
});

// Get all clinic setups (for admin purposes)
router.get('/all', async (req, res) => {
  try {
    const clinics = await getAll('SELECT * FROM clinic_setup ORDER BY createdAt DESC');
    
    res.json({
      success: true,
      data: clinics
    });
  } catch (error) {
    console.error('Error fetching all clinic setups:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching clinic setups',
      error: error.message 
    });
  }
});

// Delete clinic setup (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await runQuery(`
      UPDATE clinic_setup 
      SET isActive = 0, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clinic setup not found'
      });
    }

    res.json({
      success: true,
      message: 'Clinic setup deleted successfully',
      data: { id, changes: result.changes }
    });
  } catch (error) {
    console.error('Error deleting clinic setup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting clinic setup',
      error: error.message 
    });
  }
});

module.exports = router;
