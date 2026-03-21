-- postgresql://postgres:OHazcYapNNAuTjtiMCrnJiViEpHNImix@ballast.proxy.rlwy.net:36050/railway

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medicine_type') THEN
        CREATE TYPE medicine_type AS ENUM ('tablet', 'syrup', 'injection', 'drops', 'cream', 'device');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medicine_section') THEN
        CREATE TYPE medicine_section AS ENUM ('medicine', 'self_care', 'cosmetic', 'wellness');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'retailer', 'agent', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_kyc');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
        CREATE TYPE kyc_status AS ENUM ('pending', 'approved');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('placed', 'confirmed', 'packing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('payment', 'payout', 'refund');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_entity_type') THEN
        CREATE TYPE transaction_entity_type AS ENUM ('user', 'retailer', 'agent');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('pending', 'completed');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT
);

CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    salt_name VARCHAR(255),
    manufacturer VARCHAR(255),
    category_id UUID REFERENCES categories(id),
    type medicine_type,
    section medicine_section,
    mrp DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    requires_rx BOOLEAN DEFAULT FALSE,
    description TEXT,
    images TEXT[],
    hsn_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role user_role,
    status user_status,
    fcm_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cart_id, medicine_id)
);

CREATE TABLE IF NOT EXISTS retailers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    shop_name VARCHAR(255),
    drug_license VARCHAR(100),
    gstin VARCHAR(15),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_km FLOAT,
    is_open BOOLEAN DEFAULT TRUE,
    kyc_status kyc_status,
    bank_account JSONB
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE,
    user_id UUID REFERENCES users(id),
    retailer_id UUID REFERENCES retailers(id),
    agent_id UUID REFERENCES users(id),
    status order_status,
    delivery_address JSONB,
    subtotal DECIMAL(12,2),
    delivery_fee DECIMAL(12,2),
    total_amount DECIMAL(12,2),
    pickup_otp VARCHAR(6),
    delivery_otp VARCHAR(6),
    prescription_url TEXT,
    razorpay_order_id VARCHAR(100),
    payment_status payment_status,
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    medicine_id UUID REFERENCES medicines(id),
    quantity INTEGER,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2)
);

CREATE TABLE IF NOT EXISTS agent_locations (
    agent_id UUID PRIMARY KEY REFERENCES users(id),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    is_online BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    type transaction_type,
    entity_type transaction_entity_type,
    amount DECIMAL(12,2),
    status transaction_status,
    razorpay_ref VARCHAR(100)
);

-- Helper function for agent app pings.
CREATE OR REPLACE FUNCTION upsert_agent_location(
    p_agent_id UUID,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_is_online BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO agent_locations (agent_id, lat, lng, is_online, updated_at)
    VALUES (p_agent_id, p_lat, p_lng, p_is_online, CURRENT_TIMESTAMP)
    ON CONFLICT (agent_id)
    DO UPDATE SET
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        is_online = EXCLUDED.is_online,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_agent_id ON orders(agent_id);
CREATE INDEX IF NOT EXISTS idx_orders_retailer_id ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_agent_locations_updated_at ON agent_locations(updated_at);
CREATE INDEX IF NOT EXISTS idx_retailers_lat_lng ON retailers(lat, lng);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_cart_per_user ON carts(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
