import { createApp } from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;
const app = createApp();

// Example socket.io / HTTP boot pattern
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// To add Socket.io later:
// import { Server } from 'socket.io';
// const io = new Server(server, { cors: { origin: '*' } });
// io.on('connection', (socket) => { ... });
