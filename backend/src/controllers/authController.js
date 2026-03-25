const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sequelize = require('../db');
const { QueryTypes } = require('sequelize');
const axios = require('axios');
const crypto = require('crypto');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    console.log('--- REGISTER ATTEMPT ---', req.body);
    const { name, email, password, phone, role, shopName, drugLicense, gstin } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const validRoles = ['user', 'retailer', 'agent'];
    const userRole = validRoles.includes(role) ? role : 'user';

    const user = await User.create({ name, email, password, phone: phone || '', role: userRole });

    // If registering as retailer, create a retailers row
    if (userRole === 'retailer') {
      await sequelize.query(
        `INSERT INTO retailers (user_id, shop_name, drug_license, gstin, kyc_status)
         VALUES (:userId, :shopName, :drugLicense, :gstin, 'pending')`,
        {
          replacements: {
            userId: user.id,
            shopName: shopName || null,
            drugLicense: drugLicense || null,
            gstin: gstin || null,
          },
          type: QueryTypes.INSERT,
        }
      );
    }

    const token = signToken(user.id);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    console.log('--- LOGIN ATTEMPT ---', req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    console.log('Login successful for email:', email);
    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMe = async (req, res) => res.json(req.user);

exports.updateProfile = async (req, res) => {
  try {
    // Ensure address column exists (safe migration)
    await sequelize.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''`
    ).catch(() => {}); // ignore if already exists or unsupported

    const { name, phone, address } = req.body;
    await User.update(
      { name, phone, ...(address !== undefined ? { address } : {}) },
      { where: { id: req.user.id } }
    );
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.reverseGeocode = async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ message: 'Lat/Lon required' });
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
      headers: { 'User-Agent': 'MediFlow/1.0' },
      timeout: 5000
    });
    const { display_name, address } = response.data;
    res.json({
      address: display_name,
      city: address.city || address.town || address.village || address.suburb || '',
      state: address.state || '',
      pincode: address.postcode || '',
    });
  } catch (err) {
    res.status(500).json({ message: 'Reverse geocode failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    // Safe migration for reset token columns
    try {
      await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255)`);
      await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expire TIMESTAMP WITH TIME ZONE`);
    } catch (e) { }

    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(404).json({ message: 'There is no user with that email address.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await User.update({ resetPasswordToken, resetPasswordExpire }, { where: { id: user.id } });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Here we just log it since we don't have an email provider configured.
    console.log(`\n===========================================`);
    console.log(`PASSWORD RESET URL (MOCKED EMAIL SEND):`);
    console.log(`\n${resetUrl}\n`);
    console.log(`===========================================\n`);

    res.json({ message: 'Email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) return res.status(400).json({ message: 'Please provide a new password' });

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const [users] = await sequelize.query(
      `SELECT id FROM users WHERE reset_password_token = :token AND reset_password_expire > NOW()`,
      { replacements: { token: resetPasswordToken }, type: QueryTypes.SELECT }
    );

    if (!users) return res.status(400).json({ message: 'Invalid or expired token' });

    const user = await User.findByPk(users.id);
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save(); // triggers beforeUpdate hook to hash password

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
