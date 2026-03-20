-- 1) Live order tracking feed for customer app.
-- For picked_up/in_transit we return live agent coordinates.
SELECT
    o.id,
    o.order_number,
    o.status,
    o.placed_at,
    o.delivered_at,
    o.delivery_address,
    u.name AS agent_name,
    al.lat AS agent_lat,
    al.lng AS agent_lng,
    al.is_online AS agent_online,
    al.updated_at AS agent_last_ping,
    CASE
        WHEN o.status IN ('picked_up', 'in_transit') THEN 'agent_live_location'
        WHEN o.status IN ('confirmed', 'packing', 'ready') THEN 'retailer_stage'
        WHEN o.status = 'delivered' THEN 'delivered'
        ELSE 'status_only'
    END AS tracking_mode
FROM orders o
LEFT JOIN users u ON u.id = o.agent_id
LEFT JOIN agent_locations al ON al.agent_id = o.agent_id
WHERE o.order_number = 'ORD-1001';

-- 2) Retailer/ops queue: what should happen next.
SELECT
    o.order_number,
    o.status,
    o.payment_status,
    CASE
        WHEN o.status = 'placed' THEN 'Confirm order'
        WHEN o.status = 'confirmed' THEN 'Start packing'
        WHEN o.status = 'packing' THEN 'Mark ready for pickup'
        WHEN o.status = 'ready' THEN 'Assign pickup agent'
        WHEN o.status = 'picked_up' THEN 'Agent moving to destination'
        WHEN o.status = 'in_transit' THEN 'Monitor ETA and support'
        WHEN o.status = 'delivered' THEN 'Close order'
        WHEN o.status = 'cancelled' THEN 'Reverse ledger if needed'
        ELSE 'Manual review'
    END AS next_action
FROM orders o
ORDER BY o.placed_at DESC;

-- 3) Update an order status and pull live location in one shot.
-- Replace values as needed in app service.
BEGIN;

UPDATE orders
SET status = 'in_transit'
WHERE id = '40000000-0000-0000-0000-000000000002';

SELECT upsert_agent_location(
    '20000000-0000-0000-0000-000000000004',
    12.9739,
    77.6022,
    TRUE
);

COMMIT;

-- 4) Nearby online agents for assignment (within 3 km of retailer).
-- Uses Haversine formula so PostGIS is not required.
SELECT
    u.id AS agent_id,
    u.name AS agent_name,
    al.lat,
    al.lng,
        ROUND((
            6371 * ACOS(
                COS(RADIANS(r.lat))
                * COS(RADIANS(al.lat))
                * COS(RADIANS(al.lng) - RADIANS(r.lng))
                + SIN(RADIANS(r.lat)) * SIN(RADIANS(al.lat))
            )
        )::numeric, 2) AS distance_km
FROM users u
JOIN agent_locations al ON al.agent_id = u.id
JOIN retailers r ON r.id = '30000000-0000-0000-0000-000000000001'
WHERE u.role = 'agent'
  AND al.is_online = TRUE
    AND (
            6371 * ACOS(
                COS(RADIANS(r.lat))
                * COS(RADIANS(al.lat))
                * COS(RADIANS(al.lng) - RADIANS(r.lng))
                + SIN(RADIANS(r.lat)) * SIN(RADIANS(al.lat))
            )
    ) <= 3
ORDER BY distance_km ASC;
