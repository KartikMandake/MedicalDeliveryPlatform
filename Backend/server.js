require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');

// Add socketHandler if it exists (which it does in src/utils/socket.js)
let socketHandler;
try {
  socketHandler = require('./src/utils/socket').socketHandler;
} catch (e) {
  socketHandler = null;
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

if (socketHandler) {
  socketHandler(io);
}

server.listen(PORT, () => {
  console.log(`Server is running with Socket.IO on port ${PORT}`);
});
