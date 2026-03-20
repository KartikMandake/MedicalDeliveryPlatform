const Order = require('../models/Order');
const User = require('../models/User');
const sequelize = require('../db');
const { QueryTypes } = require('sequelize');

exports.getKPIs = async (req, res) => {
  try {
    const [totalOrders, totalUsers, activeAgents] = await Promise.all([
      Order.count(),
      User.count({ where: { role: 'user' } }),
      User.count({ where: { role: 'agent', isActive: true } }),
    ]);
    const revenueResult = await sequelize.query(
      `SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE "paymentStatus" = 'paid'`,
      { type: QueryTypes.SELECT }
    );
    res.json({ totalOrders, totalUsers, totalRevenue: Number(revenueResult[0].total), activeAgents });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Order.findAndCountAll({ where, order: [['createdAt', 'DESC']], offset, limit: Number(limit) });

    // Attach user names
    const userIds = [...new Set(rows.map((o) => o.userId))];
    const users = await User.findAll({ where: { id: userIds }, attributes: ['id', 'name', 'email'] });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    const orders = rows.map((o) => ({ ...o.toJSON(), user: userMap[o.userId] || null }));

    res.json({ orders, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAnalytics = async (req, res) => {
  try {
    const dailyOrders = await sequelize.query(
      `SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, COUNT(*) as count, COALESCE(SUM(total),0) as revenue
       FROM orders WHERE "createdAt" >= NOW() - INTERVAL '7 days'
       GROUP BY date ORDER BY date ASC`,
      { type: QueryTypes.SELECT }
    );
    const statusBreakdown = await sequelize.query(
      `SELECT status, COUNT(*) as count FROM orders GROUP BY status`,
      { type: QueryTypes.SELECT }
    );
    res.json({ dailyOrders, statusBreakdown });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
