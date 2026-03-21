const Order = require('../models/Order');
const AgentLocation = require('../models/AgentLocation');
const User = require('../models/User');
const { generateOtp } = require('../utils/otp');
const sequelize = require('../db');
const { QueryTypes } = require('sequelize');

exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress = {} } = req.body;
    const order = await sequelize.transaction(async (transaction) => {
      const cartRows = await sequelize.query(
        `
        SELECT id
        FROM carts
        WHERE user_id = :userId
          AND is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1
        `,
        { type: QueryTypes.SELECT, replacements: { userId: req.user.id }, transaction }
      );
      const cartId = cartRows[0]?.id;
      if (!cartId) throw new Error('Cart is empty');

      const items = await sequelize.query(
        `
        SELECT
          ci.id,
          ci.medicine_id,
          ci.quantity,
          COALESCE(ci.unit_price, COALESCE(m.selling_price, m.mrp, 0))::float AS unit_price,
          m.name,
          COALESCE(inv.stock_quantity, 0)::int AS stock
        FROM cart_items ci
        LEFT JOIN medicines m ON m.id = ci.medicine_id
        LEFT JOIN (
          SELECT
            medicine_id,
            SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)) AS stock_quantity
          FROM inventory
          GROUP BY medicine_id
        ) inv ON inv.medicine_id = ci.medicine_id
        WHERE ci.cart_id = :cartId
        ORDER BY ci.created_at ASC
        `,
        { type: QueryTypes.SELECT, replacements: { cartId }, transaction }
      );

      if (!items.length) throw new Error('Cart is empty');

      for (const item of items) {
        if (Number(item.stock || 0) < Number(item.quantity || 0)) {
          throw new Error(`Insufficient stock for ${item.name || 'selected medicine'}`);
        }
      }

      const subtotal = Number(
        items.reduce((sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0), 0).toFixed(2)
      );
      const deliveryFee = 0;
      const total = Number((subtotal + deliveryFee).toFixed(2));

      const nextOrderNumberRows = await sequelize.query(
        `
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1 AS next_number
        FROM orders
        WHERE order_number ~ '^ORD-[0-9]+$'
        `,
        { type: QueryTypes.SELECT, transaction }
      );
      const nextNumber = Number(nextOrderNumberRows[0]?.next_number || 1);
      const orderNumber = `ORD-${String(nextNumber).padStart(4, '0')}`;

      const insertedOrderRows = await sequelize.query(
        `
        INSERT INTO orders (
          order_number,
          user_id,
          status,
          delivery_address,
          subtotal,
          delivery_fee,
          total_amount,
          delivery_otp,
          payment_status,
          placed_at
        )
        VALUES (
          :orderNumber,
          :userId,
          'placed',
          CAST(:deliveryAddress AS jsonb),
          :subtotal,
          :deliveryFee,
          :totalAmount,
          :deliveryOtp,
          'pending',
          CURRENT_TIMESTAMP
        )
        RETURNING id, order_number
        `,
        {
          type: QueryTypes.SELECT,
          replacements: {
            orderNumber,
            userId: req.user.id,
            deliveryAddress: JSON.stringify(deliveryAddress || {}),
            subtotal,
            deliveryFee,
            totalAmount: total,
            deliveryOtp: generateOtp(),
          },
          transaction,
        }
      );

      const created = insertedOrderRows[0];

      for (const item of items) {
        const unitPrice = Number(item.unit_price || 0);
        const qty = Number(item.quantity || 0);

        await sequelize.query(
          `
          INSERT INTO order_items (order_id, medicine_id, quantity, unit_price, total_price)
          VALUES (:orderId, :medicineId, :quantity, :unitPrice, :totalPrice)
          `,
          {
            replacements: {
              orderId: created.id,
              medicineId: item.medicine_id,
              quantity: qty,
              unitPrice,
              totalPrice: Number((unitPrice * qty).toFixed(2)),
            },
            transaction,
          }
        );

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
              quantity: qty,
            },
            transaction,
          }
        );
      }

      await sequelize.query(
        `DELETE FROM cart_items WHERE cart_id = :cartId`,
        { replacements: { cartId }, transaction }
      );

      return {
        id: created.id,
        orderId: created.order_number,
        subtotal,
        taxes: 0,
        total,
        status: 'placed',
      };
    });

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
