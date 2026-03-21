const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address = {} } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone: phone || '', role, ...address });
    const token = signToken(user.id);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMe = async (req, res) => res.json(req.user);

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address = {} } = req.body;
    await User.update({ name, phone, ...address }, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
