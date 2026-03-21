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
        const { orderId } = req.params;
        const { status } = req.body;
        const agentId = req.user.userId;
        const ownership = await db.query(`SELECT status, delivery_otp FROM orders WHERE id = $1 AND agent_id = $2`, [orderId, agentId]);
        if (ownership.rows.length === 0) {
            return res.status(403).json({ error: 'Unauthorized sequence. Do you own this transit?' });
        }

        // If dropping off, check ownership
        if (status === 'delivered') {
            await db.query(`UPDATE orders SET status = $1, delivered_at = CURRENT_TIMESTAMP WHERE id = $2 AND agent_id = $3`, [status, orderId, agentId]);
            return res.json({ message: 'Package delivered and confirmed' });
        }

        // Normal sync
        await db.query(`UPDATE orders SET status = $1 WHERE id = $2 AND agent_id = $3`, [status, orderId, agentId]);
        res.json({ message: 'Wayward status updated' });
    } catch (error) {
        console.error('Error logging agent progress:', error);
        res.status(500).json({ error: 'Server mutation failure' });
    }
};
