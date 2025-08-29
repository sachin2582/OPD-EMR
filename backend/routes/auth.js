const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, getRow } = require('../database/database');

const router = express.Router();

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'opd-emr-secret-key-2024';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: username, password' 
      });
    }

    let user = null;
    let userData = null;

    // Check doctors table first
    user = await getRow(
      'SELECT * FROM doctors WHERE (email = ? OR license = ?) AND isActive = 1',
      [username, username]
    );
    if (user) {
      userData = {
        id: user.id,
        userId: user.doctorId,
        name: user.name,
        email: user.email,
        specialization: user.specialization,
        department: user.department,
        userType: 'doctor'
      };
    } else {
      // Check users table for all user types (admin, billing, reception, nurse, etc.)
      user = await getRow(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND isActive = 1',
        [username, username]
      );
      if (user) {
        userData = {
          id: user.id,
          userId: user.userId,
          name: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department,
          userType: user.role
        };
      }
    }

    if (!user || !userData) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password for all users (including admin)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userData.id, 
        userType: userData.userType,
        name: userData.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST register new doctor
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      specialization,
      license,
      phone,
      email,
      department,
      password
    } = req.body;

    // Validation
    if (!name || !specialization || !license || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, specialization, license, email, password' 
      });
    }

    // Check if email already exists
    const existingDoctor = await getRow('SELECT id FROM doctors WHERE email = ?', [email]);
    if (existingDoctor) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if license already exists
    const existingLicense = await getRow('SELECT id FROM doctors WHERE license = ?', [license]);
    if (existingLicense) {
      return res.status(400).json({ error: 'License number already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate doctor ID
    const doctorId = `DOC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Insert new doctor
    const result = await runQuery(`
      INSERT INTO doctors (doctorId, name, specialization, license, phone, email, department, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [doctorId, name, specialization, license, phone, email, department, hashedPassword]);

    // Get the created doctor (without password)
    const newDoctor = await getRow(`
      SELECT id, doctorId, name, specialization, license, phone, email, department, isActive, createdAt
      FROM doctors WHERE id = ?
    `, [result.id]);

    res.status(201).json({
      message: 'Doctor registered successfully',
      doctor: newDoctor
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Missing required fields: currentPassword, newPassword' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Get current user
    let user = null;
    if (req.user.userType === 'doctor') {
      user = await getRow('SELECT * FROM doctors WHERE id = ?', [userId]);
    } else if (req.user.userType === 'admin') {
      // Admin password change not supported in demo
      return res.status(400).json({ error: 'Admin password change not supported in demo mode' });
    } else {
      // Check users table for other user types
      user = await getRow('SELECT * FROM users WHERE id = ?', [userId]);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    if (req.user.userType === 'doctor') {
      await runQuery(
        'UPDATE doctors SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, userId]
      );
    } else {
      // Update password for users from users table
      await runQuery(
        'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, userId]
      );
    }

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// GET current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    let userProfile = null;

    if (req.user.userType === 'doctor') {
      userProfile = await getRow(`
        SELECT id, doctorId, name, specialization, license, phone, email, department, isActive, createdAt, updatedAt
        FROM doctors WHERE id = ?
      `, [userId]);
    } else if (req.user.userType === 'admin') {
      userProfile = {
        id: 1,
        userId: 'ADMIN001',
        name: 'System Administrator',
        email: 'admin@opd-emr.com',
        userType: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      // Get profile for users from users table
      userProfile = await getRow(`
        SELECT id, userId, fullName as name, email, phone, role as userType, department, isActive, createdAt, updatedAt
        FROM users WHERE id = ?
      `, [userId]);
    }

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      user: userProfile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    if (req.user.userType === 'doctor') {
      // Update doctor profile
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'doctorId' && key !== 'password' && key !== 'createdAt') {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      fields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(userId);

      const sql = `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`;
      await runQuery(sql, values);

      // Get updated profile
      const updatedProfile = await getRow(`
        SELECT id, doctorId, name, specialization, license, phone, email, department, isActive, createdAt, updatedAt
        FROM doctors WHERE id = ?
      `, [userId]);

      res.json({
        message: 'Profile updated successfully',
        user: updatedProfile
      });
    } else if (req.user.userType === 'admin') {
      res.status(400).json({ error: 'Admin profile updates not supported in demo mode' });
    } else {
      // Update user profile from users table
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'userId' && key !== 'password' && key !== 'createdAt' && key !== 'role') {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      fields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(userId);

      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await runQuery(sql, values);

      // Get updated profile
      const updatedProfile = await getRow(`
        SELECT id, userId, fullName as name, email, phone, role as userType, department, isActive, createdAt, updatedAt
        FROM users WHERE id = ?
      `, [userId]);

      res.json({
        message: 'Profile updated successfully',
        user: updatedProfile
      });
    }

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// POST logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, just return success - client should remove the token
  res.json({ message: 'Logout successful' });
});

// GET verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      userId: req.user.userId,
      userType: req.user.userType,
      name: req.user.name
    }
  });
});

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET system statistics (admin only)
router.get('/system-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get basic system statistics
    const patientCount = await getRow('SELECT COUNT(*) as count FROM patients');
    const doctorCount = await getRow('SELECT COUNT(*) as count FROM doctors WHERE isActive = 1');
    const prescriptionCount = await getRow('SELECT COUNT(*) as count FROM prescriptions');
    const billCount = await getRow('SELECT COUNT(*) as count FROM billing');
    const totalRevenue = await getRow('SELECT SUM(total) as total FROM billing WHERE paymentStatus = "paid"');

    res.json({
      patients: patientCount.count,
      doctors: doctorCount.count,
      prescriptions: prescriptionCount.count,
      bills: billCount.count,
      totalRevenue: totalRevenue.total || 0
    });

  } catch (error) {
    console.error('Error fetching system statistics:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

module.exports = router;
