const express = require('express');
const router = express.Router();
const { runQuery, getRow, getAll } = require('../database/database');
const crypto = require('crypto');

// Generate a simple token (in production, use JWT)
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    // Check if token exists and is valid
    const session = await getRow(
      'SELECT * FROM doctor_sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP',
      [token]
    );
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Get doctor info
    const doctor = await getRow(
      'SELECT * FROM doctors_auth WHERE doctor_id = ? AND is_active = 1',
      [session.doctor_id]
    );
    
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Doctor not found or inactive'
      });
    }
    
    req.doctor = doctor;
    req.session = session;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// POST /api/auth/login - Doctor login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Find doctor by username
    const doctor = await getRow(
      'SELECT * FROM doctors_auth WHERE username = ? AND is_active = 1',
      [username]
    );
    
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Check password (simple comparison for now)
    if (doctor.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Generate token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Save session
    await runQuery(
      'INSERT INTO doctor_sessions (doctor_id, token, expires_at) VALUES (?, ?, ?)',
      [doctor.doctor_id, token, expiresAt]
    );
    
    // Clean up expired sessions
    await runQuery(
      'DELETE FROM doctor_sessions WHERE expires_at < CURRENT_TIMESTAMP',
      []
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        doctor: {
          doctor_id: doctor.doctor_id,
          name: doctor.name,
          username: doctor.username,
          specialization: doctor.specialization,
          role: doctor.role
        },
        expires_at: expiresAt
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// POST /api/auth/logout - Doctor logout
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Remove session
    await runQuery(
      'DELETE FROM doctor_sessions WHERE token = ?',
      [token]
    );
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// GET /api/auth/me - Get current doctor info
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        doctor_id: req.doctor.doctor_id,
        name: req.doctor.name,
        username: req.doctor.username,
        specialization: req.doctor.specialization,
        role: req.doctor.role
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

// POST /api/auth/register - Register new doctor (admin only)
router.post('/register', verifyToken, async (req, res) => {
  try {
    // Check if current user is admin
    if (req.doctor.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can register new doctors'
      });
    }
    
    const { name, username, password, specialization } = req.body;
    
    if (!name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, username, and password are required'
      });
    }
    
    // Check if username already exists
    const existingDoctor = await getRow(
      'SELECT id FROM doctors_auth WHERE username = ?',
      [username]
    );
    
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    // Generate doctor ID
    const doctorId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    // Insert new doctor
    await runQuery(
      'INSERT INTO doctors_auth (doctor_id, name, username, password, specialization, is_active, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [doctorId, name, username, password, specialization || null, 1, 'doctor']
    );
    
    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      data: {
        doctor_id: doctorId,
        name,
        username,
        specialization
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// GET /api/auth/doctors - Get all doctors (admin only)
router.get('/doctors', verifyToken, async (req, res) => {
  try {
    // Check if current user is admin
    if (req.doctor.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view all doctors'
      });
    }
    
    const doctors = await getAll(
      'SELECT doctor_id, name, username, specialization, is_active, role, created_at FROM doctors_auth ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: doctors
    });
    
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors'
    });
  }
});

// PUT /api/auth/doctors/:id - Update doctor (admin only)
router.put('/doctors/:id', verifyToken, async (req, res) => {
  try {
    // Check if current user is admin
    if (req.doctor.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update doctors'
      });
    }
    
    const { id } = req.params;
    const { name, username, specialization, is_active } = req.body;
    
    // Check if doctor exists
    const existingDoctor = await getRow(
      'SELECT * FROM doctors_auth WHERE doctor_id = ?',
      [id]
    );
    
    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Check if username is being changed and if it already exists
    if (username && username !== existingDoctor.username) {
      const usernameExists = await getRow(
        'SELECT id FROM doctors_auth WHERE username = ? AND doctor_id != ?',
        [username, id]
      );
      
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }
    
    // Update doctor
    const updateFields = [];
    const values = [];
    
    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (username) {
      updateFields.push('username = ?');
      values.push(username);
    }
    if (specialization !== undefined) {
      updateFields.push('specialization = ?');
      values.push(specialization);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await runQuery(
      `UPDATE doctors_auth SET ${updateFields.join(', ')} WHERE doctor_id = ?`,
      values
    );
    
    res.json({
      success: true,
      message: 'Doctor updated successfully'
    });
    
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor'
    });
  }
});

// DELETE /api/auth/doctors/:id - Delete doctor (admin only)
router.delete('/doctors/:id', verifyToken, async (req, res) => {
  try {
    // Check if current user is admin
    if (req.doctor.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete doctors'
      });
    }
    
    const { id } = req.params;
    
    // Check if doctor exists
    const existingDoctor = await getRow(
      'SELECT * FROM doctors_auth WHERE doctor_id = ?',
      [id]
    );
    
    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Soft delete by setting is_active to 0
    await runQuery(
      'UPDATE doctors_auth SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE doctor_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Doctor deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor'
    });
  }
});

module.exports = router;
module.exports.verifyToken = verifyToken;