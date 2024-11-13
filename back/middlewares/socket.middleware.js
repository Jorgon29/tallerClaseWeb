import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

const connectedUsers = new Map();

export const socketMiddleware = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    
    if (!token) {
      console.error('No token provided. Proceeding as unauthenticated.');
      socket.user = null;
      return next();
    }

    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) {
        console.error('Invalid token:', err.message);
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.user = decoded;
      console.log('User authenticated:', decoded);
      next();
    });
  });

  io.on('connection', (socket) => {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    
    socket.onAny((event, ...args) => {
      console.log(`Event received: ${event}`, args);
    });    

    if (socket.user) {
      connectedUsers.set(socket.user.id, socket.id);
      console.log(`User ${socket.user.id} connected`);
    } else {
      console.log('User connected: Unauthenticated');
    }

    socket.on('publicMessage', (msg) => {
      console.log('Public message:', msg);
      io.emit('publicMessage', msg);
    });

    socket.on('privateMessage', ({ to, msg }) => {
      if (!socket.user) {
        console.error('Private message attempt from unauthenticated user');
        return;
      }

      const recipientSocketId = connectedUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('privateMessage', { from: socket.user.id, msg });
        console.log(`Private message from ${socket.user.id} to ${to}: ${msg}`);
      } else {
        socket.emit('errorMessage', 'Recipient is not online.');
      }
    });

    socket.on('disconnect', () => {
      if (socket.user) {
        connectedUsers.delete(socket.user.id);
        console.log(`User ${socket.user.id} disconnected`);
      } else {
        console.log('User disconnected: Unauthenticated');
      }
    });
  });
};
