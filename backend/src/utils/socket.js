const jwt = require('jsonwebtoken');
const sequelize = require('../db');

const upsertAgentLocation = async (agentId, lat, lng, isOnline) => {
  await sequelize.query(
    `
    INSERT INTO agent_locations (agent_id, lat, lng, is_online, updated_at)
    VALUES (:agentId, :lat, :lng, :isOnline, CURRENT_TIMESTAMP)
    ON CONFLICT (agent_id)
    DO UPDATE SET
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      is_online = EXCLUDED.is_online,
      updated_at = CURRENT_TIMESTAMP
    `,
    {
      replacements: {
        agentId,
        lat,
        lng,
        isOnline,
      },
    }
  );
};

const markAgentOfflineIfNoConnections = async (io, agentId) => {
  const socketsInAgentRoom = await io.in(`agent_${agentId}`).fetchSockets();
  if (socketsInAgentRoom.length > 0) return;

  await sequelize.query(
    `
    UPDATE agent_locations
    SET is_online = FALSE,
        updated_at = CURRENT_TIMESTAMP
    WHERE agent_id = :agentId
    `,
    { replacements: { agentId } }
  );
};

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
        const parsedLat = Number(lat);
        const parsedLng = Number(lng);
        await upsertAgentLocation(
          socket.userId,
          Number.isFinite(parsedLat) ? parsedLat : 0,
          Number.isFinite(parsedLng) ? parsedLng : 0,
          true
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
      // Give refresh/reconnect a brief grace window before marking offline.
      setTimeout(() => {
        markAgentOfflineIfNoConnections(io, socket.userId).catch(() => {});
      }, 3500);
    });
  });
};

module.exports = { socketHandler };
