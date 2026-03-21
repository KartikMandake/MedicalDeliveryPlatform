const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Mappings from frontend role names to DB ENUM roles
const roleMap = {
  patient: 'user',
  pharmacy: 'retailer',
  delivery: 'agent',
  admin: 'admin'
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const mappedRole = roleMap[role] || 'user';

    // Check if email already exists (phone is optional)
    let userCheck;
    if (phone) {
      userCheck = await db.query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
    } else {
      userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    }
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (name, email, phone, password_hash, role, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
      [name, email, phone || `AUTO-${Date.now()}`, password_hash, mappedRole, 'active']
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'User registered successfully', token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // Frontend sends "Email or Username"

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1 OR phone = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};
