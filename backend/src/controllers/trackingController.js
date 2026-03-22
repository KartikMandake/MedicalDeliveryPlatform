const sequelize = require('../db');
const { QueryTypes } = require('sequelize');
const { generateOtp } = require('../utils/otp');

const normalizeStatusForUi = (status) => {
  if (status === 'packing') return 'preparing';
  if (status === 'ready') return 'ready_for_pickup';
  if (status === 'picked_up') return 'in_transit';
  return status;
};

exports.getOrderTracking = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `
      SELECT
        o.id,
        o.order_number AS "orderId",
        o.user_id AS "userId",
        o.retailer_id AS "retailerId",
        o.agent_id AS "agentId",
        o.status,
        o.payment_status AS "paymentStatus",
        o.delivery_address AS "deliveryAddress",
        o.subtotal::float,
        o.delivery_fee::float AS "deliveryFee",
        o.total_amount::float AS total,
        o.delivery_otp AS "deliveryOtp",
        o.placed_at AS "placedAt",
        o.delivered_at AS "deliveredAt"
      FROM orders o
      WHERE o.id = :orderId
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId: req.params.orderId },
      }
    );

    const order = rows[0];
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = normalizeStatusForUi(order.status);

    if (req.user.role === 'user' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to track this order' });
    }

    const shouldEnsureDeliveryOtp = req.user.role === 'user'
      && order.userId === req.user.id
      && !order.deliveryOtp
      && ['ready_for_pickup', 'in_transit'].includes(order.status);

    if (shouldEnsureDeliveryOtp) {
      const fallbackOtp = generateOtp();
      const otpRows = await sequelize.query(
        `
        UPDATE orders
        SET delivery_otp = COALESCE(delivery_otp, :fallbackOtp)
        WHERE id = :orderId
        RETURNING delivery_otp AS "deliveryOtp"
        `,
        {
          type: QueryTypes.SELECT,
          replacements: {
            fallbackOtp,
            orderId: order.id,
          },
        }
      );
      if (otpRows[0]?.deliveryOtp) {
        order.deliveryOtp = otpRows[0].deliveryOtp;
      }
    }

    let agent = null;
    if (order.agentId) {
      const agentRows = await sequelize.query(
        `
        SELECT id, name, phone
        FROM users
        WHERE id = :agentId
        LIMIT 1
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { agentId: order.agentId },
        }
      );
      agent = agentRows[0] || null;
    }

    let agentLocation = null;
    if (order.agentId) {
      const locationRows = await sequelize.query(
        `
        SELECT
          agent_id AS "agentId",
          lat,
          lng,
          is_online AS "isOnline",
          updated_at AS "updatedAt"
        FROM agent_locations
        WHERE agent_id = :agentId
        LIMIT 1
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { agentId: order.agentId },
        }
      );
      agentLocation = locationRows[0] || null;
    }

    const itemRows = await sequelize.query(
      `
      SELECT
        oi.quantity,
        oi.unit_price::float AS "unitPrice",
        oi.total_price::float AS "totalPrice",
        m.name,
        m.type,
        NULLIF(array_to_string(m.images, ','), '') AS image
      FROM order_items oi
      LEFT JOIN medicines m ON m.id = oi.medicine_id
      WHERE oi.order_id = :orderId
      ORDER BY oi.id ASC
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId: order.id },
      }
    );

    res.json({
      order: {
        ...order,
        deliveryOtp: req.user.role === 'user' && order.userId === req.user.id && order.status !== 'delivered'
          ? order.deliveryOtp
          : null,
        agent,
        items: itemRows,
      },
      agentLocation,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAgentLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await sequelize.query(
      `
      INSERT INTO agent_locations (agent_id, lat, lng, is_online, updated_at)
      VALUES (:agentId, :lat, :lng, TRUE, CURRENT_TIMESTAMP)
      ON CONFLICT (agent_id)
      DO UPDATE SET
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        is_online = TRUE,
        updated_at = CURRENT_TIMESTAMP
      `,
      {
        replacements: {
          agentId: req.user.id,
          lat,
          lng,
        },
      }
    );

    const activeOrders = await sequelize.query(
      `
      SELECT id
      FROM orders
      WHERE agent_id = :agentId
        AND status = 'in_transit'
      ORDER BY placed_at DESC
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { agentId: req.user.id },
      }
    );
    const activeOrder = activeOrders[0] || null;

    if (activeOrder) {
      const io = req.app.get('io');
      io.to(`order_${activeOrder.id}`).emit('agent_location', { lat, lng });
    }

    res.json({ agentId: req.user.id, lat, lng, isOnline: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAgentLocation = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `
      SELECT
        agent_id AS "agentId",
        lat,
        lng,
        is_online AS "isOnline",
        updated_at AS "updatedAt"
      FROM agent_locations
      WHERE agent_id = :agentId
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { agentId: req.params.agentId },
      }
    );
    const loc = rows[0] || null;
    if (!loc) return res.status(404).json({ message: 'Agent location not found' });
    res.json(loc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
