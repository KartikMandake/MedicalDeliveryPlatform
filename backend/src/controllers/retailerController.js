const sequelize = require('../db');
const { QueryTypes } = require('sequelize');

const mapUiStatusToDb = (status) => {
  if (status === 'preparing') return 'packing';
  if (status === 'ready_for_pickup') return 'ready';
  if (status === 'in_transit') return 'picked_up';
  return status;
};

const normalizeStatusForUi = (status) => {
  if (status === 'packing') return 'preparing';
  if (status === 'ready') return 'ready_for_pickup';
  if (status === 'picked_up') return 'in_transit';
  return status;
};

let ensureAgentLocationColumnsPromise = null;
let ensureOrderItemRetailerColumnPromise = null;
let ensureRetailerLocationColumnsPromise = null;

async function ensureAgentLocationColumns() {
  if (!ensureAgentLocationColumnsPromise) {
    ensureAgentLocationColumnsPromise = (async () => {
      await sequelize.query('ALTER TABLE agent_locations ADD COLUMN IF NOT EXISTS current_order_id UUID');
      await sequelize.query('ALTER TABLE agent_locations ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE');
      await sequelize.query('ALTER TABLE agent_locations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP');
      await sequelize.query('ALTER TABLE agent_locations ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION');
      await sequelize.query('ALTER TABLE agent_locations ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION');
    })();
  }

  try {
    await ensureAgentLocationColumnsPromise;
  } catch (err) {
    ensureAgentLocationColumnsPromise = null;
    throw err;
  }
}

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

async function ensureRetailerLocationColumns() {
  if (!ensureRetailerLocationColumnsPromise) {
    ensureRetailerLocationColumnsPromise = (async () => {
      await sequelize.query('ALTER TABLE retailers ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION');
      await sequelize.query('ALTER TABLE retailers ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION');
    })();
  }

  try {
    await ensureRetailerLocationColumnsPromise;
  } catch (err) {
    ensureRetailerLocationColumnsPromise = null;
    throw err;
  }
}

const haversineKm = (fromLat, fromLng, toLat, toLng) => {
  const lat1 = Number(fromLat);
  const lng1 = Number(fromLng);
  const lat2 = Number(toLat);
  const lng2 = Number(toLng);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

async function getAvailableAgents() {
  return sequelize.query(
    `
    SELECT
      u.id,
      u.name,
      u.phone,
      al.lat,
      al.lng,
      al.is_online AS "isOnline",
      al.current_order_id AS "currentOrderId",
      COALESCE(stats.active_orders, 0)::int AS "activeOrders"
    FROM users u
    LEFT JOIN agent_locations al ON al.agent_id = u.id
    LEFT JOIN (
      SELECT agent_id, COUNT(*) AS active_orders
      FROM orders
      WHERE status IN ('in_transit', 'picked_up')
      GROUP BY agent_id
    ) stats ON stats.agent_id = u.id
    WHERE u.role = 'agent'
      AND COALESCE(al.is_online, FALSE) = TRUE
      AND (al.current_order_id IS NULL)
    ORDER BY COALESCE(stats.active_orders, 0) ASC, u.created_at ASC
    `,
    {
      type: QueryTypes.SELECT,
    }
  );
}

async function getOrderLocationContext(orderId, retailerId) {
  const rows = await sequelize.query(
    `
    SELECT
      o.id,
      o.delivery_address,
      r.shop_name,
      r.lat AS retailer_lat,
      r.lng AS retailer_lng
    FROM orders o
    LEFT JOIN retailers r ON r.id = :retailerId
    WHERE o.id = :orderId
      AND EXISTS (
        SELECT 1
        FROM order_items oi
        WHERE oi.order_id = o.id
          AND COALESCE(oi.retailer_id, o.retailer_id) = :retailerId
      )
    LIMIT 1
    `,
    {
      type: QueryTypes.SELECT,
      replacements: { orderId, retailerId },
    }
  );
  return rows[0] || null;
}

exports.getProfile = async (req, res) => {
  try {
    await ensureRetailerLocationColumns();
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const rows = await sequelize.query(
      `
      SELECT id, shop_name, lat, lng
      FROM retailers
      WHERE id = :retailerId
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { retailerId },
      }
    );

    const profile = rows[0] || null;
    if (!profile) return res.status(404).json({ message: 'Retailer profile not found' });
    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    await ensureRetailerLocationColumns();
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const lat = Number(req.body?.lat);
    const lng = Number(req.body?.lng);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ message: 'Latitude must be between -90 and 90' });
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'Longitude must be between -180 and 180' });
    }

    await sequelize.query(
      `
      UPDATE retailers
      SET lat = :lat,
          lng = :lng
      WHERE id = :retailerId
      `,
      {
        replacements: { retailerId, lat, lng },
      }
    );

    return res.json({ message: 'Retailer location updated', lat, lng });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Helper: get retailer row for a user
async function getRetailerId(userId) {
  let rows = await sequelize.query(
    `SELECT id FROM retailers WHERE user_id = :userId LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { userId } }
  );
  if (rows[0]?.id) return rows[0].id;

  // Backfill profile for legacy retailer users missing retailers row.
  await sequelize.query(
    `INSERT INTO retailers (user_id, shop_name, kyc_status)
     VALUES (:userId, :shopName, 'pending')
     ON CONFLICT (user_id) DO NOTHING`,
    {
      replacements: {
        userId,
        shopName: `Retailer-${String(userId).slice(0, 8)}`,
      },
      type: QueryTypes.INSERT,
    }
  );

  rows = await sequelize.query(
    `SELECT id FROM retailers WHERE user_id = :userId LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { userId } }
  );

  return rows[0]?.id || null;
}

// GET /retailer/dashboard — KPIs
exports.getDashboard = async (req, res) => {
  try {
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const [orderStats] = await sequelize.query(
      `SELECT
        COUNT(*)::int AS total_orders,
        COUNT(*) FILTER (WHERE placed_at::date = CURRENT_DATE)::int AS orders_today,
        COALESCE(SUM(total_amount), 0)::float AS total_revenue,
        COALESCE(SUM(total_amount) FILTER (WHERE placed_at::date = CURRENT_DATE), 0)::float AS revenue_today,
        COUNT(*) FILTER (WHERE status IN ('placed','confirmed'))::int AS pending_orders
       FROM orders WHERE retailer_id = :retailerId`,
      { type: QueryTypes.SELECT, replacements: { retailerId } }
    );

    const [invStats] = await sequelize.query(
      `SELECT
        COUNT(*)::int AS total_items,
        COALESCE(SUM(stock_quantity), 0)::int AS total_stock,
        COUNT(*) FILTER (WHERE stock_quantity <= reorder_level)::int AS low_stock_count
       FROM inventory WHERE retailer_id = :retailerId`,
      { type: QueryTypes.SELECT, replacements: { retailerId } }
    );

    res.json({
      totalOrders: orderStats?.total_orders || 0,
      ordersToday: orderStats?.orders_today || 0,
      totalRevenue: orderStats?.total_revenue || 0,
      revenueToday: orderStats?.revenue_today || 0,
      pendingOrders: orderStats?.pending_orders || 0,
      inventoryItems: invStats?.total_items || 0,
      totalStock: invStats?.total_stock || 0,
      lowStockCount: invStats?.low_stock_count || 0,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /retailer/orders — paginated orders
exports.getOrders = async (req, res) => {
  try {
    await ensureOrderItemRetailerColumn();
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status || null;
    const bucket = req.query.bucket || null;

    let whereClause = `
      WHERE EXISTS (
        SELECT 1
        FROM order_items oi_scope
        WHERE oi_scope.order_id = o.id
          AND COALESCE(oi_scope.retailer_id, o.retailer_id) = :retailerId
      )
    `;
    const replacements = { retailerId, limit, offset };
    if (bucket === 'incoming') {
      whereClause += ` AND o.status IN (:incomingStatuses)`;
      replacements.incomingStatuses = ['placed', 'confirmed'];
    } else if (bucket === 'recent_active') {
      whereClause += ` AND o.status IN (:recentStatuses)`;
      replacements.recentStatuses = ['packing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
    }

    if (statusFilter) {
      const statuses = String(statusFilter)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => mapUiStatusToDb(value));

      if (statuses.length === 1) {
        whereClause += ` AND o.status = :statusFilter`;
        replacements.statusFilter = statuses[0];
      } else if (statuses.length > 1) {
        whereClause += ` AND o.status IN (:statusFilters)`;
        replacements.statusFilters = statuses;
      }
    }

    const countRows = await sequelize.query(
      `SELECT COUNT(*)::int AS total FROM orders o ${whereClause}`,
      { type: QueryTypes.SELECT, replacements }
    );
    const total = countRows[0]?.total || 0;

    const orders = await sequelize.query(
      `SELECT
        o.id, o.order_number, o.status, o.payment_status,
        o.subtotal::float, o.delivery_fee::float, o.total_amount::float,
        o.placed_at, o.delivered_at,
        o.delivery_address,
        u.name AS customer_name, u.phone AS customer_phone, u.email AS customer_email
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ${whereClause}
       ORDER BY o.placed_at DESC
       LIMIT :limit OFFSET :offset`,
      { type: QueryTypes.SELECT, replacements }
    );

    // Fetch items for each order
    const orderIds = orders.map(o => o.id);
    let items = [];
    if (orderIds.length > 0) {
      items = await sequelize.query(
        `SELECT oi.order_id, oi.quantity, oi.unit_price::float, oi.total_price::float,
                COALESCE(oi.retailer_id, o.retailer_id) AS retailer_id,
                r.shop_name AS retailer_name,
                m.name AS medicine_name, m.type, m.images,
                NULLIF(array_to_string(m.images, ','), '') AS image
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         LEFT JOIN retailers r ON r.id = COALESCE(oi.retailer_id, o.retailer_id)
         LEFT JOIN medicines m ON m.id = oi.medicine_id
         WHERE oi.order_id IN (:orderIds)
           AND COALESCE(oi.retailer_id, o.retailer_id) = :retailerId`,
        { type: QueryTypes.SELECT, replacements: { orderIds, retailerId } }
      );
    }

    const itemsByOrder = {};
    items.forEach(item => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    });

    const enrichedOrders = orders.map(o => ({
      ...o,
      status: normalizeStatusForUi(o.status),
      items: itemsByOrder[o.id] || [],
    }));

    res.json({ orders: enrichedOrders, total, page, pages: Math.ceil(total / limit), limit });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /retailer/orders/:id/status — update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    await ensureAgentLocationColumns();
    await ensureOrderItemRetailerColumn();
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const { status, agentId } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'ready_for_pickup', 'in_transit', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });

    const requestedPickupAssignment = status === 'ready_for_pickup' || status === 'in_transit';
    const acceptedByRetailer = status === 'confirmed';

    let selectedAgentId = null;
    if (requestedPickupAssignment) {
      selectedAgentId = agentId || null;
    }

    // Accepting a new order should directly move it to packing/preparing for simpler retailer flow.
    const dbStatus = acceptedByRetailer
      ? 'packing'
      : requestedPickupAssignment
        ? 'ready'
        : mapUiStatusToDb(status);

    const order = await sequelize.query(
      `
      SELECT o.id, o.status
      FROM orders o
      WHERE o.id = :orderId
        AND EXISTS (
          SELECT 1
          FROM order_items oi
          WHERE oi.order_id = o.id
            AND COALESCE(oi.retailer_id, o.retailer_id) = :retailerId
        )
      LIMIT 1
      `,
      { type: QueryTypes.SELECT, replacements: { orderId: req.params.id, retailerId } }
    );

    if (!order.length) return res.status(404).json({ message: 'Order not found' });

    const orderAgentRows = await sequelize.query(
      `SELECT id, agent_id FROM orders WHERE id = :orderId LIMIT 1`,
      { type: QueryTypes.SELECT, replacements: { orderId: req.params.id } }
    );
    const currentAgentId = orderAgentRows[0]?.agent_id || null;

    if (requestedPickupAssignment && !selectedAgentId && currentAgentId) {
      selectedAgentId = currentAgentId;
    }

    if (requestedPickupAssignment && !selectedAgentId) {
      return res.status(400).json({ message: 'Please select a delivery agent before requesting pickup' });
    }

    if (selectedAgentId && currentAgentId && String(currentAgentId) !== String(selectedAgentId)) {
      return res.status(409).json({
        message: 'This order already has an assigned delivery agent. Please use the same agent for all shops in this order.',
      });
    }

    if (requestedPickupAssignment && selectedAgentId && (!currentAgentId || String(currentAgentId) !== String(selectedAgentId))) {
      const agentRows = await sequelize.query(
        `
        SELECT u.id, u.name, u.phone, al.is_online, al.current_order_id
        FROM users u
        LEFT JOIN agent_locations al ON al.agent_id = u.id
        WHERE u.id = :agentId
          AND u.role = 'agent'
        LIMIT 1
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { agentId: selectedAgentId },
        }
      );
      const agent = agentRows[0] || null;
      if (!agent) return res.status(404).json({ message: 'Selected delivery agent not found' });
      if (!agent.is_online) return res.status(400).json({ message: 'Selected delivery agent is currently offline' });
    }

    await sequelize.query(
      `
      UPDATE orders
      SET
        status = :status,
        agent_id = COALESCE(:agentId, agent_id)
      WHERE id = :orderId
      `,
      {
        replacements: {
          status: dbStatus,
          orderId: req.params.id,
          agentId: selectedAgentId,
        },
      }
    );

    const io = req.app.get('io');
    io.to(`order_${req.params.id}`).emit('order_status_update', {
      orderId: req.params.id,
      status: requestedPickupAssignment
        ? 'ready_for_pickup'
        : acceptedByRetailer
          ? 'preparing'
          : status,
    });

    if (selectedAgentId) {
      const deliveryRows = await sequelize.query(
        `
        SELECT
          o.id,
          o.order_number AS "orderId",
          o.total_amount::float AS total,
          o.delivery_address AS "deliveryAddress",
          o.status,
          u.name AS "customerName",
          u.phone AS "customerPhone",
          r.shop_name AS "retailerName",
          r.lat AS "retailerLat",
          r.lng AS "retailerLng",
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', rs.retailer_id,
                  'name', rr.shop_name,
                  'lat', rr.lat,
                  'lng', rr.lng,
                  'items', COALESCE(rs.items, '[]'::json)
                )
              )
              FROM (
                SELECT
                  COALESCE(oi.retailer_id, o.retailer_id) AS retailer_id,
                  json_agg(
                    json_build_object(
                      'name', m.name,
                      'type', m.type,
                      'quantity', oi.quantity,
                      'unitPrice', oi.unit_price,
                      'totalPrice', oi.total_price
                    )
                  ) AS items
                FROM order_items oi
                LEFT JOIN medicines m ON m.id = oi.medicine_id
                WHERE oi.order_id = o.id
                GROUP BY COALESCE(oi.retailer_id, o.retailer_id)
              ) rs
              LEFT JOIN retailers rr ON rr.id = rs.retailer_id
            ),
            '[]'::json
          ) AS "pickupShops",
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'name', m.name,
                  'type', m.type,
                  'sourceRetailerId', COALESCE(oi.retailer_id, o.retailer_id),
                  'sourceRetailerName', rr2.shop_name,
                  'quantity', oi.quantity,
                  'unitPrice', oi.unit_price,
                  'totalPrice', oi.total_price
                )
              )
              FROM order_items oi
              LEFT JOIN medicines m ON m.id = oi.medicine_id
              LEFT JOIN retailers rr2 ON rr2.id = COALESCE(oi.retailer_id, o.retailer_id)
              WHERE oi.order_id = o.id
            ),
            '[]'::json
          ) AS items
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        LEFT JOIN retailers r ON r.id = o.retailer_id
        WHERE o.id = :orderId
        LIMIT 1
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { orderId: req.params.id },
        }
      );
      const delivery = deliveryRows[0] || null;

      if (delivery) {
        const primaryPickup = Array.isArray(delivery.pickupShops) && delivery.pickupShops.length
          ? delivery.pickupShops[0]
          : {
            name: delivery.retailerName,
            lat: delivery.retailerLat,
            lng: delivery.retailerLng,
          };

        io.to(`agent_${selectedAgentId}`).emit('new_delivery', {
          ...delivery,
          status: 'ready_for_pickup',
          assignmentRequested: true,
          pickupPharmacy: {
            id: primaryPickup.id,
            name: primaryPickup.name,
            lat: primaryPickup.lat,
            lng: primaryPickup.lng,
          },
        });
      }
    }

    res.json({
      id: req.params.id,
      status: requestedPickupAssignment
        ? 'ready_for_pickup'
        : acceptedByRetailer
          ? 'preparing'
          : status,
      agentId: selectedAgentId,
      assignmentRequested: Boolean(selectedAgentId),
      message: selectedAgentId
        ? 'Pickup request sent to agent. Order will move to in transit after agent accepts.'
        : acceptedByRetailer
          ? 'Order accepted and moved to preparing'
        : 'Order status updated',
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /retailer/agents/available — online unassigned agents
exports.getAvailableAgents = async (req, res) => {
  try {
    await ensureAgentLocationColumns();
    await ensureOrderItemRetailerColumn();
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const agents = await getAvailableAgents();
    const orderId = req.query.orderId || null;
    if (!orderId) return res.json(agents);

    const orderContext = await getOrderLocationContext(orderId, retailerId);
    if (!orderContext) return res.status(404).json({ message: 'Order not found for this retailer' });

    const customerLat = Number(orderContext.delivery_address?.lat);
    const customerLng = Number(orderContext.delivery_address?.lng);
    const retailerLat = Number(orderContext.retailer_lat);
    const retailerLng = Number(orderContext.retailer_lng);

    const rankedAgents = agents
      .map((agent) => {
        const distanceToCustomerKm = haversineKm(agent.lat, agent.lng, customerLat, customerLng);
        const distanceToPharmacyKm = haversineKm(agent.lat, agent.lng, retailerLat, retailerLng);
        const recommendedDistanceKm = distanceToPharmacyKm ?? distanceToCustomerKm ?? null;
        return {
          ...agent,
          distanceToCustomerKm: distanceToCustomerKm === null ? null : Number(distanceToCustomerKm.toFixed(2)),
          distanceToPharmacyKm: distanceToPharmacyKm === null ? null : Number(distanceToPharmacyKm.toFixed(2)),
          recommendedDistanceKm: recommendedDistanceKm === null ? null : Number(recommendedDistanceKm.toFixed(2)),
        };
      })
      .sort((a, b) => {
        const aDist = Number.isFinite(a.recommendedDistanceKm) ? a.recommendedDistanceKm : Number.POSITIVE_INFINITY;
        const bDist = Number.isFinite(b.recommendedDistanceKm) ? b.recommendedDistanceKm : Number.POSITIVE_INFINITY;
        if (aDist !== bDist) return aDist - bDist;

        const aActive = Number(a.activeOrders || 0);
        const bActive = Number(b.activeOrders || 0);
        if (aActive !== bActive) return aActive - bActive;

        return String(a.name || '').localeCompare(String(b.name || ''));
      });

    res.json(rankedAgents);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /retailer/inventory — retailer's inventory
exports.getInventory = async (req, res) => {
  try {
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const inventory = await sequelize.query(
      `SELECT
        i.id, i.stock_quantity, i.reserved_quantity, i.reorder_level,
        i.max_capacity, i.last_restocked_at, i.last_updated,
        m.id AS medicine_id, m.name, m.salt_name, m.manufacturer,
        m.type, m.section, m.mrp::float, m.selling_price::float,
        m.requires_rx, m.images, m.description, m.hsn_code,
        NULLIF(array_to_string(m.images, ','), '') AS image,
        m.is_active,
        c.name AS category_name, c.icon_url AS category_icon
       FROM inventory i
       JOIN medicines m ON m.id = i.medicine_id
       LEFT JOIN categories c ON c.id = m.category_id
       WHERE i.retailer_id = :retailerId
       ORDER BY m.name ASC`,
      { type: QueryTypes.SELECT, replacements: { retailerId } }
    );

    res.json(inventory);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /retailer/inventory — add a medicine to inventory
exports.addToInventory = async (req, res) => {
  try {
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const { medicineId, stockQuantity, reorderLevel, maxCapacity } = req.body;

    // Validate medicine exists
    const med = await sequelize.query(
      `SELECT id, name FROM medicines WHERE id = :medicineId AND is_active = true`,
      { type: QueryTypes.SELECT, replacements: { medicineId } }
    );
    if (!med.length) return res.status(404).json({ message: 'Medicine not found on platform' });

    // Check if already in inventory
    const existing = await sequelize.query(
      `SELECT id FROM inventory WHERE retailer_id = :retailerId AND medicine_id = :medicineId`,
      { type: QueryTypes.SELECT, replacements: { retailerId, medicineId } }
    );
    if (existing.length) return res.status(400).json({ message: 'Medicine already in your inventory' });

    const result = await sequelize.query(
      `INSERT INTO inventory (retailer_id, medicine_id, stock_quantity, reorder_level, max_capacity, last_restocked_at)
       VALUES (:retailerId, :medicineId, :stockQuantity, :reorderLevel, :maxCapacity, CURRENT_TIMESTAMP)
       RETURNING id`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          retailerId,
          medicineId,
          stockQuantity: stockQuantity || 0,
          reorderLevel: reorderLevel || 10,
          maxCapacity: maxCapacity || 100,
        },
      }
    );

    res.status(201).json({ id: result[0]?.id, message: 'Added to inventory' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /retailer/inventory/:id — update inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const { stockQuantity, reorderLevel, maxCapacity } = req.body;

    const existing = await sequelize.query(
      `SELECT id FROM inventory WHERE id = :id AND retailer_id = :retailerId`,
      { type: QueryTypes.SELECT, replacements: { id: req.params.id, retailerId } }
    );
    if (!existing.length) return res.status(404).json({ message: 'Inventory item not found' });

    const fields = [];
    const replacements = { id: req.params.id };
    if (stockQuantity !== undefined) { fields.push('stock_quantity = :stockQuantity'); replacements.stockQuantity = stockQuantity; }
    if (reorderLevel !== undefined) { fields.push('reorder_level = :reorderLevel'); replacements.reorderLevel = reorderLevel; }
    if (maxCapacity !== undefined) { fields.push('max_capacity = :maxCapacity'); replacements.maxCapacity = maxCapacity; }
    if (stockQuantity !== undefined) { fields.push('last_restocked_at = CURRENT_TIMESTAMP'); }
    fields.push('last_updated = CURRENT_TIMESTAMP');

    await sequelize.query(
      `UPDATE inventory SET ${fields.join(', ')} WHERE id = :id`,
      { replacements }
    );

    res.json({ message: 'Inventory updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /retailer/inventory/:id
exports.deleteInventoryItem = async (req, res) => {
  try {
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const existing = await sequelize.query(
      `SELECT id FROM inventory WHERE id = :id AND retailer_id = :retailerId`,
      { type: QueryTypes.SELECT, replacements: { id: req.params.id, retailerId } }
    );
    if (!existing.length) return res.status(404).json({ message: 'Inventory item not found' });

    await sequelize.query(
      `DELETE FROM inventory WHERE id = :id`,
      { replacements: { id: req.params.id } }
    );

    res.json({ message: 'Removed from inventory' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /retailer/medicines/search — search platform medicines
exports.searchMedicines = async (req, res) => {
  try {
    const retailerId = await getRetailerId(req.user.id);
    if (!retailerId) return res.status(404).json({ message: 'Retailer profile not found' });

    const q = req.query.q || '';
    const categoryId = req.query.category || null;
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const offset = parseInt(req.query.offset) || 0;

    let whereClause = `WHERE m.is_active = true`;
    const replacements = { retailerId, limit, offset };

    if (q.trim()) {
      whereClause += ` AND (m.name ILIKE :search OR m.salt_name ILIKE :search OR m.manufacturer ILIKE :search)`;
      replacements.search = `%${q}%`;
    }
    if (categoryId) {
      whereClause += ` AND m.category_id = :categoryId`;
      replacements.categoryId = categoryId;
    }

    const medicines = await sequelize.query(
      `SELECT
        m.id, m.name, m.salt_name, m.manufacturer, m.type, m.section,
        m.mrp::float, m.selling_price::float, m.requires_rx, m.images, m.description, m.hsn_code,
        NULLIF(array_to_string(m.images, ','), '') AS image,
        c.name AS category_name, c.icon_url AS category_icon,
        CASE WHEN i.id IS NOT NULL THEN true ELSE false END AS already_in_inventory,
        i.stock_quantity AS current_stock,
        i.reorder_level AS current_reorder_level,
        i.id AS inventory_id
       FROM medicines m
       LEFT JOIN categories c ON c.id = m.category_id
       LEFT JOIN inventory i ON i.medicine_id = m.id AND i.retailer_id = :retailerId
       ${whereClause}
       ORDER BY m.name ASC
       LIMIT :limit OFFSET :offset`,
      { type: QueryTypes.SELECT, replacements }
    );

    const countRows = await sequelize.query(
      `SELECT COUNT(*)::int AS total FROM medicines m ${whereClause}`,
      { type: QueryTypes.SELECT, replacements }
    );

    res.json({ medicines, total: countRows[0]?.total || 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /retailer/categories — list all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await sequelize.query(
      `SELECT id, name, description, icon_url FROM categories ORDER BY name ASC`,
      { type: QueryTypes.SELECT }
    );
    res.json(categories);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
