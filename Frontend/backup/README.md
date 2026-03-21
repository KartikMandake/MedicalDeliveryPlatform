# MediFlow - Medical Delivery Platform

A comprehensive, state-of-the-art medical delivery and pharmacy management platform built with React, Vite, and Tailwind CSS. The platform connects patients, pharmacists, delivery agents, and system administrators via a suite of tailored, high-performance dashboards and user flows.

## 🚀 Features & Modules

The platform includes several standalone modules intricately designed for specific operational roles:

### 👤 Customer Facing
- **Landing Page (`/`)**: A modern homepage with hero sections, distinct product categories, and floating actions.
- **Product Catalog (`/products`)**: A rich e-commerce browser with sidebar filtering and pagination.
- **Shopping Cart (`/cart`)**: Secure checkout flow featuring prescription uploads and cost breakdowns.
- **Prescription Upload (`/upload`)**: Simulated AI-powered prescription scanning, drag-and-drop file support, and instant item detection.
- **Live Order Tracking (`/tracking`)**: Real-time map simulation with a pulsing courier radar and delivery timeline.

### 🏢 B2B & Operations
- **Retailer Dashboard (`/dashboard`)**: Analytics, performance metrics, and incoming order fulfillment interfaces for partner pharmacies.
- **Delivery Agent Dashboard (`/agent`)**: Route optimization tracking, current pickups, and daily earnings overview.

### ⚙️ Administration
- **Admin Panel (`/admin`)**: A command center featuring system-wide KPIs, revenue vs. order analytics, and active delivery tracking.
- **Payment Management (`/payments`)**: Financial oversight displaying total disbursements, pending payouts, and detailed transaction tables.

## 🛠️ Tech Stack

- **Framework**: React 18+
- **Bundler**: Vite
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS (with highly customized utility classes, glassmorphism, and tonal layering)
- **Icons**: Material Symbols Outlined
- **Fonts**: Manrope (Headings), Inter (Body)

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation & Setup

1. **Clone the repository** (if applicable):
   ```bash
   git clone <your-repo-url>
   cd MedicalDeliveryPlatform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

## 🎨 Design Philosophy
The application adheres to a highly polished, unified design system heavily featuring:
- **Tonal Layering** & **Glassmorphism**: Contextual depth using translucent backdrops (`backdrop-blur`) and color-tinted overlays.
- **Asymmetric Bento Grids**: For modern data visualization and analytics layouts.
- **Dynamic Interactions**: Subtle micro-animations on hover states, pulsing map gradients, and smooth scrolling sidebars.

## 📜 License
This project is proprietary and built for demonstration of end-to-end medical logistics platform capabilities.
