const db = require('../config/db');

exports.checkout = async (req, res) => {
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

    // 2. Fetch cart items to calculate subtotal
    const itemsRes = await client.query('SELECT * FROM cart_items WHERE cart_id = $1', [cartId]);
    if (itemsRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = itemsRes.rows.reduce((sum, item) => sum + Number(item.total_price), 0);
    const deliveryFee = 5.00; // Flat delivery fee
    const totalAmount = subtotal + deliveryFee;
    
    // Generate Order Number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const deliveryOtp = null;

    // 3. Create the Order
    const orderRes = await client.query(`
      INSERT INTO orders (order_number, user_id, status, subtotal, delivery_fee, total_amount, delivery_otp, delivery_address) 
      VALUES ($1, $2, 'placed', $3, $4, $5, $6, $7) RETURNING id`,
      [orderNumber, userId, subtotal, deliveryFee, totalAmount, deliveryOtp, address ? JSON.stringify(address) : null]
    );
    const orderId = orderRes.rows[0].id;

    // 4. Move items into order_items
    await client.query(`
      INSERT INTO order_items (order_id, medicine_id, quantity, unit_price, total_price)
      SELECT $1, medicine_id, quantity, unit_price, total_price FROM cart_items WHERE cart_id = $2`,
      [orderId, cartId]
    );

    // 5. Deactivate Cart
    await client.query('UPDATE carts SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cartId]);

    await client.query('COMMIT');

    res.json({ message: 'Order placed successfully', orderId, orderNumber });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to complete checkout' });
  } finally {
    client.release();
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const retailerRes = await db.query('SELECT id FROM retailers WHERE user_id = $1', [userId]);
    if (retailerRes.rows.length === 0) {
      return res.status(403).json({ error: 'Not a registered retailer' });
    }
    const retailerId = retailerRes.rows[0].id;

    // Direct Retailer to Patient Physical Handoff
    if (status === 'delivered') {
      const orderCheck = await db.query('SELECT id FROM orders WHERE id = $1 AND retailer_id = $2', [id, retailerId]);
      
      if (orderCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Order not found for your logistics scope' });
      }
      
      await db.query('UPDATE orders SET status = $1, delivered_at = CURRENT_TIMESTAMP WHERE id = $2 AND retailer_id = $3', [status, id, retailerId]);
      return res.json({ message: 'Order dropped securely in-store' });
    }

    // If packing, claim the order. Otherwise just update.
    if (status === 'packing') {
      await db.query('UPDATE orders SET status = $1, retailer_id = $2 WHERE id = $3 AND status = $4', ['packing', retailerId, id, 'placed']);
    } else {
      await db.query('UPDATE orders SET status = $1 WHERE id = $2 AND retailer_id = $3', [status, id, retailerId]);
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Error updating order status' });
  }
};

exports.getPatientOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await db.query(`
      SELECT o.order_number as id, o.placed_at as date,
             (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE order_id = o.id) as items,
             o.total_amount as price, o.status, o.delivery_otp,
             (
               SELECT json_agg(json_build_object(
                 'medicine_id', m.id,
                 'name', m.name,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'total_price', oi.total_price
               ))
               FROM order_items oi
               JOIN medicines m ON oi.medicine_id = m.id
               WHERE oi.order_id = o.id
             ) as order_details
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.placed_at DESC
    `, [userId]);

    const orders = result.rows.map(r => {
      let statusColor = 'secondary';
      if (r.status === 'delivered') statusColor = 'primary';
      else if (r.status === 'cancelled' || r.status === 'failed') statusColor = 'error';

      return {
        id: r.id,
        title: 'Precision Network Order',
        date: new Date(r.date).toLocaleDateString(),
        items: parseInt(r.items, 10),
        price: Number(r.price),
        status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
        statusColor,
        deliveryOtp: r.delivery_otp || '000000',
        orderDetails: r.order_details || []
      };
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching patient orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
