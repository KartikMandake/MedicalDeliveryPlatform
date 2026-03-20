const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: order.orderId,
    });

    await order.update({ razorpayOrderId: rzpOrder.id });
    res.json({ razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expectedSig !== razorpay_signature) return res.status(400).json({ message: 'Payment verification failed' });

    await Order.update({ paymentStatus: 'paid', paymentId: razorpay_payment_id, status: 'confirmed' }, { where: { id: orderId } });
    const order = await Order.findByPk(orderId);

    const io = req.app.get('io');
    io.to('retailers').emit('new_order', order);
    res.json({ message: 'Payment verified', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPayments = async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? { paymentStatus: 'paid' } : { userId: req.user.id, paymentStatus: 'paid' };
    const orders = await Order.findAll({ where, order: [['createdAt', 'DESC']], attributes: ['id', 'orderId', 'total', 'paymentId', 'paymentStatus', 'createdAt', 'userId'] });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
