--
-- PostgreSQL database dump
--

\restrict czyRxTVNp6ceH49jUgXch7qDYvUU18RonUaLqi6dpwewBIYcgU1N3kie0rcnXQW

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.3

-- Started on 2026-03-25 14:36:34

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3669 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 941 (class 1247 OID 16732)
-- Name: enum_orders_paymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_orders_paymentStatus" AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);


ALTER TYPE public."enum_orders_paymentStatus" OWNER TO postgres;

--
-- TOC entry 938 (class 1247 OID 16717)
-- Name: enum_orders_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_orders_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'in_transit',
    'delivered',
    'cancelled'
);


ALTER TYPE public.enum_orders_status OWNER TO postgres;

--
-- TOC entry 950 (class 1247 OID 16823)
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_role AS ENUM (
    'user',
    'retailer',
    'agent',
    'admin'
);


ALTER TYPE public.enum_users_role OWNER TO postgres;

--
-- TOC entry 953 (class 1247 OID 16832)
-- Name: enum_users_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_status AS ENUM (
    'active',
    'suspended',
    'pending_kyc'
);


ALTER TYPE public.enum_users_status OWNER TO postgres;

--
-- TOC entry 893 (class 1247 OID 16442)
-- Name: kyc_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.kyc_status AS ENUM (
    'pending',
    'approved'
);


ALTER TYPE public.kyc_status OWNER TO postgres;

--
-- TOC entry 884 (class 1247 OID 16414)
-- Name: medicine_section; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medicine_section AS ENUM (
    'medicine',
    'self_care',
    'cosmetic',
    'wellness'
);


ALTER TYPE public.medicine_section OWNER TO postgres;

--
-- TOC entry 881 (class 1247 OID 16401)
-- Name: medicine_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medicine_type AS ENUM (
    'tablet',
    'syrup',
    'injection',
    'drops',
    'cream',
    'device'
);


ALTER TYPE public.medicine_type OWNER TO postgres;

--
-- TOC entry 896 (class 1247 OID 16448)
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'placed',
    'confirmed',
    'packing',
    'ready',
    'picked_up',
    'in_transit',
    'delivered',
    'cancelled'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- TOC entry 899 (class 1247 OID 16466)
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'refunded',
    'failed'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- TOC entry 905 (class 1247 OID 16484)
-- Name: transaction_entity_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_entity_type AS ENUM (
    'user',
    'retailer',
    'agent'
);


ALTER TYPE public.transaction_entity_type OWNER TO postgres;

--
-- TOC entry 908 (class 1247 OID 16492)
-- Name: transaction_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_status AS ENUM (
    'pending',
    'completed'
);


ALTER TYPE public.transaction_status OWNER TO postgres;

--
-- TOC entry 902 (class 1247 OID 16476)
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_type AS ENUM (
    'payment',
    'payout',
    'refund'
);


ALTER TYPE public.transaction_type OWNER TO postgres;

--
-- TOC entry 887 (class 1247 OID 16424)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'retailer',
    'agent',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 890 (class 1247 OID 16434)
-- Name: user_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'suspended',
    'pending_kyc'
);


ALTER TYPE public.user_status OWNER TO postgres;

--
-- TOC entry 248 (class 1255 OID 16787)
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN NEW.last_updated = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp() OWNER TO postgres;

--
-- TOC entry 247 (class 1255 OID 16665)
-- Name: upsert_agent_location(uuid, double precision, double precision, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.upsert_agent_location(p_agent_id uuid, p_lat double precision, p_lng double precision, p_is_online boolean) RETURNS void
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


ALTER FUNCTION public.upsert_agent_location(p_agent_id uuid, p_lat double precision, p_lng double precision, p_is_online boolean) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 227 (class 1259 OID 16640)
-- Name: agent_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_locations (
    agent_id uuid NOT NULL,
    lat double precision,
    lng double precision,
    is_online boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    current_order_id uuid
);


ALTER TABLE public.agent_locations OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16554)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    cart_id uuid NOT NULL,
    medicine_id uuid,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total_price numeric(12,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ecommerce_product_id uuid,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT check_single_cart_item_type CHECK ((((medicine_id IS NOT NULL) AND (ecommerce_product_id IS NULL)) OR ((medicine_id IS NULL) AND (ecommerce_product_id IS NOT NULL))))
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16537)
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16497)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon_url text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16893)
-- Name: ecommerce_product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ecommerce_product_variants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    ecommerce_product_id uuid,
    variant_name character varying(100),
    additional_price numeric(12,2) DEFAULT 0.00
);


ALTER TABLE public.ecommerce_product_variants OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16872)
-- Name: ecommerce_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ecommerce_products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    brand character varying(100),
    category_id uuid,
    mrp numeric(12,2) NOT NULL,
    selling_price numeric(12,2) NOT NULL,
    description text,
    images text[],
    average_rating numeric(3,2) DEFAULT 0.0,
    total_reviews integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ecommerce_products OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16749)
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    retailer_id uuid NOT NULL,
    medicine_id uuid,
    stock_quantity integer NOT NULL,
    reserved_quantity integer DEFAULT 0,
    reorder_level integer DEFAULT 10,
    max_capacity integer,
    last_restocked_at timestamp without time zone,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ecommerce_product_id uuid,
    CONSTRAINT check_inventory_item_type CHECK ((((medicine_id IS NOT NULL) AND (ecommerce_product_id IS NULL)) OR ((medicine_id IS NULL) AND (ecommerce_product_id IS NOT NULL)))),
    CONSTRAINT inventory_stock_quantity_check CHECK ((stock_quantity >= 0))
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16507)
-- Name: medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    salt_name text,
    manufacturer character varying(255),
    category_id uuid,
    type public.medicine_type,
    section public.medicine_section,
    mrp numeric(12,2),
    selling_price numeric(12,2),
    requires_rx boolean DEFAULT false,
    description text,
    images text[],
    hsn_code character varying(20),
    is_active boolean DEFAULT true
);


ALTER TABLE public.medicines OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16985)
-- Name: inventory_pulse; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.inventory_pulse AS
 SELECT COALESCE(m.name, (ep.name)::character varying) AS name,
    i.stock_quantity,
    i.max_capacity
   FROM ((public.inventory i
     LEFT JOIN public.medicines m ON ((i.medicine_id = m.id)))
     LEFT JOIN public.ecommerce_products ep ON ((i.ecommerce_product_id = ep.id)));


ALTER VIEW public.inventory_pulse OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16993)
-- Name: low_stock_items; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.low_stock_items AS
 SELECT COALESCE(m.name, (ep.name)::character varying) AS name,
    i.stock_quantity,
    i.reorder_level
   FROM ((public.inventory i
     LEFT JOIN public.medicines m ON ((i.medicine_id = m.id)))
     LEFT JOIN public.ecommerce_products ep ON ((i.ecommerce_product_id = ep.id)))
  WHERE (i.stock_quantity <= i.reorder_level);


ALTER VIEW public.low_stock_items OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16623)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    medicine_id uuid,
    quantity integer,
    unit_price numeric(12,2),
    total_price numeric(12,2),
    retailer_id uuid,
    ecommerce_product_id uuid,
    CONSTRAINT check_single_order_item_type CHECK ((((medicine_id IS NOT NULL) AND (ecommerce_product_id IS NULL)) OR ((medicine_id IS NULL) AND (ecommerce_product_id IS NOT NULL))))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16596)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying(50),
    user_id uuid,
    retailer_id uuid,
    agent_id uuid,
    status public.order_status,
    delivery_address jsonb,
    subtotal numeric(12,2),
    delivery_fee numeric(12,2),
    total_amount numeric(12,2),
    pickup_otp character varying(6),
    delivery_otp character varying(6),
    prescription_url text,
    razorpay_order_id character varying(100),
    payment_status public.payment_status,
    placed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delivered_at timestamp without time zone
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16852)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    brand character varying(255) NOT NULL,
    description text,
    category character varying(255) NOT NULL,
    price double precision NOT NULL,
    stock integer DEFAULT 0,
    "requiresPrescription" boolean DEFAULT false,
    image character varying(255),
    rating double precision DEFAULT '0'::double precision,
    "reviewCount" integer DEFAULT 0,
    "retailerId" uuid,
    tags character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16581)
-- Name: retailers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.retailers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    shop_name character varying(255),
    drug_license character varying(100),
    gstin character varying(15),
    lat double precision,
    lng double precision,
    radius_km double precision,
    is_open boolean DEFAULT true,
    kyc_status public.kyc_status,
    bank_account jsonb
);


ALTER TABLE public.retailers OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16653)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    type public.transaction_type,
    entity_type public.transaction_entity_type,
    amount numeric(12,2),
    status public.transaction_status,
    razorpay_ref character varying(100)
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16800)
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_addresses (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    label character varying(255) DEFAULT 'Home'::character varying NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    line_1 character varying(255) NOT NULL,
    line_2 character varying(255),
    city character varying(255) NOT NULL,
    state character varying(255) NOT NULL,
    pincode character varying(255) NOT NULL,
    landmark character varying(255),
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    lat double precision,
    lng double precision
);


ALTER TABLE public.user_addresses OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16839)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying(255),
    email character varying(255),
    password_hash character varying(255),
    phone character varying(255) DEFAULT ''::character varying NOT NULL,
    address text DEFAULT ''::text,
    role public.enum_users_role DEFAULT 'user'::public.enum_users_role,
    status public.enum_users_status DEFAULT 'active'::public.enum_users_status,
    fcm_token text,
    created_at timestamp with time zone,
    google_id text,
    profile_pic text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3478 (class 2606 OID 16647)
-- Name: agent_locations agent_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_locations
    ADD CONSTRAINT agent_locations_pkey PRIMARY KEY (agent_id);


--
-- TOC entry 3461 (class 2606 OID 16570)
-- Name: cart_items cart_items_cart_id_medicine_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_medicine_id_key UNIQUE (cart_id, medicine_id);


--
-- TOC entry 3463 (class 2606 OID 16568)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3458 (class 2606 OID 16548)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 3454 (class 2606 OID 16506)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3499 (class 2606 OID 16901)
-- Name: ecommerce_product_variants ecommerce_product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_product_variants
    ADD CONSTRAINT ecommerce_product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 3497 (class 2606 OID 16887)
-- Name: ecommerce_products ecommerce_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_products
    ADD CONSTRAINT ecommerce_products_pkey PRIMARY KEY (id);


--
-- TOC entry 3483 (class 2606 OID 16762)
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- TOC entry 3485 (class 2606 OID 16946)
-- Name: inventory inventory_retailer_item_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_retailer_item_unique UNIQUE (retailer_id, medicine_id, ecommerce_product_id);


--
-- TOC entry 3456 (class 2606 OID 16518)
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (id);


--
-- TOC entry 3476 (class 2606 OID 16629)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3472 (class 2606 OID 16607)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 3474 (class 2606 OID 16605)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3495 (class 2606 OID 16870)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3467 (class 2606 OID 16590)
-- Name: retailers retailers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retailers
    ADD CONSTRAINT retailers_pkey PRIMARY KEY (id);


--
-- TOC entry 3481 (class 2606 OID 16659)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3487 (class 2606 OID 16776)
-- Name: inventory unique_retailer_medicine; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT unique_retailer_medicine UNIQUE (retailer_id, medicine_id);


--
-- TOC entry 3489 (class 2606 OID 16820)
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 3491 (class 2606 OID 17023)
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- TOC entry 3493 (class 2606 OID 16851)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3479 (class 1259 OID 16669)
-- Name: idx_agent_locations_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_locations_updated_at ON public.agent_locations USING btree (updated_at);


--
-- TOC entry 3464 (class 1259 OID 16672)
-- Name: idx_cart_items_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_cart_id ON public.cart_items USING btree (cart_id);


--
-- TOC entry 3459 (class 1259 OID 16671)
-- Name: idx_one_active_cart_per_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_one_active_cart_per_user ON public.carts USING btree (user_id) WHERE (is_active = true);


--
-- TOC entry 3468 (class 1259 OID 16667)
-- Name: idx_orders_agent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_agent_id ON public.orders USING btree (agent_id);


--
-- TOC entry 3469 (class 1259 OID 16668)
-- Name: idx_orders_retailer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_retailer_id ON public.orders USING btree (retailer_id);


--
-- TOC entry 3470 (class 1259 OID 16666)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 3465 (class 1259 OID 16670)
-- Name: idx_retailers_lat_lng; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_retailers_lat_lng ON public.retailers USING btree (lat, lng);


--
-- TOC entry 3514 (class 2620 OID 16788)
-- Name: inventory update_inventory_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_inventory_timestamp BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- TOC entry 3501 (class 2606 OID 16571)
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- TOC entry 3502 (class 2606 OID 16907)
-- Name: cart_items cart_items_ecommerce_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_ecommerce_product_id_fkey FOREIGN KEY (ecommerce_product_id) REFERENCES public.ecommerce_products(id);


--
-- TOC entry 3503 (class 2606 OID 16576)
-- Name: cart_items cart_items_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- TOC entry 3513 (class 2606 OID 16902)
-- Name: ecommerce_product_variants ecommerce_product_variants_ecommerce_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_product_variants
    ADD CONSTRAINT ecommerce_product_variants_ecommerce_product_id_fkey FOREIGN KEY (ecommerce_product_id) REFERENCES public.ecommerce_products(id) ON DELETE CASCADE;


--
-- TOC entry 3512 (class 2606 OID 16888)
-- Name: ecommerce_products ecommerce_products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_products
    ADD CONSTRAINT ecommerce_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 3509 (class 2606 OID 16939)
-- Name: inventory inventory_ecommerce_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_ecommerce_product_id_fkey FOREIGN KEY (ecommerce_product_id) REFERENCES public.ecommerce_products(id);


--
-- TOC entry 3510 (class 2606 OID 16770)
-- Name: inventory inventory_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- TOC entry 3511 (class 2606 OID 16765)
-- Name: inventory inventory_retailer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_retailer_id_fkey FOREIGN KEY (retailer_id) REFERENCES public.retailers(id);


--
-- TOC entry 3500 (class 2606 OID 16519)
-- Name: medicines medicines_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 3505 (class 2606 OID 16913)
-- Name: order_items order_items_ecommerce_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_ecommerce_product_id_fkey FOREIGN KEY (ecommerce_product_id) REFERENCES public.ecommerce_products(id);


--
-- TOC entry 3506 (class 2606 OID 16635)
-- Name: order_items order_items_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- TOC entry 3507 (class 2606 OID 16630)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 3504 (class 2606 OID 16613)
-- Name: orders orders_retailer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_retailer_id_fkey FOREIGN KEY (retailer_id) REFERENCES public.retailers(id);


--
-- TOC entry 3508 (class 2606 OID 16660)
-- Name: transactions transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


-- Completed on 2026-03-25 14:37:14

--
-- PostgreSQL database dump complete
--

\unrestrict czyRxTVNp6ceH49jUgXch7qDYvUU18RonUaLqi6dpwewBIYcgU1N3kie0rcnXQW

