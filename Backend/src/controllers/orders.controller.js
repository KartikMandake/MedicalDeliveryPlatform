const db = require('../config/db');

exports.checkout = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const userId = req.user.userId;

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

    // 3. Create the Order
    const orderRes = await client.query(`
      INSERT INTO orders (order_number, user_id, status, subtotal, delivery_fee, total_amount) 
      VALUES ($1, $2, 'placed', $3, $4, $5) RETURNING id`,
      [orderNumber, userId, subtotal, deliveryFee, totalAmount]
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
