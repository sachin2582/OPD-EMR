const express = require('express');
const router = express.Router();
const { getRow } = require('../database/database');

// Get clinic setup information (READ ONLY - no create/update/delete functionality)
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

module.exports = router;
