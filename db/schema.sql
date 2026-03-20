--
-- PostgreSQL database dump
--

\restrict gDrQbiTORgYj0qr1aYLQrjkE4TtNb5AGoS5LGdjisdfjqMWEl5VPWmm1NKuFm2S

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-03-20 21:52:25

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 16652)
-- Name: agent_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_locations (
    agent_id uuid NOT NULL,
    lat double precision,
    lng double precision,
    is_online boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.agent_locations OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16566)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    cart_id uuid NOT NULL,
    medicine_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total_price numeric(12,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16549)
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
-- TOC entry 220 (class 1259 OID 16509)
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
-- TOC entry 221 (class 1259 OID 16519)
-- Name: medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    salt_name character varying(255),
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
-- TOC entry 227 (class 1259 OID 16635)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    medicine_id uuid,
    quantity integer,
    unit_price numeric(12,2),
    total_price numeric(12,2)
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16608)
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
-- TOC entry 225 (class 1259 OID 16593)
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
-- TOC entry 229 (class 1259 OID 16665)
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
-- TOC entry 222 (class 1259 OID 16536)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    phone character varying(20) NOT NULL,
    name character varying(255),
    email character varying(255),
    role public.user_role,
    status public.user_status,
    fcm_token text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5135 (class 0 OID 16652)
-- Dependencies: 228
-- Data for Name: agent_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_locations (agent_id, lat, lng, is_online, updated_at) FROM stdin;
20000000-0000-0000-0000-000000000004	12.9718	77.5937	t	2026-03-20 17:48:54.960513
20000000-0000-0000-0000-000000000003	18.670053389502286	73.89085104660872	t	2026-03-20 21:44:56.239655
\.


--
-- TOC entry 5131 (class 0 OID 16566)
-- Dependencies: 224
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, medicine_id, quantity, unit_price, total_price, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5130 (class 0 OID 16549)
-- Dependencies: 223
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, user_id, is_active, created_at, updated_at) FROM stdin;
70000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	t	2026-03-20 17:49:49.960513	2026-03-20 17:49:49.960513
\.


--
-- TOC entry 5127 (class 0 OID 16509)
-- Dependencies: 220
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, icon_url) FROM stdin;
00000000-0000-0000-0000-000000000001	Pain Relief	Pain management medicines	/icons/pain.png
00000000-0000-0000-0000-000000000002	Cold & Flu	Cold and flu medicines	/icons/cold.png
00000000-0000-0000-0000-000000000003	Wellness	Vitamins and supplements	/icons/wellness.png
\.


--
-- TOC entry 5128 (class 0 OID 16519)
-- Dependencies: 221
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicines (id, name, salt_name, manufacturer, category_id, type, section, mrp, selling_price, requires_rx, description, images, hsn_code, is_active) FROM stdin;
10000000-0000-0000-0000-000000000001	Paracetamol 650	Paracetamol	MediPharm Labs	00000000-0000-0000-0000-000000000001	tablet	medicine	45.00	39.00	f	Fever and mild pain relief.	{/products/paracetamol-650-1.png}	30049099	t
10000000-0000-0000-0000-000000000002	Cough Syrup Plus	Dextromethorphan	HealthNova	00000000-0000-0000-0000-000000000002	syrup	medicine	120.00	99.00	f	Dry cough suppressant syrup.	{/products/cough-syrup-plus-1.png}	30044900	t
10000000-0000-0000-0000-000000000003	Vitamin C 500	Ascorbic Acid	NutriWell	00000000-0000-0000-0000-000000000003	tablet	wellness	199.00	159.00	f	Daily immunity support.	{/products/vitamin-c-500-1.png}	21069099	t
\.


--
-- TOC entry 5134 (class 0 OID 16635)
-- Dependencies: 227
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, medicine_id, quantity, unit_price, total_price) FROM stdin;
50000000-0000-0000-0000-000000000001	40000000-0000-0000-0000-000000000001	10000000-0000-0000-0000-000000000001	2	39.00	78.00
50000000-0000-0000-0000-000000000002	40000000-0000-0000-0000-000000000001	10000000-0000-0000-0000-000000000002	1	99.00	99.00
50000000-0000-0000-0000-000000000003	40000000-0000-0000-0000-000000000002	10000000-0000-0000-0000-000000000003	1	159.00	159.00
50000000-0000-0000-0000-000000000004	40000000-0000-0000-0000-000000000003	10000000-0000-0000-0000-000000000001	1	39.00	39.00
4bfb6a06-ffaa-4b11-a207-aee3d2af9b74	c85bf124-0a17-49cf-8aed-50b26a0c2348	10000000-0000-0000-0000-000000000001	2	39.00	78.00
c4e48e5f-fe03-4047-a9a4-a9becb4b417d	c85bf124-0a17-49cf-8aed-50b26a0c2348	10000000-0000-0000-0000-000000000002	1	99.00	99.00
5a6a399d-a578-4c0d-bc42-62d27168f1d9	c85bf124-0a17-49cf-8aed-50b26a0c2348	10000000-0000-0000-0000-000000000003	1	159.00	159.00
b946ee08-1e67-4100-8849-dfc1d3cdfd98	65d16ba5-a2a6-4044-a308-4dceb1b19efa	10000000-0000-0000-0000-000000000001	1	39.00	39.00
76a96d1b-01ce-4ede-8f3c-e8ba27b613ca	65d16ba5-a2a6-4044-a308-4dceb1b19efa	10000000-0000-0000-0000-000000000002	1	99.00	99.00
\.


--
-- TOC entry 5133 (class 0 OID 16608)
-- Dependencies: 226
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, user_id, retailer_id, agent_id, status, delivery_address, subtotal, delivery_fee, total_amount, pickup_otp, delivery_otp, prescription_url, razorpay_order_id, payment_status, placed_at, delivered_at) FROM stdin;
40000000-0000-0000-0000-000000000001	ORD-1001	20000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000003	in_transit	{"lat": 12.9753, "lng": 77.6067, "city": "Bengaluru", "name": "Aarav Mehta", "line1": "12 MG Road", "pincode": "560001"}	198.00	35.00	233.00	592184	284915	\N	razorpay_ord_1001	paid	2026-03-20 17:04:49.960513	\N
40000000-0000-0000-0000-000000000002	ORD-1002	20000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000004	packing	{"lat": 12.9753, "lng": 77.6067, "city": "Bengaluru", "name": "Aarav Mehta", "line1": "12 MG Road", "pincode": "560001"}	159.00	25.00	184.00	773911	113790	\N	razorpay_ord_1002	paid	2026-03-20 17:29:49.960513	\N
40000000-0000-0000-0000-000000000003	ORD-1003	20000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000004	delivered	{"lat": 12.9753, "lng": 77.6067, "city": "Bengaluru", "name": "Aarav Mehta", "line1": "12 MG Road", "pincode": "560001"}	39.00	20.00	59.00	224466	664422	\N	razorpay_ord_1003	paid	2026-03-19 17:49:49.960513	2026-03-19 18:49:49.960513
c85bf124-0a17-49cf-8aed-50b26a0c2348	ORD-1774015959036-5505	20000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000003	in_transit	{"id": "home", "label": "Home", "line1": "124 Clinical Heights, Dehu Phata", "line2": "Pune, 412105", "contact": "+1 (555) 012-3456"}	336.00	25.00	361.00	\N	\N	\N	\N	pending	2026-03-20 19:42:39.027299	\N
65d16ba5-a2a6-4044-a308-4dceb1b19efa	ORD-1774016640442-4682	20000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000003	placed	{"id": "home", "label": "Home", "line1": "124 Clinical Heights, Dehu Phata", "line2": "Pune, 412105", "contact": "+1 (555) 012-3456"}	138.00	25.00	163.00	\N	\N	\N	\N	pending	2026-03-20 19:54:00.427273	\N
\.


--
-- TOC entry 5132 (class 0 OID 16593)
-- Dependencies: 225
-- Data for Name: retailers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.retailers (id, user_id, shop_name, drug_license, gstin, lat, lng, radius_km, is_open, kyc_status, bank_account) FROM stdin;
30000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000002	CityCare Pharmacy	DL-29-AB-12345	29ABCDE1234F1Z1	12.9716	77.5946	8	t	approved	{"bank": "HDFC", "ifsc": "HDFC0001234", "account": "XXXX1234", "account_holder": "CityCare Pharmacy"}
\.


--
-- TOC entry 5136 (class 0 OID 16665)
-- Dependencies: 229
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, order_id, type, entity_type, amount, status, razorpay_ref) FROM stdin;
60000000-0000-0000-0000-000000000001	40000000-0000-0000-0000-000000000001	payment	user	233.00	completed	pay_1001
60000000-0000-0000-0000-000000000002	40000000-0000-0000-0000-000000000001	payout	retailer	190.00	pending	payout_1001_r
60000000-0000-0000-0000-000000000003	40000000-0000-0000-0000-000000000001	payout	agent	25.00	pending	payout_1001_a
60000000-0000-0000-0000-000000000004	40000000-0000-0000-0000-000000000003	payment	user	59.00	completed	pay_1003
\.


--
-- TOC entry 5129 (class 0 OID 16536)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, phone, name, email, role, status, fcm_token, created_at) FROM stdin;
20000000-0000-0000-0000-000000000001	+919900000001	Aarav Mehta	aarav@example.com	user	active	fcm-user-001	2026-03-20 17:49:49.960513
20000000-0000-0000-0000-000000000002	+919900000002	CityCare Pharmacy Owner	retailer@example.com	retailer	active	fcm-retailer-001	2026-03-20 17:49:49.960513
20000000-0000-0000-0000-000000000004	+919900000004	Karan Singh	agent2@example.com	agent	active	fcm-agent-002	2026-03-20 17:49:49.960513
20000000-0000-0000-0000-000000000005	+919900000005	Ops Admin	admin@example.com	admin	active	fcm-admin-001	2026-03-20 17:49:49.960513
20000000-0000-0000-0000-000000000003	+919900000003	Kunal Garud	agent1@example.com	agent	active	fcm-agent-001	2026-03-20 17:49:49.960513
\.


--
-- TOC entry 4964 (class 2606 OID 16659)
-- Name: agent_locations agent_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_locations
    ADD CONSTRAINT agent_locations_pkey PRIMARY KEY (agent_id);


--
-- TOC entry 4947 (class 2606 OID 16582)
-- Name: cart_items cart_items_cart_id_medicine_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_medicine_id_key UNIQUE (cart_id, medicine_id);


--
-- TOC entry 4949 (class 2606 OID 16580)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 16560)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 16518)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 16530)
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 16641)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 16619)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 4960 (class 2606 OID 16617)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 16602)
-- Name: retailers retailers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retailers
    ADD CONSTRAINT retailers_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 16671)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 16548)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4942 (class 2606 OID 16546)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 1259 OID 16681)
-- Name: idx_agent_locations_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_locations_updated_at ON public.agent_locations USING btree (updated_at);


--
-- TOC entry 4950 (class 1259 OID 16684)
-- Name: idx_cart_items_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_cart_id ON public.cart_items USING btree (cart_id);


--
-- TOC entry 4945 (class 1259 OID 16683)
-- Name: idx_one_active_cart_per_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_one_active_cart_per_user ON public.carts USING btree (user_id) WHERE (is_active = true);


--
-- TOC entry 4954 (class 1259 OID 16679)
-- Name: idx_orders_agent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_agent_id ON public.orders USING btree (agent_id);


--
-- TOC entry 4955 (class 1259 OID 16680)
-- Name: idx_orders_retailer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_retailer_id ON public.orders USING btree (retailer_id);


--
-- TOC entry 4956 (class 1259 OID 16678)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 4951 (class 1259 OID 16682)
-- Name: idx_retailers_lat_lng; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_retailers_lat_lng ON public.retailers USING btree (lat, lng);


--
-- TOC entry 4978 (class 2606 OID 16660)
-- Name: agent_locations agent_locations_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_locations
    ADD CONSTRAINT agent_locations_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.users(id);


--
-- TOC entry 4970 (class 2606 OID 16583)
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- TOC entry 4971 (class 2606 OID 16588)
-- Name: cart_items cart_items_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- TOC entry 4969 (class 2606 OID 16561)
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4968 (class 2606 OID 16531)
-- Name: medicines medicines_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 4976 (class 2606 OID 16647)
-- Name: order_items order_items_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- TOC entry 4977 (class 2606 OID 16642)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 4973 (class 2606 OID 16630)
-- Name: orders orders_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.users(id);


--
-- TOC entry 4974 (class 2606 OID 16625)
-- Name: orders orders_retailer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_retailer_id_fkey FOREIGN KEY (retailer_id) REFERENCES public.retailers(id);


--
-- TOC entry 4975 (class 2606 OID 16620)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4972 (class 2606 OID 16603)
-- Name: retailers retailers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retailers
    ADD CONSTRAINT retailers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4979 (class 2606 OID 16672)
-- Name: transactions transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


-- Completed on 2026-03-20 21:52:25

--
-- PostgreSQL database dump complete
--

\unrestrict gDrQbiTORgYj0qr1aYLQrjkE4TtNb5AGoS5LGdjisdfjqMWEl5VPWmm1NKuFm2S

