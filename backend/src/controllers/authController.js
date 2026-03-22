const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sequelize = require('../db');
const { QueryTypes } = require('sequelize');
const axios = require('axios');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
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
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
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
