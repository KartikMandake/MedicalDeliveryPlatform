const Order = require('../models/Order');
const AgentLocation = require('../models/AgentLocation');
const User = require('../models/User');

exports.getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const agent = order.agentId ? await User.findByPk(order.agentId, { attributes: ['id', 'name', 'phone'] }) : null;
    const agentLocation = order.agentId ? await AgentLocation.findOne({ where: { agentId: order.agentId } }) : null;
    res.json({ order: { ...order.toJSON(), agent }, agentLocation });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAgentLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const [loc] = await AgentLocation.upsert({ agentId: req.user.id, lat, lng, isOnline: true });
    const activeOrder = await Order.findOne({ where: { agentId: req.user.id, status: 'in_transit' } });
    if (activeOrder) {
      const io = req.app.get('io');
      io.to(`order_${activeOrder.id}`).emit('agent_location', { lat, lng });
    }
    res.json(loc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAgentLocation = async (req, res) => {
  try {
    const loc = await AgentLocation.findOne({ where: { agentId: req.params.agentId } });
    if (!loc) return res.status(404).json({ message: 'Agent location not found' });
    res.json(loc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
