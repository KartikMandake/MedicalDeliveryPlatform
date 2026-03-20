-- Deterministic UUIDs make frontend integration easier while developing.

INSERT INTO categories (id, name, description, icon_url)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Pain Relief', 'Pain management medicines', '/icons/pain.png'),
    ('00000000-0000-0000-0000-000000000002', 'Cold & Flu', 'Cold and flu medicines', '/icons/cold.png'),
    ('00000000-0000-0000-0000-000000000003', 'Wellness', 'Vitamins and supplements', '/icons/wellness.png')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medicines (
    id, name, salt_name, manufacturer, category_id, type, section, mrp, selling_price, requires_rx, description, images, hsn_code, is_active
)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Paracetamol 650',
        'Paracetamol',
        'MediPharm Labs',
        '00000000-0000-0000-0000-000000000001',
        'tablet',
        'medicine',
        45.00,
        39.00,
        FALSE,
        'Fever and mild pain relief.',
        ARRAY['/products/paracetamol-650-1.png'],
        '30049099',
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'Cough Syrup Plus',
        'Dextromethorphan',
        'HealthNova',
        '00000000-0000-0000-0000-000000000002',
        'syrup',
        'medicine',
        120.00,
        99.00,
        FALSE,
        'Dry cough suppressant syrup.',
        ARRAY['/products/cough-syrup-plus-1.png'],
        '30044900',
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Vitamin C 500',
        'Ascorbic Acid',
        'NutriWell',
        '00000000-0000-0000-0000-000000000003',
        'tablet',
        'wellness',
        199.00,
        159.00,
        FALSE,
        'Daily immunity support.',
        ARRAY['/products/vitamin-c-500-1.png'],
        '21069099',
        TRUE
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, phone, name, email, role, status, fcm_token)
VALUES
    ('20000000-0000-0000-0000-000000000001', '+919900000001', 'Aarav Mehta', 'aarav@example.com', 'user', 'active', 'fcm-user-001'),
    ('20000000-0000-0000-0000-000000000002', '+919900000002', 'CityCare Pharmacy Owner', 'retailer@example.com', 'retailer', 'active', 'fcm-retailer-001'),
    ('20000000-0000-0000-0000-000000000003', '+919900000003', 'Riya Sharma', 'agent1@example.com', 'agent', 'active', 'fcm-agent-001'),
    ('20000000-0000-0000-0000-000000000004', '+919900000004', 'Karan Singh', 'agent2@example.com', 'agent', 'active', 'fcm-agent-002'),
    ('20000000-0000-0000-0000-000000000005', '+919900000005', 'Ops Admin', 'admin@example.com', 'admin', 'active', 'fcm-admin-001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO carts (id, user_id, is_active)
VALUES ('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cart_items (id, cart_id, medicine_id, quantity, unit_price, total_price)
VALUES
    ('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, 39.00, 39.00),
    ('80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 1, 159.00, 159.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO retailers (
    id,
    user_id,
    shop_name,
    drug_license,
    gstin,
    lat,
    lng,
    radius_km,
    is_open,
    kyc_status,
    bank_account
)
VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000002',
        'CityCare Pharmacy',
        'DL-29-AB-12345',
        '29ABCDE1234F1Z1',
        12.9716,
        77.5946,
        8.0,
        TRUE,
        'approved',
        '{"account_holder": "CityCare Pharmacy", "bank": "HDFC", "ifsc": "HDFC0001234", "account": "XXXX1234"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (
    id,
    order_number,
    user_id,
    retailer_id,
    agent_id,
    status,
    delivery_address,
    subtotal,
    delivery_fee,
    total_amount,
    pickup_otp,
    delivery_otp,
    prescription_url,
    razorpay_order_id,
    payment_status,
    placed_at,
    delivered_at
)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        'ORD-1001',
        '20000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000003',
        'in_transit',
        '{"name": "Aarav Mehta", "line1": "12 MG Road", "city": "Bengaluru", "pincode": "560001", "lat": 12.9753, "lng": 77.6067}'::jsonb,
        198.00,
        35.00,
        233.00,
        '592184',
        '284915',
        NULL,
        'razorpay_ord_1001',
        'paid',
        CURRENT_TIMESTAMP - INTERVAL '45 minutes',
        NULL
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        'ORD-1002',
        '20000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000004',
        'packing',
        '{"name": "Aarav Mehta", "line1": "12 MG Road", "city": "Bengaluru", "pincode": "560001", "lat": 12.9753, "lng": 77.6067}'::jsonb,
        159.00,
        25.00,
        184.00,
        '773911',
        '113790',
        NULL,
        'razorpay_ord_1002',
        'paid',
        CURRENT_TIMESTAMP - INTERVAL '20 minutes',
        NULL
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        'ORD-1003',
        '20000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000004',
        'delivered',
        '{"name": "Aarav Mehta", "line1": "12 MG Road", "city": "Bengaluru", "pincode": "560001", "lat": 12.9753, "lng": 77.6067}'::jsonb,
        39.00,
        20.00,
        59.00,
        '224466',
        '664422',
        NULL,
        'razorpay_ord_1003',
        'paid',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '23 hours'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, medicine_id, quantity, unit_price, total_price)
VALUES
    ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 2, 39.00, 78.00),
    ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 1, 99.00, 99.00),
    ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 1, 159.00, 159.00),
    ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 1, 39.00, 39.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO agent_locations (agent_id, lat, lng, is_online, updated_at)
VALUES
    ('20000000-0000-0000-0000-000000000003', 12.9795, 77.6001, TRUE, CURRENT_TIMESTAMP - INTERVAL '15 seconds'),
    ('20000000-0000-0000-0000-000000000004', 12.9718, 77.5937, TRUE, CURRENT_TIMESTAMP - INTERVAL '55 seconds')
ON CONFLICT (agent_id) DO UPDATE
SET
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    is_online = EXCLUDED.is_online,
    updated_at = EXCLUDED.updated_at;

INSERT INTO transactions (id, order_id, type, entity_type, amount, status, razorpay_ref)
VALUES
    ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'payment', 'user', 233.00, 'completed', 'pay_1001'),
    ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'payout', 'retailer', 190.00, 'pending', 'payout_1001_r'),
    ('60000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'payout', 'agent', 25.00, 'pending', 'payout_1001_a'),
    ('60000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003', 'payment', 'user', 59.00, 'completed', 'pay_1003')
ON CONFLICT (id) DO NOTHING;
