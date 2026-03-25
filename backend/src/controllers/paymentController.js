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
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'retailer';
    const orders = await sequelize.query(
      `
      SELECT id, user_id, order_number, total_amount
      FROM orders
      WHERE id = :orderId
      LIMIT 1
      `,
      { type: QueryTypes.SELECT, replacements: { orderId } }
    );
    const order = orders[0];
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!isPrivileged && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to initiate payment for this order' });
    }

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
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'retailer';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expectedSig !== razorpay_signature) return res.status(400).json({ message: 'Payment verification failed' });

    const order = await sequelize.transaction(async (transaction) => {
      const orderRows = await sequelize.query(
        `
        SELECT id, user_id, retailer_id, order_number, total_amount, status, payment_status, razorpay_order_id
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
      if (!isPrivileged && existingOrder.user_id !== req.user.id) {
        const authError = new Error('Not authorized to verify payment for this order');
        authError.statusCode = 403;
        throw authError;
      }

      if (existingOrder.payment_status !== 'paid') {
        const items = await sequelize.query(
          `
          SELECT medicine_id, ecommerce_product_id, quantity
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
          let remaining = Number(item.quantity || 0);
          if (remaining <= 0) continue;

          const colId = item.medicine_id ? 'medicine_id' : 'ecommerce_product_id';
          const valId = item.medicine_id || item.ecommerce_product_id;

          const inventoryRows = await sequelize.query(
            `
            SELECT id, stock_quantity, COALESCE(reserved_quantity, 0) AS reserved_quantity
            FROM inventory
            WHERE ${colId} = :valId
              AND GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0) > 0
            ORDER BY GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0) DESC, last_updated ASC
            FOR UPDATE
            `,
            {
              type: QueryTypes.SELECT,
              replacements: { valId },
              transaction,
            }
          );

          for (const row of inventoryRows) {
            if (remaining <= 0) break;
            const available = Math.max(0, Number(row.stock_quantity || 0) - Number(row.reserved_quantity || 0));
            if (available <= 0) continue;

            const take = Math.min(available, remaining);
            await sequelize.query(
              `
              UPDATE inventory
              SET
                stock_quantity = GREATEST(stock_quantity - :take, 0),
                last_updated = CURRENT_TIMESTAMP
              WHERE id = :inventoryId
              `,
              {
                replacements: {
                  inventoryId: row.id,
                  take,
                },
                transaction,
              }
            );
            remaining -= take;
          }

          if (remaining > 0) {
            const stockErr = new Error('Inventory changed during payment. Please try checkout again.');
            stockErr.statusCode = 409;
            throw stockErr;
          }
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
        RETURNING id, order_number, retailer_id, total_amount, status, payment_status, razorpay_order_id
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
    io.to('retailers').emit('new_order', { ...order, retailerId: order.retailer_id || null });
    res.json({ message: 'Payment verified', order });
  } catch (err) { res.status(err.statusCode || 500).json({ message: err.message }); }
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
