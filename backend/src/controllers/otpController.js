const { generateOtp } = require('../utils/otp');
const sequelize = require('../db');
const { QueryTypes } = require('sequelize');

let ensureAgentLocationColumnsPromise = null;

async function ensureAgentLocationColumns() {
  if (!ensureAgentLocationColumnsPromise) {
    ensureAgentLocationColumnsPromise = (async () => {
      await sequelize.query('ALTER TABLE agent_locations ADD COLUMN IF NOT EXISTS current_order_id UUID');
      await sequelize.query('ALTER TABLE agent_locations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP');
    })();
  }

  try {
    await ensureAgentLocationColumnsPromise;
  } catch (err) {
    ensureAgentLocationColumnsPromise = null;
    throw err;
  }
}

exports.generatePickupOtp = async (req, res) => {
  try {
    const { orderId } = req.body;
    const rows = await sequelize.query(
      `
      SELECT id
      FROM orders
      WHERE id = :orderId
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId },
      }
    );
    const order = rows[0] || null;
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const otp = generateOtp();
    await sequelize.query(
      `
      UPDATE orders
      SET pickup_otp = :otp,
          status = 'ready',
          delivered_at = NULL
      WHERE id = :orderId
      `,
      {
        replacements: { otp, orderId },
      }
    );

    res.json({ message: 'Pickup OTP generated', otp });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.verifyPickupOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const rows = await sequelize.query(
      `
      SELECT id, pickup_otp
      FROM orders
      WHERE id = :orderId
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId },
      }
    );
    const order = rows[0] || null;
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.pickup_otp || '') !== String(otp || '')) return res.status(400).json({ message: 'Invalid OTP' });

    await sequelize.query(
      `
      UPDATE orders
      SET pickup_otp = NULL,
          status = 'in_transit'
      WHERE id = :orderId
      `,
      {
        replacements: { orderId },
      }
    );

    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', { orderId: order.id, status: 'in_transit' });
    res.json({ message: 'Pickup OTP verified, order in transit' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.verifyDeliveryOtp = async (req, res) => {
  try {
    await ensureAgentLocationColumns();
    const { orderId, otp } = req.body;
    const rows = await sequelize.query(
      `
      SELECT id, delivery_otp, agent_id
      FROM orders
      WHERE id = :orderId
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId },
      }
    );
    const order = rows[0] || null;
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.delivery_otp || '') !== String(otp || '')) return res.status(400).json({ message: 'Invalid OTP' });

    await sequelize.query(
      `
      UPDATE orders
      SET delivery_otp = NULL,
          status = 'delivered',
          delivered_at = CURRENT_TIMESTAMP
      WHERE id = :orderId
      `,
      {
        replacements: { orderId },
      }
    );

    if (order.agent_id) {
      await sequelize.query(
        `
        UPDATE agent_locations
        SET current_order_id = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE agent_id = :agentId
        `,
        {
          replacements: { agentId: order.agent_id },
        }
      );
    }

    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', { orderId: order.id, status: 'delivered' });
    res.json({ message: 'Delivery confirmed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
