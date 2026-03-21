const db = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find active cart
    const cartRes = await db.query('SELECT * FROM carts WHERE user_id = $1 AND is_active = true LIMIT 1', [userId]);
    if (cartRes.rows.length === 0) {
      return res.json({ items: [], subtotal: 0, cartId: null });
    }

    const cartId = cartRes.rows[0].id;

    // Fetch items with medicine details
    const itemsRes = await db.query(`
      SELECT ci.id as cart_item_id, ci.quantity, ci.unit_price, ci.total_price,
             m.id as medicine_id, m.name, m.manufacturer, m.images, m.requires_rx 
      FROM cart_items ci 
      JOIN medicines m ON ci.medicine_id = m.id 
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at ASC
    `, [cartId]);

    const items = itemsRes.rows.map(row => ({
      cartItemId: row.cart_item_id,
      medicineId: row.medicine_id,
      name: row.name,
      brand: row.manufacturer,
      price: Number(row.unit_price),
      total: Number(row.total_price),
      quantity: row.quantity,
      rxRequired: row.requires_rx,
      image: row.images && row.images.length > 0 ? row.images.join(',') : null
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    res.json({ items, subtotal, cartId });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { medicineId, quantity = 1 } = req.body;

    if (!medicineId) {
      return res.status(400).json({ error: 'medicineId is required' });
    }

    // Get active cart or create one
    let cartId;
    const cartRes = await db.query('SELECT id FROM carts WHERE user_id = $1 AND is_active = true LIMIT 1', [userId]);
    
    if (cartRes.rows.length === 0) {
      const newCart = await db.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartRes.rows[0].id;
    }

    // Get medicine price
    const medRes = await db.query('SELECT selling_price FROM medicines WHERE id = $1', [medicineId]);
    if (medRes.rows.length === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    const unitPrice = medRes.rows[0].selling_price || 0;

    // Check if item already exists in cart
    const existingItem = await db.query('SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND medicine_id = $2', [cartId, medicineId]);

    if (existingItem.rows.length > 0) {
      const newQty = existingItem.rows[0].quantity + quantity;
      const newTotal = Number(unitPrice) * newQty;
      await db.query(
        'UPDATE cart_items SET quantity = $1, total_price = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', 
        [newQty, newTotal, existingItem.rows[0].id]
      );
    } else {
      const totalPrice = Number(unitPrice) * quantity;
      await db.query(
        'INSERT INTO cart_items (cart_id, medicine_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5)',
        [cartId, medicineId, quantity, unitPrice, totalPrice]
      );
    }

    // Return success
    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Verify ownership
    const cartRes = await db.query('SELECT id FROM carts WHERE user_id = $1 AND is_active = true', [userId]);
    if (cartRes.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemRes = await db.query('SELECT unit_price FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartRes.rows[0].id]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const unitPrice = itemRes.rows[0].unit_price;
    const newTotal = Number(unitPrice) * quantity;

    await db.query(
      'UPDATE cart_items SET quantity = $1, total_price = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [quantity, newTotal, itemId]
    );

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    const cartRes = await db.query('SELECT id FROM carts WHERE user_id = $1 AND is_active = true', [userId]);
    if (cartRes.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    await db.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartRes.rows[0].id]);

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};
