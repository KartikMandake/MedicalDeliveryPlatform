const jwt = require('jsonwebtoken');
const AgentLocation = require('../models/AgentLocation');

const socketHandler = (io) => {
  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    // Join personal room
    socket.join(`user_${socket.userId}`);

    // Join role-based rooms
    socket.on('join_role', (role) => {
      if (role === 'retailer') socket.join('retailers');
      if (role === 'admin') socket.join('admins');
      if (role === 'agent') socket.join(`agent_${socket.userId}`);
    });

    // Track specific order
    socket.on('track_order', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    // Agent sends live location
    socket.on('agent_location_update', async ({ lat, lng, orderId }) => {
      try {
        await AgentLocation.findOneAndUpdate(
          { agent: socket.userId },
          { lat, lng, isOnline: true },
          { upsert: true }
        );
        if (orderId) {
          io.to(`order_${orderId}`).emit('agent_location', { lat, lng });
        }
      } catch (err) {
        console.error('Location update error:', err.message);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Mark agent offline
      await AgentLocation.findOneAndUpdate({ agent: socket.userId }, { isOnline: false }).catch(() => {});
    });
  });
};

module.exports = { socketHandler };
