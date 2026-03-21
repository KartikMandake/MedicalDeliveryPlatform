const Order = require('../models/Order');
const AgentLocation = require('../models/AgentLocation');
const User = require('../models/User');

exports.getMyDeliveries = async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { agentId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.acceptDelivery = async (req, res) => {
  try {
    await Order.update({ status: 'confirmed' }, { where: { id: req.params.orderId } });
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', { orderId: order.id, status: 'confirmed' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.setOnlineStatus = async (req, res) => {
  try {
    const { isOnline, lat = 0, lng = 0 } = req.body;
    await AgentLocation.upsert({ agentId: req.user.id, isOnline, lat, lng });
    res.json({ message: 'Status updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPerformance = async (req, res) => {
  try {
    const [total, delivered, inTransit] = await Promise.all([
      Order.count({ where: { agentId: req.user.id } }),
      Order.count({ where: { agentId: req.user.id, status: 'delivered' } }),
      Order.count({ where: { agentId: req.user.id, status: 'in_transit' } }),
    ]);
    res.json({ total, delivered, inTransit, successRate: total ? +((delivered / total) * 100).toFixed(1) : 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
