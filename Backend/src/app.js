const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const medicinesRoutes = require('./routes/medicines.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');
const retailerRoutes = require('./routes/retailer.routes');
const paymentRoutes = require('./routes/payment.routes');
const agentRoutes = require('./routes/agent.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/retailers', retailerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/agent', agentRoutes);

module.exports = app;
