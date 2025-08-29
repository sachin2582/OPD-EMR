const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { runQuery, getRow, getAll } = require('../database/database');

const router = express.Router();

// Middleware to verify admin access
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // For demo purposes, allow admin access with simple token check
  // In production, implement proper JWT verification
  if (token === 'admin-token' || token.includes('admin')) {
    req.user = { userType: 'admin' };
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
};

// ==================== USER MANAGEMENT ====================

// GET all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await getAll('SELECT * FROM users ORDER BY createdAt DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new user
router.post('/users', authenticateAdmin, async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role, department, permissions } = req.body;
    
    if (!username || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `USER${Date.now()}`;
    
    const result = await runQuery(
      'INSERT INTO users (userId, username, password, fullName, email, phone, role, department, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, username, hashedPassword, fullName, email, phone, role, department, permissions]
    );

    res.status(201).json({ 
      message: 'User created successfully',
      userId: userId,
      id: result.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update user
router.put('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role, department, permissions, isActive } = req.body;
    
    const result = await runQuery(
      'UPDATE users SET fullName = ?, email = ?, phone = ?, role = ?, department = ?, permissions = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [fullName, email, phone, role, department, permissions, isActive, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update user password
router.put('/users/:id/password', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await runQuery(
      'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE user
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await runQuery('DELETE FROM users WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DOCTOR MANAGEMENT ====================

// GET all doctors
router.get('/doctors', authenticateAdmin, async (req, res) => {
  try {
    const doctors = await getAll('SELECT * FROM doctors ORDER BY createdAt DESC');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new doctor
router.post('/doctors', authenticateAdmin, async (req, res) => {
  try {
    const { name, specialization, license, phone, email, department } = req.body;
    
    if (!name || !specialization || !license) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doctorId = `DOC${Date.now()}`;
    
    const result = await runQuery(
      'INSERT INTO doctors (doctorId, name, specialization, license, phone, email, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [doctorId, name, specialization, license, phone, email, department]
    );

    res.status(201).json({ 
      message: 'Doctor created successfully',
      doctorId: doctorId,
      id: result.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update doctor
router.put('/doctors/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, license, phone, email, department, isActive } = req.body;
    
    const result = await runQuery(
      'UPDATE doctors SET name = ?, specialization = ?, license = ?, phone = ?, email = ?, department = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, specialization, license, phone, email, department, isActive, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE doctor
router.delete('/doctors/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await runQuery('DELETE FROM doctors WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SERVICE MANAGEMENT ====================

// GET all services
router.get('/services', authenticateAdmin, async (req, res) => {
  try {
    const services = await getAll('SELECT * FROM services ORDER BY category, serviceName');
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new service
router.post('/services', authenticateAdmin, async (req, res) => {
  try {
    const { serviceName, serviceType, description, price, category } = req.body;
    
    if (!serviceName || !serviceType || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const serviceId = `SVC${Date.now()}`;
    
    const result = await runQuery(
      'INSERT INTO services (serviceId, serviceName, serviceType, description, price, category) VALUES (?, ?, ?, ?, ?, ?)',
      [serviceId, serviceName, serviceType, description, price, category]
    );

    res.status(201).json({ 
      message: 'Service created successfully',
      serviceId: serviceId,
      id: result.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update service
router.put('/services/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceName, serviceType, description, price, category, isActive } = req.body;
    
    const result = await runQuery(
      'UPDATE services SET serviceName = ?, serviceType = ?, description = ?, price = ?, category = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [serviceName, serviceType, description, price, category, isActive, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE service
router.delete('/services/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await runQuery('DELETE FROM services WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BILL SERIES MANAGEMENT ====================

// GET all bill series
router.get('/bill-series', authenticateAdmin, async (req, res) => {
  try {
    const billSeries = await getAll('SELECT * FROM bill_series ORDER BY createdAt DESC');
    res.json(billSeries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new bill series
router.post('/bill-series', authenticateAdmin, async (req, res) => {
  try {
    const { seriesName, prefix, suffix, startNumber, format, description } = req.body;
    
    if (!seriesName || !startNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const seriesId = `BS${Date.now()}`;
    
    const result = await runQuery(
      'INSERT INTO bill_series (seriesId, seriesName, prefix, suffix, startNumber, currentNumber, format, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [seriesId, seriesName, prefix, suffix, startNumber, startNumber, format, description]
    );

    res.status(201).json({ 
      message: 'Bill series created successfully',
      seriesId: seriesId,
      id: result.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update bill series
router.put('/bill-series/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { seriesName, prefix, suffix, format, description, isActive } = req.body;
    
    const result = await runQuery(
      'UPDATE bill_series SET seriesName = ?, prefix = ?, suffix = ?, format = ?, description = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [seriesName, prefix, suffix, format, description, isActive, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Bill series not found' });
    }

    res.json({ message: 'Bill series updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE bill series
router.delete('/bill-series/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await runQuery('DELETE FROM bill_series WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Bill series not found' });
    }

    res.json({ message: 'Bill series deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SPECIALIZATION MANAGEMENT ====================

// GET all specializations
router.get('/specializations', authenticateAdmin, async (req, res) => {
  try {
    const specializations = await getAll('SELECT * FROM specializations ORDER BY specializationName ASC');
    res.json(specializations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new specialization
router.post('/specializations', authenticateAdmin, async (req, res) => {
  try {
    const { specializationName, description, category } = req.body;
    
    if (!specializationName) {
      return res.status(400).json({ error: 'Specialization name is required' });
    }

    const specializationId = `SP${Date.now()}`;
    
    const result = await runQuery(
      'INSERT INTO specializations (specializationId, specializationName, description, category) VALUES (?, ?, ?, ?)',
      [specializationId, specializationName, description, category]
    );

    res.status(201).json({ 
      message: 'Specialization created successfully',
      specializationId: specializationId,
      id: result.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update specialization
router.put('/specializations/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { specializationName, description, category, isActive } = req.body;
    
    const result = await runQuery(
      'UPDATE specializations SET specializationName = ?, description = ?, category = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [specializationName, description, category, isActive, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Specialization not found' });
    }

    res.json({ message: 'Specialization updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE specialization
router.delete('/specializations/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await runQuery('DELETE FROM specializations WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Specialization not found' });
    }

    res.json({ message: 'Specialization deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RIGHTS MANAGEMENT ====================

// GET all system pages
router.get('/pages', authenticateAdmin, async (req, res) => {
  try {
    const pages = await getAll('SELECT * FROM system_pages ORDER BY category, pageTitle');
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET user rights for a specific user
router.get('/users/:userId/rights', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const rights = await getAll(`
      SELECT 
        ur.*,
        sp.pageTitle,
        sp.pageDescription,
        sp.category
      FROM user_rights ur
      JOIN system_pages sp ON ur.pageName = sp.pageName
      WHERE ur.userId = ?
      ORDER BY sp.category, sp.pageTitle
    `, [userId]);
    
    res.json(rights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update user rights
router.put('/users/:userId/rights', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { rights } = req.body;
    
    if (!Array.isArray(rights)) {
      return res.status(400).json({ error: 'Rights must be an array' });
    }

    // Update each right
    for (const right of rights) {
      await runQuery(`
        INSERT OR REPLACE INTO user_rights 
        (userId, pageName, canView, canCreate, canEdit, canDelete, canExport, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        userId,
        right.pageName,
        right.canView ? 1 : 0,
        right.canCreate ? 1 : 0,
        right.canEdit ? 1 : 0,
        right.canDelete ? 1 : 0,
        right.canExport ? 1 : 0
      ]);
    }

    res.json({ message: 'User rights updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create default rights for a new user
router.post('/users/:userId/rights/default', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Get all system pages
    const pages = await getAll('SELECT pageName FROM system_pages');
    
    // Define default rights based on role
    const defaultRights = {
      'admin': { canView: 1, canCreate: 1, canEdit: 1, canDelete: 1, canExport: 1 },
      'doctor': { canView: 1, canCreate: 1, canEdit: 1, canDelete: 0, canExport: 1 },
      'nurse': { canView: 1, canCreate: 1, canEdit: 1, canDelete: 0, canExport: 0 },
      'reception': { canView: 1, canCreate: 1, canEdit: 0, canDelete: 0, canExport: 0 },
      'billing': { canView: 1, canCreate: 1, canEdit: 1, canDelete: 0, canExport: 1 }
    };
    
    const roleRights = defaultRights[role] || defaultRights['reception'];
    
    // Create rights for each page
    for (const page of pages) {
      await runQuery(`
        INSERT OR IGNORE INTO user_rights 
        (userId, pageName, canView, canCreate, canEdit, canDelete, canExport)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        page.pageName,
        roleRights.canView,
        roleRights.canCreate,
        roleRights.canEdit,
        roleRights.canDelete,
        roleRights.canExport
      ]);
    }

    res.json({ message: 'Default rights created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SYSTEM STATISTICS ====================

// GET system overview statistics
router.get('/overview', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalPatients,
      activeDoctors,
      activeUsers,
      activeServices,
      todayAppointments,
      pendingBills,
      activeSpecializations
    ] = await Promise.all([
      getRow('SELECT COUNT(*) as count FROM patients'),
      getRow('SELECT COUNT(*) as count FROM doctors WHERE isActive = 1'),
      getRow('SELECT COUNT(*) as count FROM users WHERE isActive = 1'),
      getRow('SELECT COUNT(*) as count FROM services WHERE isActive = 1'),
      getRow('SELECT COUNT(*) as count FROM appointments WHERE DATE(appointmentDate) = DATE("now")'),
      getRow('SELECT COUNT(*) as count FROM billing WHERE paymentStatus = "pending"'),
      getRow('SELECT COUNT(*) as count FROM specializations WHERE isActive = 1')
    ]);

    res.json({
      totalPatients: totalPatients.count,
      activeDoctors: activeDoctors.count,
      activeUsers: activeUsers.count,
      activeServices: activeServices.count,
      todayAppointments: todayAppointments.count,
      pendingBills: pendingBills.count,
      activeSpecializations: activeSpecializations.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
