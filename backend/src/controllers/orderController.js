const Order = require('../models/Order');
const AgentLocation = require('../models/AgentLocation');
const User = require('../models/User');
const { generateOtp } = require('../utils/otp');
const { sendNotification } = require('../utils/notifs');
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
          ci.ecommerce_product_id,
          ci.quantity,
          COALESCE(ci.unit_price, COALESCE(m.selling_price, m.mrp, ep.selling_price, ep.mrp, 0))::float AS unit_price,
          COALESCE(m.name, ep.name) AS name,
          COALESCE(inv.stock_quantity, 0)::int AS stock
        FROM cart_items ci
        LEFT JOIN medicines m ON m.id = ci.medicine_id
        LEFT JOIN ecommerce_products ep ON ep.id = ci.ecommerce_product_id
        LEFT JOIN (
          SELECT
            medicine_id,
            ecommerce_product_id,
            SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)) AS stock_quantity
          FROM inventory
          GROUP BY medicine_id, ecommerce_product_id
        ) inv ON (inv.medicine_id = ci.medicine_id AND ci.medicine_id IS NOT NULL) 
              OR (inv.ecommerce_product_id = ci.ecommerce_product_id AND ci.ecommerce_product_id IS NOT NULL)
        WHERE ci.cart_id = :cartId
        ORDER BY ci.created_at ASC
        `,
        { type: QueryTypes.SELECT, replacements: { cartId }, transaction }
      );

      if (!items.length) throw badRequestError('Cart is empty');

      for (const item of items) {
        if (!item.medicine_id && !item.ecommerce_product_id) {
          throw badRequestError('One of the cart items is invalid or no longer available. Please refresh your cart.');
        }
        if (Number(item.stock || 0) < Number(item.quantity || 0)) {
          throw badRequestError(`Insufficient stock for ${item.name || 'selected item'}`);
        }
      }

      const medicineIds = [...new Set(items.map((item) => item.medicine_id).filter(Boolean))];
      const ecomIds = [...new Set(items.map((item) => item.ecommerce_product_id).filter(Boolean))];

      let inventoryRows = [];
      if (medicineIds.length || ecomIds.length) {
        const medCondition = medicineIds.length ? `medicine_id IN (:medicineIds)` : `false`;
        const ecomCondition = ecomIds.length ? `ecommerce_product_id IN (:ecomIds)` : `false`;
        
        inventoryRows = await sequelize.query(
          `
          SELECT
            retailer_id,
            medicine_id,
            ecommerce_product_id,
            SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0))::int AS available_qty
          FROM inventory
          WHERE (${medCondition} OR ${ecomCondition})
          GROUP BY retailer_id, medicine_id, ecommerce_product_id
          `,
          {
            type: QueryTypes.SELECT,
            replacements: { medicineIds, ecomIds },
            transaction,
          }
        );
      }

      const getItemKey = (medId, ecomId) => medId ? `med_${medId}` : `ecom_${ecomId}`;

      const demandByKey = {};
      const nameByKey = {};
      for (const item of items) {
        const key = getItemKey(item.medicine_id, item.ecommerce_product_id);
        demandByKey[key] = Number(demandByKey[key] || 0) + Number(item.quantity || 0);
        nameByKey[key] = item.name || 'selected item';
      }

      const totalAvailableByKey = {};
      const retailerContribution = {};
      for (const row of inventoryRows) {
        if (!row.retailer_id) continue;
        const key = getItemKey(row.medicine_id, row.ecommerce_product_id);
        const available = Number(row.available_qty || 0);
        totalAvailableByKey[key] = Number(totalAvailableByKey[key] || 0) + available;

        if (!retailerContribution[row.retailer_id]) retailerContribution[row.retailer_id] = 0;
        retailerContribution[row.retailer_id] += Math.min(available, Number(demandByKey[key] || 0));
      }

      for (const key of Object.keys(demandByKey)) {
        if (Number(totalAvailableByKey[key] || 0) < Number(demandByKey[key] || 0)) {
          throw badRequestError(`Insufficient stock for ${nameByKey[key] || 'selected item'}`);
        }
      }

      const inventoryByKey = {};
      for (const row of inventoryRows) {
        const key = getItemKey(row.medicine_id, row.ecommerce_product_id);
        const retailerId = row.retailer_id;
        const availableQty = Number(row.available_qty || 0);
        if (!key || !retailerId || availableQty <= 0) continue;
        if (!inventoryByKey[key]) inventoryByKey[key] = [];
        inventoryByKey[key].push({ retailerId, availableQty });
      }

      Object.keys(inventoryByKey).forEach((key) => {
        inventoryByKey[key].sort((a, b) => b.availableQty - a.availableQty);
      });

      const allocations = [];
      const retailerContributionByAllocation = {};
      for (const item of items) {
        const key = getItemKey(item.medicine_id, item.ecommerce_product_id);
        const unitPrice = Number(item.unit_price || 0);
        let remaining = Number(item.quantity || 0);
        const pools = inventoryByKey[key] || [];

        for (const pool of pools) {
          if (remaining <= 0) break;
          const available = Number(pool.availableQty || 0);
          if (available <= 0) continue;

          const takeQty = Math.min(remaining, available);
          if (takeQty <= 0) continue;

          allocations.push({
            medicineId: item.medicine_id,
            ecommerceProductId: item.ecommerce_product_id,
            retailerId: pool.retailerId,
            quantity: takeQty,
            unitPrice,
          });

          pool.availableQty = available - takeQty;
          remaining -= takeQty;
          retailerContributionByAllocation[pool.retailerId] = Number(retailerContributionByAllocation[pool.retailerId] || 0) + takeQty;
        }

        if (remaining > 0) {
          throw badRequestError(`Insufficient stock for ${nameByKey[key] || 'selected item'}`);
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
          },
          transaction,
        }
      );

      const created = insertedOrderRows[0];

      for (const allocation of allocations) {
        const unitPrice = Number(allocation.unitPrice || 0);
        const qty = Number(allocation.quantity || 0);
        const colId = allocation.medicineId ? 'medicine_id' : 'ecommerce_product_id';
        const valId = allocation.medicineId || allocation.ecommerceProductId;

        await sequelize.query(
          `
          INSERT INTO order_items (order_id, ${colId}, retailer_id, quantity, unit_price, total_price)
          VALUES (:orderId, :productId, :retailerId, :quantity, :unitPrice, :totalPrice)
          `,
          {
            replacements: {
              orderId: created.id,
              productId: valId,
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

    await sendNotification(req, req.user.id, 'Order Placed', `Order #${order.orderId} placed successfully.`, 'order_update');

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
          COALESCE(m.id, ep.id) AS medicine_id,
          COALESCE(m.name, ep.name) AS medicine_name,
          COALESCE(m.type::text, 'E-Commerce') AS medicine_type,
          NULLIF(array_to_string(COALESCE(m.images, ep.images), ','), '') AS image
        FROM order_items oi
        LEFT JOIN medicines m ON m.id = oi.medicine_id
        LEFT JOIN ecommerce_products ep ON ep.id = oi.ecommerce_product_id
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
    await sendNotification(req, order.userId || order.user_id, 'Order Update', `Your order is now ${status.replace(/_/g, ' ')}.`, 'order_update');
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
    await sendNotification(req, order.userId || order.user_id, 'Agent Assigned', 'A delivery agent is now heading to pick up your order.', 'order_update');

    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (req.user.role === 'user' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    const uncancelable = ['ready_for_pickup', 'in_transit', 'delivered', 'cancelled'];
    if (uncancelable.includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status.replace(/_/g, ' ')}` });
    }

    await sequelize.transaction(async (transaction) => {
      // 1. Restore inventory
      const items = await sequelize.query(
        `SELECT medicine_id, ecommerce_product_id, retailer_id, quantity FROM order_items WHERE order_id = :orderId`,
        { type: QueryTypes.SELECT, replacements: { orderId: order.id }, transaction }
      );

      for (const item of items) {
        if (!item.retailer_id) continue;
        const qty = Number(item.quantity || 0);
        if (qty <= 0) continue;
        
        const colId = item.medicine_id ? 'medicine_id' : 'ecommerce_product_id';
        const valId = item.medicine_id || item.ecommerce_product_id;
        
        await sequelize.query(
          `UPDATE inventory 
           SET stock_quantity = stock_quantity + :qty 
           WHERE retailer_id = :retailerId AND ${colId} = :valId`,
          {
            replacements: { qty, retailerId: item.retailer_id, valId },
            transaction
          }
        );
      }

      // 2. Clear agent location if assigned
      if (order.agent_id) {
        await AgentLocation.update(
          { currentOrderId: null },
          { where: { agentId: order.agent_id, currentOrderId: order.id }, transaction }
        );
      }

      // 3. Update order status
      await order.update({ status: 'cancelled' }, { transaction });
    });

    // 4. Handle refund stub
    if (order.payment_status === 'paid') {
      await order.update({ payment_status: 'refunded' });
      // In real life, trigger Razorpay refund API here.
    }

    // 5. Emit socket events
    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', { orderId: order.id, status: 'cancelled' });
    if (order.agent_id) io.to(`agent_${order.agent_id}`).emit('order_cancelled', { orderId: order.id });
    await sendNotification(req, order.userId || order.user_id, 'Order Cancelled', `Your order #${order.order_number || order.id} has been cancelled.`, 'system');

    res.json({ message: 'Order cancelled successfully', status: 'cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
