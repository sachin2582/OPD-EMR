const express = require('express');
const { runQuery, getAll, getRow } = require('../database/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = 'your-secret-key-change-in-production';

// Helper function to generate JWT token
const generateToken = (userId, username, role) => {
  return jwt.sign(
    { userId, username, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Helper function to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// POST /api/users/login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const user = await getRow(`
      SELECT id, username, password, role, isActive, fullName, email
      FROM users 
      WHERE username = ? AND isActive = 1
    `, [username]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.username, user.role);

    // Store session in database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await runQuery(`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `, [user.id, token, expiresAt.toISOString()]);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.fullName,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/logout - User logout
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Remove session from database
    await runQuery(`
      DELETE FROM user_sessions WHERE token = ?
    `, [token]);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/me - Get current user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await getRow(`
      SELECT id, username, role, isActive, fullName, email, phone, department
      FROM users 
      WHERE id = ?
    `, [req.user.userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users - Get all users (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const users = await getAll(`
      SELECT id, username, role, isActive, fullName, email, phone, department, createdAt
      FROM users 
      ORDER BY createdAt DESC
    `);

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users - Create new user (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { username, password, role, fullName, email, phone, department, type } = req.body;

    if (!username || !password || !role || !fullName) {
      return res.status(400).json({ error: 'Username, password, role, and fullName are required' });
    }

    // Determine type based on role if not provided
    let userType = type;
    if (!userType) {
      userType = role === 'admin' ? 'A' : 'D';
    }

    // Check if username already exists
    const existingUser = await getRow(`
      SELECT id FROM users WHERE username = ?
    `, [username]);

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await runQuery(`
      INSERT INTO users (username, password, role, fullName, email, phone, department, isActive, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [username, hashedPassword, role, fullName, email || null, phone || null, department || null, 1, userType]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: result.id }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;
    const { username, password, role, fullName, email, phone, department, isActive } = req.body;

    // Check if user exists
    const existingUser = await getRow(`
      SELECT id FROM users WHERE id = ?
    `, [id]);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash password if provided
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    // Update user
    await runQuery(`
      UPDATE users 
      SET username = ?, password = ?, role = ?, fullName = ?, email = ?, phone = ?, department = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [username, hashedPassword, role, fullName, email, phone, department, isActive, id]);

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;

    // Check if user exists
    const existingUser = await getRow(`
      SELECT id FROM users WHERE id = ?
    `, [id]);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete (set isActive to 0)
    await runQuery(`
      UPDATE users SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/doctors - Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await getAll(`
      SELECT d.doctor_id, d.name, d.specialization, d.is_active, d.created_at,
             u.id as user_id, u.username, u.email, u.phone
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.is_active = 1
      ORDER BY d.created_at DESC
    `);

    res.json({
      success: true,
      data: doctors
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/doctors - Create new doctor (admin only)
router.post('/doctors', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { username, password, name, specialization, email, phone } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password, and name are required' });
    }

    // Check if username already exists
    const existingUser = await getRow(`
      SELECT id FROM users WHERE username = ?
    `, [username]);

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user account for doctor
    const userResult = await runQuery(`
      INSERT INTO users (username, password, role, fullName, email, phone, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [username, hashedPassword, 'doctor', name, email || null, phone || null, 1]);

    const userId = userResult.id;

    // Create doctor profile
    const doctorResult = await runQuery(`
      INSERT INTO doctors (name, specialization, user_id, is_active)
      VALUES (?, ?, ?, ?)
    `, [name, specialization || null, userId, 1]);

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: { 
        doctor_id: doctorResult.id,
        user_id: userId
      }
    });

  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
