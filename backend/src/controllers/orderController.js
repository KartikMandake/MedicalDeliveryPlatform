const Order = require('../models/Order');
const AgentLocation = require('../models/AgentLocation');
const User = require('../models/User');
const { generateOtp } = require('../utils/otp');
const sequelize = require('../db');
const { QueryTypes } = require('sequelize');

const normalizeStatusForUi = (status) => {
  if (status === 'packing') return 'preparing';
  if (status === 'ready') return 'ready_for_pickup';
  if (status === 'picked_up') return 'in_transit';
  return status;
};

let ensureOrderItemRetailerColumnPromise = null;

async function ensureOrderItemRetailerColumn() {
  if (!ensureOrderItemRetailerColumnPromise) {
    ensureOrderItemRetailerColumnPromise = sequelize.query(
      'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS retailer_id UUID'
    );
  }

  try {
    await ensureOrderItemRetailerColumnPromise;
  } catch (err) {
    ensureOrderItemRetailerColumnPromise = null;
    throw err;
  }
}

exports.createOrder = async (req, res) => {
  const badRequestError = (message) => {
    const err = new Error(message);
    err.statusCode = 400;
    return err;
  };

  try {
    const { deliveryAddress = {} } = req.body;
    await ensureOrderItemRetailerColumn();

    const requiredAddressFields = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode', 'lat', 'lng'];
    for (const field of requiredAddressFields) {
      if (!String(deliveryAddress?.[field] || '').trim()) {
        return res.status(400).json({ message: `Delivery address field is required: ${field}` });
      }
    }

    const lat = Number(deliveryAddress.lat);
    const lng = Number(deliveryAddress.lng);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ message: 'Delivery address latitude must be between -90 and 90' });
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'Delivery address longitude must be between -180 and 180' });
    }

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
      if (!cartId) throw badRequestError('Cart is empty');

      const items = await sequelize.query(
        `
        SELECT
          ci.id,
          ci.medicine_id,
          ci.quantity,
          COALESCE(ci.unit_price, COALESCE(m.selling_price, m.mrp, 0))::float AS unit_price,
          m.name,
          m.requires_rx AS "requiresPrescription",
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

      if (!items.length) throw badRequestError('Cart is empty');

      const rxItems = items.filter(item => item.requiresPrescription);
      if (rxItems.length > 0 && !req.body.prescription) {
        throw badRequestError(`Prescription is required for: ${rxItems.map(i => i.name).join(', ')}`);
      }

      for (const item of items) {
        if (!item.medicine_id) {
          throw badRequestError('One of the cart items is invalid or no longer available. Please refresh your cart.');
        }
        if (Number(item.stock || 0) < Number(item.quantity || 0)) {
          throw badRequestError(`Insufficient stock for ${item.name || 'selected medicine'}`);
        }
      }

      const medicineIds = [...new Set(items.map((item) => item.medicine_id).filter(Boolean))];
      const inventoryRows = medicineIds.length
        ? await sequelize.query(
          `
          SELECT
            retailer_id,
            medicine_id,
            SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0))::int AS available_qty
          FROM inventory
          WHERE medicine_id IN (:medicineIds)
          GROUP BY retailer_id, medicine_id
          `,
          {
            type: QueryTypes.SELECT,
            replacements: { medicineIds },
            transaction,
          }
        )
        : [];

      const demandByMedicine = {};
      const medicineNameById = {};
      for (const item of items) {
        demandByMedicine[item.medicine_id] = Number(demandByMedicine[item.medicine_id] || 0) + Number(item.quantity || 0);
        medicineNameById[item.medicine_id] = item.name || 'selected medicine';
      }

      const totalAvailableByMedicine = {};
      const retailerContribution = {};
      for (const row of inventoryRows) {
        if (!row.retailer_id) continue;
        const medicineId = row.medicine_id;
        const available = Number(row.available_qty || 0);
        totalAvailableByMedicine[medicineId] = Number(totalAvailableByMedicine[medicineId] || 0) + available;

        if (!retailerContribution[row.retailer_id]) retailerContribution[row.retailer_id] = 0;
        retailerContribution[row.retailer_id] += Math.min(available, Number(demandByMedicine[medicineId] || 0));
      }

      for (const medicineId of medicineIds) {
        if (Number(totalAvailableByMedicine[medicineId] || 0) < Number(demandByMedicine[medicineId] || 0)) {
          throw badRequestError(`Insufficient stock for ${medicineNameById[medicineId] || 'selected medicine'}`);
        }
      }

      const inventoryByMedicine = {};
      for (const row of inventoryRows) {
        const medicineId = row.medicine_id;
        const retailerId = row.retailer_id;
        const availableQty = Number(row.available_qty || 0);
        if (!medicineId || !retailerId || availableQty <= 0) continue;
        if (!inventoryByMedicine[medicineId]) inventoryByMedicine[medicineId] = [];
        inventoryByMedicine[medicineId].push({ retailerId, availableQty });
      }

      Object.keys(inventoryByMedicine).forEach((medicineId) => {
        inventoryByMedicine[medicineId].sort((a, b) => b.availableQty - a.availableQty);
      });

      const allocations = [];
      const retailerContributionByAllocation = {};
      for (const item of items) {
        const medicineId = item.medicine_id;
        const unitPrice = Number(item.unit_price || 0);
        let remaining = Number(item.quantity || 0);
        const pools = inventoryByMedicine[medicineId] || [];

        for (const pool of pools) {
          if (remaining <= 0) break;
          const available = Number(pool.availableQty || 0);
          if (available <= 0) continue;

          const takeQty = Math.min(remaining, available);
          if (takeQty <= 0) continue;

          allocations.push({
            medicineId,
            retailerId: pool.retailerId,
            quantity: takeQty,
            unitPrice,
          });

          pool.availableQty = available - takeQty;
          remaining -= takeQty;
          retailerContributionByAllocation[pool.retailerId] = Number(retailerContributionByAllocation[pool.retailerId] || 0) + takeQty;
        }

        if (remaining > 0) {
          throw badRequestError(`Insufficient stock for ${medicineNameById[medicineId] || 'selected medicine'}`);
        }
      }

      const selectedRetailerRank = Object.entries(
        Object.keys(retailerContributionByAllocation).length ? retailerContributionByAllocation : retailerContribution
      )
        .map(([retailerId, score]) => ({ retailerId, score: Number(score || 0) }))
        .sort((a, b) => b.score - a.score);

      const selectedRetailerId = selectedRetailerRank[0]?.retailerId || null;
      if (!selectedRetailerId) {
        throw badRequestError('Unable to assign this order to a retailer right now. Please try again.');
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
          retailer_id,
          status,
          delivery_address,
          subtotal,
          delivery_fee,
          total_amount,
          delivery_otp,
          payment_status,
          prescription,
          placed_at
        )
        VALUES (
          :orderNumber,
          :userId,
          :retailerId,
          'placed',
          CAST(:deliveryAddress AS jsonb),
          :subtotal,
          :deliveryFee,
          :totalAmount,
          :deliveryOtp,
          'pending',
          :prescription,
          (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
        )
        RETURNING id, order_number
        `,
        {
          type: QueryTypes.SELECT,
          replacements: {
            orderNumber,
            userId: req.user.id,
            retailerId: selectedRetailerId,
            deliveryAddress: JSON.stringify(deliveryAddress || {}),
            subtotal,
            deliveryFee,
            totalAmount: total,
            deliveryOtp: generateOtp(),
            prescription: req.body.prescription || null,
          },
          transaction,
        }
      );

      const created = insertedOrderRows[0];

      for (const allocation of allocations) {
        const unitPrice = Number(allocation.unitPrice || 0);
        const qty = Number(allocation.quantity || 0);

        await sequelize.query(
          `
          INSERT INTO order_items (order_id, medicine_id, retailer_id, quantity, unit_price, total_price)
          VALUES (:orderId, :medicineId, :retailerId, :quantity, :unitPrice, :totalPrice)
          `,
          {
            replacements: {
              orderId: created.id,
              medicineId: allocation.medicineId,
              retailerId: allocation.retailerId,
              quantity: qty,
              unitPrice,
              totalPrice: Number((unitPrice * qty).toFixed(2)),
            },
            transaction,
          }
        );
      }

      return {
        id: created.id,
        orderId: created.order_number,
        retailerId: selectedRetailerId,
        subtotal,
        taxes: 0,
        total,
        status: 'placed',
      };
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('createOrder failed:', {
      userId: req.user?.id,
      message: err.message,
      statusCode: err.statusCode || 500,
      stack: err.stack,
    });
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await sequelize.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.subtotal::float,
        o.delivery_fee::float,
        o.total_amount::float,
        o.delivery_address,
        o.placed_at,
        o.delivered_at
      FROM orders o
      WHERE o.user_id = :userId
      ORDER BY o.placed_at DESC
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { userId: req.user.id },
      }
    );

    const orderIds = orders.map((order) => order.id);
    let itemRows = [];
    if (orderIds.length > 0) {
      itemRows = await sequelize.query(
        `
        SELECT
          oi.order_id,
          oi.quantity,
          oi.unit_price::float,
          oi.total_price::float,
          m.id AS medicine_id,
          m.name AS medicine_name,
          m.type AS medicine_type,
          NULLIF(array_to_string(m.images, ','), '') AS image
        FROM order_items oi
        LEFT JOIN medicines m ON m.id = oi.medicine_id
        WHERE oi.order_id IN (:orderIds)
        ORDER BY oi.id ASC
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { orderIds },
        }
      );
    }

    const itemsByOrderId = {};
    for (const row of itemRows) {
      if (!itemsByOrderId[row.order_id]) itemsByOrderId[row.order_id] = [];
      itemsByOrderId[row.order_id].push({
        medicineId: row.medicine_id,
        name: row.medicine_name,
        type: row.medicine_type,
        image: row.image,
        quantity: Number(row.quantity || 0),
        unitPrice: Number(row.unit_price || 0),
        totalPrice: Number(row.total_price || 0),
      });
    }

    const payload = orders.map((order) => ({
      id: order.id,
      orderId: order.order_number,
      status: normalizeStatusForUi(order.status),
      paymentStatus: order.payment_status,
      subtotal: Number(order.subtotal || 0),
      deliveryFee: Number(order.delivery_fee || 0),
      total: Number(order.total_amount || 0),
      deliveryAddress: order.delivery_address || null,
      placedAt: order.placed_at,
      deliveredAt: order.delivered_at,
      items: itemsByOrderId[order.id] || [],
    }));

    res.json(payload);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getDefaultAddress = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `
      SELECT delivery_address
      FROM orders
      WHERE user_id = :userId
        AND delivery_address IS NOT NULL
      ORDER BY placed_at DESC
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { userId: req.user.id },
      }
    );

    res.json({ address: rows[0]?.delivery_address || null });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOrder = async (req, res) => {
  try {
    const orderRows = await sequelize.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.user_id,
        o.agent_id,
        o.retailer_id,
        o.status,
        o.payment_status,
        o.subtotal::float,
        o.delivery_fee::float,
        o.total_amount::float,
        o.delivery_address,
        o.placed_at,
        o.delivered_at
      FROM orders o
      WHERE o.id = :orderId
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId: req.params.id },
      }
    );

    const order = orderRows[0];
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'user' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    const user = await User.findByPk(order.user_id, { attributes: ['id', 'name', 'phone'] });
    const agent = order.agent_id ? await User.findByPk(order.agent_id, { attributes: ['id', 'name', 'phone'] }) : null;

    res.json({
      id: order.id,
      orderId: order.order_number,
      userId: order.user_id,
      agentId: order.agent_id,
      retailerId: order.retailer_id,
      status: normalizeStatusForUi(order.status),
      paymentStatus: order.payment_status,
      subtotal: Number(order.subtotal || 0),
      deliveryFee: Number(order.delivery_fee || 0),
      total: Number(order.total_amount || 0),
      deliveryAddress: order.delivery_address || null,
      placedAt: order.placed_at,
      deliveredAt: order.delivered_at,
      user,
      agent,
    });
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
