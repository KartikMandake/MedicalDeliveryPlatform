const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AgentLocation = require('../models/AgentLocation');
const User = require('../models/User');
const { generateOtp } = require('../utils/otp');
const sequelize = require('../db');

exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress = {} } = req.body;
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart || !cart.items.length) return res.status(400).json({ message: 'Cart is empty' });

    // Enrich items with product data
    const items = [];
    let subtotal = 0;
    for (const item of cart.items) {
      const p = await Product.findByPk(item.productId);
      if (!p) continue;
      items.push({ productId: p.id, name: p.name, price: p.price, quantity: item.quantity });
      subtotal += p.price * item.quantity;
      await p.update({ stock: p.stock - item.quantity });
    }

    const taxes = +(subtotal * 0.05).toFixed(2);
    const total = +(subtotal + taxes).toFixed(2);

    // Generate orderId
    const count = await Order.count();
    const orderId = `ORD-${String(count + 1).padStart(4, '0')}`;

    const order = await Order.create({
      orderId, userId: req.user.id, items,
      subtotal: +subtotal.toFixed(2), taxes, total,
      deliveryStreet: deliveryAddress.street, deliveryCity: deliveryAddress.city,
      deliveryState: deliveryAddress.state, deliveryPincode: deliveryAddress.pincode,
      deliveryLat: deliveryAddress.lat, deliveryLng: deliveryAddress.lng,
      prescription: cart.prescription,
      deliveryOtp: generateOtp(),
    });

    await Cart.update({ items: [], prescription: null }, { where: { userId: req.user.id } });

    const io = req.app.get('io');
    io.to('retailers').emit('new_order', order);

    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const user = await User.findByPk(order.userId, { attributes: ['id', 'name', 'phone'] });
    const agent = order.agentId ? await User.findByPk(order.agentId, { attributes: ['id', 'name', 'phone'] }) : null;
    res.json({ ...order.toJSON(), user, agent });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await Order.update({ status, ...(status === 'delivered' ? { deliveredAt: new Date() } : {}) }, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    const order = await Order.findByPk(req.params.id);
    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', { orderId: order.id, status });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.assignAgent = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const agentLoc = await AgentLocation.findOne({ where: { isOnline: true, currentOrderId: null } });
    if (!agentLoc) return res.status(404).json({ message: 'No agents available' });

    await order.update({ agentId: agentLoc.agentId, status: 'confirmed' });
    await agentLoc.update({ currentOrderId: order.id });

    const io = req.app.get('io');
    io.to(`agent_${agentLoc.agentId}`).emit('new_delivery', order);
    io.to(`order_${order.id}`).emit('order_status_update', { orderId: order.id, status: 'confirmed' });

    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
