const sequelize = require('../db');
const { QueryTypes } = require('sequelize');

const normalizeStatusForUi = (status) => {
  if (status === 'packing') return 'preparing';
  if (status === 'ready') return 'ready_for_pickup';
  if (status === 'picked_up') return 'in_transit';
  return status;
};

let ensureAgentLocationColumnsPromise = null;
let ensureOrderItemRetailerColumnPromise = null;

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

exports.getMyDeliveries = async (req, res) => {
  try {
    await ensureOrderItemRetailerColumn();
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
        o.total_amount::float AS total,
        o.delivery_address AS "deliveryAddress",
        o.placed_at AS "placedAt",
        o.delivered_at AS "deliveredAt",
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
      WHERE o.agent_id = :agentId
      ORDER BY o.placed_at DESC
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { agentId: req.user.id },
      }
    );

    const payload = rows.map((row) => ({
      ...row,
      status: normalizeStatusForUi(row.status),
      pickupPharmacy: {
        id: row.pickupShops?.[0]?.id || row.retailerId,
        name: row.pickupShops?.[0]?.name || row.retailerName,
        lat: row.pickupShops?.[0]?.lat || row.retailerLat,
        lng: row.pickupShops?.[0]?.lng || row.retailerLng,
      },
    }));

    res.json(payload);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.acceptDelivery = async (req, res) => {
  try {
    await ensureAgentLocationColumns();
    const orderRows = await sequelize.query(
      `
      SELECT id, agent_id, status
      FROM orders
      WHERE id = :orderId
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId: req.params.orderId },
      }
    );
    const order = orderRows[0] || null;
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.agent_id !== req.user.id) {
      return res.status(403).json({ message: 'This delivery is not assigned to you' });
    }

    const acceptableStatuses = ['ready', 'ready_for_pickup', 'confirmed'];
    if (!acceptableStatuses.includes(order.status)) {
      return res.status(400).json({ message: 'This delivery cannot be accepted in current status' });
    }

    await sequelize.query(
      `
      UPDATE orders
      SET status = 'in_transit'
      WHERE id = :orderId
      `,
      {
        replacements: { orderId: order.id },
      }
    );

    await sequelize.query(
      `
      UPDATE agent_locations
      SET current_order_id = :orderId,
          is_online = TRUE,
          updated_at = CURRENT_TIMESTAMP
      WHERE agent_id = :agentId
      `,
      {
        replacements: {
          orderId: order.id,
          agentId: req.user.id,
        },
      }
    );

    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', { orderId: order.id, status: 'in_transit' });

    res.json({ id: order.id, status: 'in_transit', message: 'Delivery accepted and marked in transit' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.rejectDelivery = async (req, res) => {
  try {
    await ensureAgentLocationColumns();

    const orderRows = await sequelize.query(
      `
      SELECT id, agent_id, status
      FROM orders
      WHERE id = :orderId
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId: req.params.orderId },
      }
    );

    const order = orderRows[0] || null;
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.agent_id !== req.user.id) {
      return res.status(403).json({ message: 'This pickup is not assigned to you' });
    }

    const rejectableStatuses = ['ready', 'ready_for_pickup', 'confirmed'];
    if (!rejectableStatuses.includes(order.status)) {
      return res.status(400).json({ message: 'This pickup can no longer be rejected' });
    }

    await sequelize.query(
      `
      UPDATE orders
      SET agent_id = NULL,
          status = CAST(CASE WHEN status = 'confirmed' THEN 'confirmed' ELSE 'ready' END AS order_status)
      WHERE id = :orderId
      `,
      {
        replacements: { orderId: order.id },
      }
    );

    await sequelize.query(
      `
      UPDATE agent_locations
      SET current_order_id = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE agent_id = :agentId
        AND current_order_id = :orderId
      `,
      {
        replacements: {
          agentId: req.user.id,
          orderId: order.id,
        },
      }
    );

    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', { orderId: order.id, status: 'ready_for_pickup' });
    io.to(`agent_${req.user.id}`).emit('delivery_rejected', { orderId: order.id });

    res.json({
      id: order.id,
      status: 'ready_for_pickup',
      message: 'Pickup request rejected. The retailer can assign another agent.',
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.setOnlineStatus = async (req, res) => {
  try {
    const { isOnline, lat = 0, lng = 0 } = req.body;
    await sequelize.query(
      `
      INSERT INTO agent_locations (agent_id, lat, lng, is_online, updated_at)
      VALUES (:agentId, :lat, :lng, :isOnline, CURRENT_TIMESTAMP)
      ON CONFLICT (agent_id)
      DO UPDATE SET
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        is_online = EXCLUDED.is_online,
        updated_at = CURRENT_TIMESTAMP
      `,
      {
        replacements: {
          agentId: req.user.id,
          lat,
          lng,
          isOnline,
        },
      }
    );
    res.json({ message: 'Status updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPerformance = async (req, res) => {
  try {
    await ensureOrderItemRetailerColumn();

    const rows = await sequelize.query(
      `
      WITH base AS (
        SELECT
          o.id,
          o.status,
          o.total_amount,
          o.placed_at,
          o.delivered_at,
          COALESCE(
            (
              SELECT COUNT(DISTINCT COALESCE(oi.retailer_id, o.retailer_id))
              FROM order_items oi
              WHERE oi.order_id = o.id
            ),
            1
          ) AS shop_stops
        FROM orders o
        WHERE o.agent_id = :agentId
      )
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered,
        COUNT(*) FILTER (WHERE status IN ('in_transit', 'picked_up'))::int AS in_transit,
        COUNT(*) FILTER (WHERE status IN ('ready', 'confirmed'))::int AS ready_for_pickup,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
        COUNT(*) FILTER (WHERE status = 'delivered' AND delivered_at::date = CURRENT_DATE)::int AS delivered_today,
        COUNT(*) FILTER (WHERE placed_at::date = CURRENT_DATE)::int AS assigned_today,
        COUNT(*) FILTER (WHERE shop_stops > 1)::int AS multi_shop_orders,
        COALESCE(SUM(total_amount), 0)::float AS gross_value,
        COALESCE(AVG(total_amount) FILTER (WHERE status = 'delivered'), 0)::float AS avg_delivered_value,
        COALESCE(
          AVG(GREATEST(EXTRACT(EPOCH FROM (delivered_at - placed_at)) / 60, 0))
          FILTER (WHERE status = 'delivered' AND delivered_at IS NOT NULL AND placed_at IS NOT NULL),
          0
        )::float AS avg_delivery_minutes
      FROM base
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { agentId: req.user.id },
      }
    );

    const trendRows = await sequelize.query(
      `
      SELECT
        TO_CHAR(day::date, 'Dy') AS label,
        day::date AS date,
        COALESCE(stats.count, 0)::int AS count
      FROM generate_series(
        (CURRENT_DATE - INTERVAL '6 day')::date,
        CURRENT_DATE::date,
        INTERVAL '1 day'
      ) AS day
      LEFT JOIN (
        SELECT delivered_at::date AS delivered_date, COUNT(*)::int AS count
        FROM orders
        WHERE agent_id = :agentId
          AND status = 'delivered'
          AND delivered_at >= (CURRENT_DATE - INTERVAL '6 day')
        GROUP BY delivered_at::date
      ) stats ON stats.delivered_date = day::date
      ORDER BY day::date ASC
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { agentId: req.user.id },
      }
    );

    const locationRows = await sequelize.query(
      `
      SELECT
        is_online AS "isOnline",
        lat,
        lng,
        updated_at AS "lastLocationUpdate",
        current_order_id AS "currentOrderId"
      FROM agent_locations
      WHERE agent_id = :agentId
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { agentId: req.user.id },
      }
    );

    const stats = rows[0] || {
      total: 0,
      delivered: 0,
      in_transit: 0,
      ready_for_pickup: 0,
      cancelled: 0,
      delivered_today: 0,
      assigned_today: 0,
      multi_shop_orders: 0,
      gross_value: 0,
      avg_delivered_value: 0,
      avg_delivery_minutes: 0,
    };
    const total = Number(stats.total || 0);
    const delivered = Number(stats.delivered || 0);
    const inTransit = Number(stats.in_transit || 0);

    res.json({
      total,
      delivered,
      inTransit,
      readyForPickup: Number(stats.ready_for_pickup || 0),
      cancelled: Number(stats.cancelled || 0),
      deliveredToday: Number(stats.delivered_today || 0),
      assignedToday: Number(stats.assigned_today || 0),
      multiShopOrders: Number(stats.multi_shop_orders || 0),
      grossValue: Number(stats.gross_value || 0),
      avgDeliveredValue: Number(stats.avg_delivered_value || 0),
      avgDeliveryMinutes: Number(stats.avg_delivery_minutes || 0),
      successRate: total ? +((delivered / total) * 100).toFixed(1) : 0,
      trendLast7Days: trendRows.map((row) => ({
        ...row,
        count: Number(row.count || 0),
      })),
      liveLocation: locationRows[0] || null,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getHistory = async (req, res) => {
  try {
    await ensureOrderItemRetailerColumn();

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const statusFilter = String(req.query.status || '').trim();

    const replacements = { agentId: req.user.id, limit, offset };
    let where = 'WHERE o.agent_id = :agentId';

    if (statusFilter) {
      const mapUiToDb = {
        preparing: 'packing',
        ready_for_pickup: 'ready',
        in_transit: 'in_transit',
      };
      replacements.statusFilter = mapUiToDb[statusFilter] || statusFilter;
      where += ' AND o.status = :statusFilter';
    }

    const countRows = await sequelize.query(
      `SELECT COUNT(*)::int AS total FROM orders o ${where}`,
      {
        type: QueryTypes.SELECT,
        replacements,
      }
    );

    const rows = await sequelize.query(
      `
      SELECT
        o.id,
        o.order_number AS "orderId",
        o.status,
        o.total_amount::float AS total,
        o.payment_status AS "paymentStatus",
        o.delivery_address AS "deliveryAddress",
        o.placed_at AS "placedAt",
        o.delivered_at AS "deliveredAt",
        u.name AS "customerName",
        u.phone AS "customerPhone",
        COALESCE(item_stats.item_count, 0)::int AS "itemCount",
        COALESCE(item_stats.shop_stops, 0)::int AS "shopStops",
        COALESCE(item_stats.items, '[]'::json) AS items,
        COALESCE(item_stats.shops, '[]'::json) AS "pickupShops"
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      LEFT JOIN LATERAL (
        SELECT
          COALESCE(SUM(oi.quantity), 0) AS item_count,
          COUNT(DISTINCT COALESCE(oi.retailer_id, o.retailer_id)) AS shop_stops,
          COALESCE(
            json_agg(
              json_build_object(
                'name', m.name,
                'quantity', oi.quantity,
                'sourceRetailerName', rr.shop_name
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::json
          ) AS items,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', COALESCE(oi.retailer_id, o.retailer_id),
                'name', rr.shop_name
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::json
          ) AS shops
        FROM order_items oi
        LEFT JOIN medicines m ON m.id = oi.medicine_id
        LEFT JOIN retailers rr ON rr.id = COALESCE(oi.retailer_id, o.retailer_id)
        WHERE oi.order_id = o.id
      ) item_stats ON TRUE
      ${where}
      ORDER BY COALESCE(o.delivered_at, o.placed_at) DESC
      LIMIT :limit OFFSET :offset
      `,
      {
        type: QueryTypes.SELECT,
        replacements,
      }
    );

    const history = rows.map((row) => {
      const placedAt = row.placedAt ? new Date(row.placedAt) : null;
      const deliveredAt = row.deliveredAt ? new Date(row.deliveredAt) : null;
      let deliveryMinutes = null;

      if (placedAt && deliveredAt && !Number.isNaN(placedAt.getTime()) && !Number.isNaN(deliveredAt.getTime())) {
        deliveryMinutes = Math.max(0, Math.round((deliveredAt.getTime() - placedAt.getTime()) / 60000));
      }

      return {
        ...row,
        status: normalizeStatusForUi(row.status),
        deliveryMinutes,
      };
    });

    const total = Number(countRows[0]?.total || 0);
    res.json({
      history,
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
