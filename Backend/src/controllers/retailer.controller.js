const db = require('../config/db');

exports.registerStore = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shopName, gstin, drugLicense, lat = null, lng = null } = req.body;

    if (!shopName) {
      return res.status(400).json({ error: 'Shop Name is required.' });
    }

    // Check if retailer profile already exists
    const existing = await db.query('SELECT id FROM retailers WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Store profile already exists.' });
    }

    const result = await db.query(
      `INSERT INTO retailers (user_id, shop_name, gstin, drug_license, lat, lng, is_open, kyc_status) 
       VALUES ($1, $2, $3, $4, $5, $6, true, 'pending') RETURNING *`,
      [userId, shopName, gstin, drugLicense, lat, lng]
    );

    res.status(201).json({ message: 'Store registered successfully', store: result.rows[0] });
  } catch (error) {
    console.error('Error registering store:', error);
    res.status(500).json({ error: 'Failed to create store profile' });
  }
};

exports.getStoreProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check user_role here if needed. But the endpoint is already protected.
    const result = await db.query('SELECT * FROM retailers WHERE user_id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store profile not found' });
    }

    res.json({ store: result.rows[0] });
  } catch (error) {
    console.error('Error fetching store profile:', error);
    res.status(500).json({ error: 'Failed to fetch store profile' });
  }
};

exports.getAvailableOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    // First ensure the retailer is fully registered
    const retailerCheck = await db.query('SELECT id FROM retailers WHERE user_id = $1', [userId]);
    if (retailerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Must complete store registration to view orders.' });
    }
    const retailerId = retailerCheck.rows[0].id;

    // Fetch placed orders (available for pickup validation) or orders explicitly assigned to this retailer
    const ordersRes = await db.query(`
      SELECT o.*, u.name as customer_name, u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.status = 'placed' 
         OR (o.retailer_id = $1 AND o.status IN ('packing', 'ready'))
      ORDER BY o.placed_at DESC
    `, [retailerId]);

    const orders = ordersRes.rows;

    // In a real app we might fetch order_items. We'll simplify for the dashboard view.
    res.json(orders);
  } catch (error) {
    console.error('Error fetching retailer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
