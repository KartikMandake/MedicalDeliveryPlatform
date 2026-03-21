const db = require('../config/db');

exports.getAvailableOrders = async (req, res) => {
  try {
    const agentId = req.user.userId;
    // Agents want to see orders that are 'ready' (waiting for pickup)
    // Or orders they have already explicitly accepted ('picked_up', 'in_transit', 'delivered')
    const ordersRes = await db.query(`
      SELECT o.id, o.order_number, o.status, o.total_amount, o.placed_at, o.payment_status,
             u.name as customer_name, u.phone as customer_phone,
             r.shop_name as pharmacy_name, r.lat as pharmacy_lat, r.lng as pharmacy_lng
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN retailers r ON o.retailer_id = r.id
      WHERE (o.status = 'ready' AND o.agent_id IS NULL)
         OR (o.agent_id = $1)
      ORDER BY o.placed_at DESC
    `, [agentId]);

    res.json(ordersRes.rows);
  } catch (error) {
    console.error('Error fetching agent orders:', error);
    res.status(500).json({ error: 'Failed to fetch agent pool' });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const agentId = req.user.userId;
    const { orderId } = req.params;

    // Must be 'ready' and unassigned to be accepted by an agent.
    const result = await db.query(`
      UPDATE orders 
      SET agent_id = $1, status = 'picked_up' 
      WHERE id = $2 AND status = 'ready' AND agent_id IS NULL
      RETURNING id, status
    `, [agentId, orderId]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Order is no longer available or not ready for pickup.' });
    }

    res.json({ message: 'Order successfully locked to agent', order: result.rows[0] });
  } catch (error) {
    console.error('Error accepting delivery:', error);
    res.status(500).json({ error: 'Failed to accept delivery assignment' });
  }
};

exports.updateStatus = async (req, res) => {
    try {
        const agentId = req.user.userId;
        const { orderId } = req.params;
        const { status, otp } = req.body;

        // Verify ownership
        const ownership = await db.query(`SELECT status, delivery_otp FROM orders WHERE id = $1 AND agent_id = $2`, [orderId, agentId]);
        if (ownership.rows.length === 0) {
            return res.status(403).json({ error: 'Unauthorized sequence. Do you own this transit?' });
        }

        const currentOrder = ownership.rows[0];

        // If dropping off, check OTP
        if (status === 'delivered') {
            // Some old orders before this update might have NULL delivery_otp. If so, bypass or require "000000"
            const requiredOtp = currentOrder.delivery_otp || '000000';
            if (otp !== requiredOtp) {
                return res.status(400).json({ error: 'Invalid 6-digit PIN. Please ask the Patient.' });
            }

            await db.query(`UPDATE orders SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP WHERE id = $1`, [orderId]);
            return res.json({ message: 'Delivery physically secured and logged' });
        }

        // Just update normal transit statuses
        if (!['in_transit'].includes(status)) {
             return res.status(400).json({ error: 'Invalid agent status boundary' });
        }

        await db.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, orderId]);
        res.json({ message: 'Navigation status synced to patient network' });

    } catch (error) {
        console.error('Error logging agent progress:', error);
        res.status(500).json({ error: 'Server mutation failure' });
    }
};
