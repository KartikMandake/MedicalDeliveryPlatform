const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

// Secure environment injection
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_test_secret'
});

exports.createOrder = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const userId = req.user.userId;
    const { address } = req.body;

    await client.query('BEGIN');

    // 1. Get Active Cart
    const cartRes = await client.query('SELECT id FROM carts WHERE user_id = $1 AND is_active = true FOR UPDATE', [userId]);
    if (cartRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No active cart found' });
    }
    const cartId = cartRes.rows[0].id;

    // 2. Fetch cart items
    const itemsRes = await client.query('SELECT * FROM cart_items WHERE cart_id = $1', [cartId]);
    if (itemsRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = itemsRes.rows.reduce((sum, item) => sum + Number(item.total_price), 0);
    const deliveryFee = 5.00; // Flat fee
    const totalAmount = subtotal + deliveryFee;

    // 3. Construct Razorpay Transaction
    const options = {
      amount: Math.round(totalAmount * 100), // convert to smallest currency division (e.g. cents/paise)
      currency: "INR", // Razorpay test accounts mandate INR natively without international KYC
      receipt: `RCPT_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 4. Draft PostgreSQL Internal Link and OTP
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const deliveryOtp = null;

    const orderRes = await client.query(`
      INSERT INTO orders (order_number, user_id, status, subtotal, delivery_fee, total_amount, razorpay_order_id, payment_status, delivery_otp, delivery_address) 
      VALUES ($1, $2, 'placed', $3, $4, $5, $6, 'pending', $7, $8) RETURNING id`,
      [orderNumber, userId, subtotal, deliveryFee, totalAmount, razorpayOrder.id, deliveryOtp, address ? JSON.stringify(address) : null]
    );
    const orderId = orderRes.rows[0].id;

    // 5. Transfer products into concrete order mapping
    await client.query(`
      INSERT INTO order_items (order_id, medicine_id, quantity, unit_price, total_price)
      SELECT $1, medicine_id, quantity, unit_price, total_price FROM cart_items WHERE cart_id = $2`,
      [orderId, cartId]
    );

    await client.query('COMMIT'); // Wait to deactivate cart to allow checkout retry via COD if they cancel Razorpay window 

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      internalOrderId: orderId
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Razorpay Error:', error);
    
    // Attempt to extract the native Razorpay error string for the frontend
    const errorMsg = error?.error?.description || error?.message || 'Failed to instantiate payment portal';
    res.status(500).json({ error: errorMsg });
  } finally {
    client.release();
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = req.body;
    const userId = req.user.userId;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_test_secret';

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      await db.query('UPDATE orders SET payment_status = $1 WHERE id = $2', ['failed', internal_order_id]);
      return res.status(400).json({ error: 'Cryptographic signature mismatch' });
    }

    // Secure Verification complete
    await db.query(`UPDATE orders SET payment_status = 'paid' WHERE id = $1`, [internal_order_id]);

    // Insert historical receipt log
    const orderRes = await db.query('SELECT total_amount FROM orders WHERE id = $1', [internal_order_id]);
    const amount = orderRes.rows[0].total_amount;

    await db.query(`
      INSERT INTO transactions (order_id, type, entity_type, amount, status, razorpay_ref)
      VALUES ($1, 'payment', 'user', $2, 'completed', $3)`,
      [internal_order_id, amount, razorpay_payment_id]
    );

    // Disable active cart locking it into archival
    await db.query('UPDATE carts SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_active = true', [userId]);

    res.json({ message: 'Payment cryptographically verified', success: true });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ error: 'Server authentication crash' });
  }
};
