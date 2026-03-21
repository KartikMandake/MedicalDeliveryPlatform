# MediFlow - Medical Delivery Platform

A comprehensive, state-of-the-art medical delivery and pharmacy management platform. The platform connects patients, retail pharmacists, delivery agents, and system administrators via a meticulously designed suite of tailored dashboards, real-time tracking, and automated fulfillment workflows. 

## 🌟 Key Features & Core Ecosystem

The system is built on a multi-role architecture offering extensive capabilities out of the box.

### 👥 Customer Facing (B2C)
- **Product Discovery**: Rich e-commerce browsing with sidebar filtering, categorized sections (medicine, self-care, wellness), and comprehensive drug details (salt name, manufacturer, MRP, requiring prescription flags).
- **Cart & Checkout Engine**: Robust cart management with real-time price calculation, integrated Razorpay payment gateway handling, and seamless transition from adding to cart to confirming the order.
- **AI-Powered Prescription Upload**: Smart prescription management that supports drag-and-drop file uploads and allows users to order prescription-based medicines efficiently.
- **Real-Time Order Tracking**: End-to-end tracking capabilities—from order placement and packing to dispatch and final delivery. Incorporates live map simulation, pulsing courier radar, and secure OTP verification for pickup and delivery.

### 🏪 Retailer (B2B) Operations
- **Retailer Dashboard**: An analytics-driven operations center for partner pharmacies to track performance metrics, revenue, and order volume.
- **Order Fulfillment Interface**: Manage incoming requests, pack items, confirm readiness, and securely hand over packages to delivery agents using OTP-based verification.
- **Store & Inventory Management**: Handles geolocation mapping (lat/lng, delivery radius), KYC approval status workflows, and bank account integration for seamless payouts.

### 🛵 Delivery Agent Portal
- **Agent Dashboard**: A dedicated interface for delivery personnel featuring current pickups, live location streaming (upserted to backend real-time), and daily earnings overview.
- **Optimized Routing & Status**: GPS location pings to provide live tracking to the customer and the admin. Real-time updates on active delivery tasks and availability toggles (`is_online`).

### ⚙️ System Administration
- **Global Command Center**: A bird's-eye view featuring system-wide Key Performance Indicators (KPIs), user distributions (roles: user, retailer, agent, admin), and order lifecycle oversight.
- **Financial & Payment Operations**: Sophisticated transaction ledger (payments, payouts, refunds), pending disbursements tracking, Razorpay reconciliation, and detailed financial tables categorized by entity (User, Retailer, Agent).
- **User & KYC Management**: Tools to suspend/activate users, approve pending retailer KYCs, and oversee all active platform participants.

## 🏗️ Technical Architecture & Stack

### Frontend Architecture
- **Framework**: React 18+ bundled with Vite for blazing-fast performance.
- **Design System**: A highly polished, custom UI powered by Tailwind CSS. Features dynamic asymmetric Bento Grids, nuanced Glassmorphism (`backdrop-blur`), tonal layering, and sophisticated micro-animations.
- **Routing & State**: Handled smoothly via React Router DOM (v6), providing a Single Page Application (SPA) experience across multiple complex dashboards.

### Backend Infrastructure
- **Core Environment**: robust Node.js and Express.js REST API providing secure, typed interactions.
- **Relational Database**: PostgreSQL handling complex relationships (carts, users, orders, agent locations) with heavily optimized UUID indexing and strict referential integrity.
- **Authentication & Security**: Stateful JWT-based authentication combined with `bcryptjs` for secure password hashing. Role-Based Access Control (RBAC) enforced seamlessly across all endpoints.
- **Payments Engine**: Native Razorpay integration (`razorpay` Node SDK) for processing customer transactions and generating reference IDs (razorpay_order_id) directly linked to internal order states.

## 🧩 Database Schema Overview
The foundation of the platform relies on a sophisticated relational schema ensuring data consistency:
- **`users`**: Maintains multi-role identity profiles including JWT tokens, KYC states, and role assignments.
- **`medicines` & `categories`**: Deeply structured inventory supporting varying medical product types (tablet, syrup, injection) and pricing schemas (MRP vs Selling Price, HSN Code).
- **`orders` & `transactions`**: High-availability ledger for order cycles (`placed` > `packing` > `ready` > `in_transit` > `delivered`) backed by transactional integrity.
- **`cart_items`**: Highly responsive session-based cart management mapped efficiently back to users.

---

*This application is built as a proprietary, enterprise-grade demonstration of full-stack medical logistics platform capabilities. It showcases complex state management, secure payment workflows, multi-actor coordination, and real-time backend updates.*
