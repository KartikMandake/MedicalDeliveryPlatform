const Order = require('../models/Order');
const AgentLocation = require('../models/AgentLocation');
const { generateOtp } = require('../utils/otp');

exports.generatePickupOtp = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.update({ pickupOtp: generateOtp(), status: 'ready_for_pickup' });
    res.json({ message: 'Pickup OTP generated', otp: order.pickupOtp });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.verifyPickupOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.pickupOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    await order.update({ pickupOtpVerified: true, status: 'in_transit' });
    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', { orderId: order.id, status: 'in_transit' });
    res.json({ message: 'Pickup OTP verified, order in transit' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.deliveryOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    await order.update({ deliveryOtpVerified: true, status: 'delivered', deliveredAt: new Date() });
    await AgentLocation.update({ currentOrderId: null }, { where: { agentId: order.agentId } });
    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', { orderId: order.id, status: 'delivered' });
    res.json({ message: 'Delivery confirmed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
