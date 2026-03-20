import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.API_PORT || 4000);

const ORDER_STATUSES = new Set([
  'placed',
  'confirmed',
  'packing',
  'ready',
  'picked_up',
  'in_transit',
  'delivered',
  'cancelled',
]);

function generateOrderNumber() {
  const randomChunk = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${Date.now()}-${randomChunk}`;
}

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    const ping = await pool.query('SELECT NOW() AS now');
    return res.status(200).json({ ok: true, dbTime: ping.rows[0].now });
  } catch (_error) {
    return res.status(500).json({ ok: false, error: 'Database unreachable' });
  }
});

app.post('/cart/items', async (req, res) => {
  const { userId, medicineId } = req.body;
  const quantity = Number(req.body.quantity || 1);

  if (!userId || !medicineId || Number.isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({
      error: 'userId, medicineId and a positive quantity are required',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const medicineResult = await client.query(
      `SELECT id, name, selling_price, is_active
       FROM medicines
       WHERE id = $1`,
      [medicineId]
    );

    if (medicineResult.rowCount === 0 || !medicineResult.rows[0].is_active) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Medicine not found or inactive' });
    }

    const price = Number(medicineResult.rows[0].selling_price);

    const cartResult = await client.query(
      `SELECT id
       FROM carts
       WHERE user_id = $1 AND is_active = TRUE
       LIMIT 1`,
      [userId]
    );

    let cartId = cartResult.rows[0]?.id;

    if (!cartId) {
      const insertedCart = await client.query(
        `INSERT INTO carts (user_id, is_active)
         VALUES ($1, TRUE)
         RETURNING id`,
        [userId]
      );
      cartId = insertedCart.rows[0].id;
    }

    const itemResult = await client.query(
      `INSERT INTO cart_items (cart_id, medicine_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (cart_id, medicine_id)
       DO UPDATE SET
         quantity = cart_items.quantity + EXCLUDED.quantity,
         unit_price = EXCLUDED.unit_price,
         total_price = (cart_items.quantity + EXCLUDED.quantity) * EXCLUDED.unit_price,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, cart_id, medicine_id, quantity, unit_price, total_price`,
      [cartId, medicineId, quantity, price, price * quantity]
    );

    const summaryResult = await client.query(
      `SELECT
         c.id AS cart_id,
         c.user_id,
         COALESCE(SUM(ci.total_price), 0) AS cart_total,
         COALESCE(SUM(ci.quantity), 0) AS total_items
       FROM carts c
       LEFT JOIN cart_items ci ON ci.cart_id = c.id
       WHERE c.id = $1
       GROUP BY c.id, c.user_id`,
      [cartId]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Item added to cart',
      item: itemResult.rows[0],
      summary: summaryResult.rows[0],
    });
  } catch (_error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Failed to add item to cart' });
  } finally {
    client.release();
  }
});

app.get('/cart/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const cartResult = await pool.query(
      `SELECT id, user_id
       FROM carts
       WHERE user_id = $1 AND is_active = TRUE
       LIMIT 1`,
      [userId]
    );

    if (cartResult.rowCount === 0) {
      return res.status(200).json({
        cartId: null,
        userId,
        items: [],
        summary: {
          totalItems: 0,
          subtotal: 0,
          deliveryFee: 0,
          totalAmount: 0,
        },
      });
    }

    const cartId = cartResult.rows[0].id;

    const itemsResult = await pool.query(
      `SELECT
         ci.id,
         ci.medicine_id,
         m.name,
         m.manufacturer,
         m.requires_rx,
         m.images,
         ci.quantity,
         ci.unit_price,
         ci.total_price
       FROM cart_items ci
       JOIN medicines m ON m.id = ci.medicine_id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at DESC`,
      [cartId]
    );

    const summaryResult = await pool.query(
      `SELECT
         COALESCE(SUM(ci.quantity), 0) AS total_items,
         COALESCE(SUM(ci.total_price), 0) AS subtotal
       FROM cart_items ci
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    const subtotal = Number(summaryResult.rows[0].subtotal || 0);
    const totalItems = Number(summaryResult.rows[0].total_items || 0);
    const deliveryFee = subtotal > 0 ? 25 : 0;

    return res.status(200).json({
      cartId,
      userId,
      items: itemsResult.rows,
      summary: {
        totalItems,
        subtotal,
        deliveryFee,
        totalAmount: subtotal + deliveryFee,
      },
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.patch('/cart/items/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const quantity = Number(req.body.quantity);

  if (Number.isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'quantity must be a non-negative number' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const itemResult = await client.query(
      `SELECT id, unit_price
       FROM cart_items
       WHERE id = $1
       LIMIT 1`,
      [itemId]
    );

    if (itemResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity === 0) {
      await client.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
      await client.query('COMMIT');
      return res.status(200).json({ message: 'Cart item removed' });
    }

    const unitPrice = Number(itemResult.rows[0].unit_price);
    const updatedResult = await client.query(
      `UPDATE cart_items
       SET
         quantity = $2::integer,
         total_price = ($2::numeric * $3::numeric),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, cart_id, medicine_id, quantity, unit_price, total_price`,
      [itemId, quantity, unitPrice]
    );

    await client.query('COMMIT');
    return res.status(200).json({
      message: 'Cart item updated',
      item: updatedResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('PATCH /cart/items/:itemId failed:', error);
    return res.status(500).json({
      error: 'Failed to update cart item',
      details: error.message,
    });
  } finally {
    client.release();
  }
});

app.post('/agent/location', async (req, res) => {
  const { agentId, lat, lng, isOnline = true } = req.body;

  if (!agentId || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'agentId, lat and lng are required' });
  }

  try {
    await pool.query(
      'SELECT upsert_agent_location($1::uuid, $2::double precision, $3::double precision, $4::boolean)',
      [agentId, Number(lat), Number(lng), Boolean(isOnline)]
    );

    const locationResult = await pool.query(
      `SELECT agent_id, lat, lng, is_online, updated_at
       FROM agent_locations
       WHERE agent_id = $1`,
      [agentId]
    );

    return res.status(200).json({
      message: 'Agent location updated',
      location: locationResult.rows[0],
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Failed to update agent location' });
  }
});

app.get('/orders/:orderNumber/tracking', async (req, res) => {
  const { orderNumber } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         o.id,
         o.order_number,
         o.status,
         o.placed_at,
         o.delivered_at,
         o.delivery_address,
         u.id AS agent_id,
         u.name AS agent_name,
         al.lat AS agent_lat,
         al.lng AS agent_lng,
         al.is_online AS agent_online,
         al.updated_at AS agent_last_ping,
         CASE
           WHEN o.status IN ('picked_up', 'in_transit') THEN 'agent_live_location'
           WHEN o.status IN ('confirmed', 'packing', 'ready') THEN 'retailer_stage'
           WHEN o.status = 'delivered' THEN 'delivered'
           WHEN o.status = 'cancelled' THEN 'cancelled'
           ELSE 'status_only'
         END AS tracking_mode
       FROM orders o
       LEFT JOIN users u ON u.id = o.agent_id
       LEFT JOIN agent_locations al ON al.agent_id = o.agent_id
       WHERE o.order_number = $1
       LIMIT 1`,
      [orderNumber]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (_error) {
    return res.status(500).json({ error: 'Failed to fetch tracking info' });
  }
});

app.patch('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ORDER_STATUSES.has(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders
       SET
         status = $2,
         delivered_at = CASE WHEN $2 = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END
       WHERE id = $1
       RETURNING id, order_number, status, delivered_at, placed_at`,
      [id, status]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json({
      message: 'Order status updated',
      order: result.rows[0],
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.post('/orders/place', async (req, res) => {
  const { userId, deliveryAddress, paymentMethod } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cartResult = await client.query(
      `SELECT id
       FROM carts
       WHERE user_id = $1 AND is_active = TRUE
       LIMIT 1`,
      [userId]
    );

    if (cartResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No active cart found for this user' });
    }

    const cartId = cartResult.rows[0].id;

    const cartItemsResult = await client.query(
      `SELECT id, medicine_id, quantity, unit_price, total_price
       FROM cart_items
       WHERE cart_id = $1`,
      [cartId]
    );

    if (cartItemsResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = cartItemsResult.rows.reduce((sum, item) => sum + Number(item.total_price), 0);
    const deliveryFee = subtotal > 0 ? 25 : 0;
    const totalAmount = subtotal + deliveryFee;

    const retailerResult = await client.query(
      `SELECT id
       FROM retailers
       WHERE is_open = TRUE
       ORDER BY id ASC
       LIMIT 1`
    );
    const retailerId = retailerResult.rows[0]?.id || null;

    const agentResult = await client.query(
      `SELECT agent_id
       FROM agent_locations
       WHERE is_online = TRUE
       ORDER BY updated_at DESC
       LIMIT 1`
    );
    const agentId = agentResult.rows[0]?.agent_id || null;

    const initialStatus = 'placed';
    const addressPayload = deliveryAddress || {};

    let orderRow;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const orderNumber = generateOrderNumber();
      try {
        const createdOrder = await client.query(
          `INSERT INTO orders (
             order_number,
             user_id,
             retailer_id,
             agent_id,
             status,
             delivery_address,
             subtotal,
             delivery_fee,
             total_amount,
             payment_status,
             placed_at
           )
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, 'pending', CURRENT_TIMESTAMP)
           RETURNING id, order_number, status, total_amount, placed_at, agent_id`,
          [orderNumber, userId, retailerId, agentId, initialStatus, JSON.stringify(addressPayload), subtotal, deliveryFee, totalAmount]
        );

        orderRow = createdOrder.rows[0];
        break;
      } catch (error) {
        if (error.code !== '23505' || attempt === 4) {
          throw error;
        }
      }
    }

    await client.query(
      `INSERT INTO order_items (order_id, medicine_id, quantity, unit_price, total_price)
       SELECT $1, medicine_id, quantity, unit_price, total_price
       FROM cart_items
       WHERE cart_id = $2`,
      [orderRow.id, cartId]
    );

    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: orderRow.id,
        orderNumber: orderRow.order_number,
        status: orderRow.status,
        totalAmount: Number(orderRow.total_amount),
        paymentMethod: paymentMethod || 'card',
        placedAt: orderRow.placed_at,
        trackingPath: `/tracking?orderNumber=${orderRow.order_number}`,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({
      error: 'Failed to place order',
      details: error.message,
    });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
