require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const sequelize = require('./db');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const trackingRoutes = require('./routes/tracking');
const otpRoutes = require('./routes/otp');
const adminRoutes = require('./routes/admin');
const agentRoutes = require('./routes/agent');
const uploadRoutes = require('./routes/upload');

const { socketHandler } = require('./utils/socket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
});

app.set('io', io);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'postgresql' }));

socketHandler(io);

// Sync DB tables then start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ PostgreSQL connected & tables synced');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.error('\n👉 Fix: Make sure PostgreSQL is running and DATABASE_URL is set in server/.env');
    console.error('   Default: postgres://postgres:postgres@localhost:5432/medicaldelivery\n');
    process.exit(1);
  });
