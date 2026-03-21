const Razorpay = require('razorpay');
const crypto = require('crypto');
const { QueryTypes } = require('sequelize');
const sequelize = require('../db');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const orders = await sequelize.query(
      `
      SELECT id, order_number, total_amount
      FROM orders
      WHERE id = :orderId
      LIMIT 1
      `,
      { type: QueryTypes.SELECT, replacements: { orderId } }
    );
    const order = orders[0];
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        message: 'Payment gateway is not configured. Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET.',
      });
    }

    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.total_amount || 0) * 100),
      currency: 'INR',
      receipt: order.order_number,
    });

    await sequelize.query(
      `
      UPDATE orders
      SET razorpay_order_id = :razorpayOrderId
      WHERE id = :orderId
      `,
      {
        replacements: {
          razorpayOrderId: rzpOrder.id,
          orderId,
        },
      }
    );

    res.json({ razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expectedSig !== razorpay_signature) return res.status(400).json({ message: 'Payment verification failed' });

    const order = await sequelize.transaction(async (transaction) => {
      const orderRows = await sequelize.query(
        `
        SELECT id, user_id, order_number, total_amount, status, payment_status, razorpay_order_id
        FROM orders
        WHERE id = :orderId
        LIMIT 1
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { orderId },
          transaction,
        }
      );

      const existingOrder = orderRows[0];
      if (!existingOrder) return null;

      if (existingOrder.payment_status !== 'paid') {
        const items = await sequelize.query(
          `
          SELECT medicine_id, quantity
          FROM order_items
          WHERE order_id = :orderId
          `,
          {
            type: QueryTypes.SELECT,
            replacements: { orderId },
            transaction,
          }
        );

        for (const item of items) {
          await sequelize.query(
            `
            UPDATE inventory
            SET
              stock_quantity = GREATEST(stock_quantity - :quantity, 0),
              last_updated = CURRENT_TIMESTAMP
            WHERE medicine_id = :medicineId
              AND stock_quantity > 0
            `,
            {
              replacements: {
                medicineId: item.medicine_id,
                quantity: Number(item.quantity || 0),
              },
              transaction,
            }
          );
        }

        const cartRows = await sequelize.query(
          `
          SELECT id
          FROM carts
          WHERE user_id = :userId
            AND is_active = TRUE
          ORDER BY created_at DESC
          LIMIT 1
          `,
          {
            type: QueryTypes.SELECT,
            replacements: { userId: existingOrder.user_id },
            transaction,
          }
        );

        const cartId = cartRows[0]?.id;
        if (cartId) {
          await sequelize.query(
            `DELETE FROM cart_items WHERE cart_id = :cartId`,
            {
              replacements: { cartId },
              transaction,
            }
          );
        }
      }

      const updatedRows = await sequelize.query(
        `
        UPDATE orders
        SET
          payment_status = 'paid',
          status = 'confirmed',
          razorpay_order_id = COALESCE(razorpay_order_id, :razorpayOrderId)
        WHERE id = :orderId
        RETURNING id, order_number, total_amount, status, payment_status, razorpay_order_id
        `,
        {
          type: QueryTypes.SELECT,
          replacements: {
            orderId,
            razorpayOrderId: razorpay_order_id,
          },
          transaction,
        }
      );

      return updatedRows[0] || null;
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const io = req.app.get('io');
    io.to('retailers').emit('new_order', order);
    res.json({ message: 'Payment verified', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPayments = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const rows = await sequelize.query(
      `
      SELECT
        id,
        order_number,
        total_amount,
        razorpay_order_id,
        payment_status,
        placed_at,
        user_id
      FROM orders
      WHERE payment_status = 'paid'
        AND (:isAdmin OR user_id = :userId)
      ORDER BY placed_at DESC
      `,
      {
        type: QueryTypes.SELECT,
        replacements: {
          isAdmin,
          userId: req.user.id,
        },
      }
    );

    const payments = rows.map((row) => ({
      id: row.id,
      orderId: row.order_number,
      total: Number(row.total_amount || 0),
      paymentId: row.razorpay_order_id,
      paymentStatus: row.payment_status,
      createdAt: row.placed_at,
      userId: row.user_id,
    }));

    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
