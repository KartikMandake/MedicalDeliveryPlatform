require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const passport = require('passport');
const sequelize = require('./db');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/googleAuth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const trackingRoutes = require('./routes/tracking');
const otpRoutes = require('./routes/otp');
const adminRoutes = require('./routes/admin');
const agentRoutes = require('./routes/agent');
const uploadRoutes = require('./routes/upload');
const retailerRoutes = require('./routes/retailer');
const addressRoutes = require('./routes/addresses');
const notificationRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');

const { socketHandler } = require('./utils/socket');

const app = express();
const server = http.createServer(app);

const explicitOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URLS,
]
  .filter(Boolean)
  .flatMap((value) => String(value).split(','))
  .map((value) => value.trim())
  .filter(Boolean);

const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins = [...new Set([...defaultOrigins, ...explicitOrigins])];
const allowVercelPreviews = String(process.env.ALLOW_VERCEL_PREVIEWS || '').toLowerCase() === 'true';

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (allowVercelPreviews && /\.vercel\.app$/i.test(origin)) return true;
  return false;
};

const corsOriginHandler = (origin, callback) => {
  if (isAllowedOrigin(origin)) return callback(null, true);
  return callback(new Error('Not allowed by CORS'));
};

const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);
app.use(cors({ origin: corsOriginHandler, credentials: true }));
app.use(express.json());
app.use(passport.initialize());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth/google', googleAuthRoutes);
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
app.use('/api/retailer', retailerRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'postgresql' }));

socketHandler(io);

// Sync models then run any needed column migrations before accepting traffic.
sequelize.sync()
  .then(async () => {
    console.log('✅ PostgreSQL connected & tables synced');

    // Safe migration: add address column to users table if it doesn't exist
    try {
      await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''`);
      await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255)`);
      await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expire TIMESTAMP WITH TIME ZONE`);
      console.log('✅ users columns (address, reset logic) ready');
      await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE`);
      await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_pic TEXT`);
      console.log('✅ users columns (address, google_id, profile_pic) ready');
    } catch (err) {
      console.warn('⚠️  Could not add columns:', err.message);
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.error('\n👉 Fix: Make sure PostgreSQL is running and DATABASE_URL is set in .env');
    console.error('   Default: postgres://postgres:postgres@localhost:5432/medicaldelivery\n');
    process.exit(1);
  });
