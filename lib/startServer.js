import mongoose from 'mongoose';
import { app, mongoOptions } from './constants.js';
import logger from '../middlewares/logger.js';
import dotenv from 'dotenv';
import { createServer } from 'http'; // HTTP server creator
import { Server as SocketIOServer } from 'socket.io'; // Socket.IO

dotenv.config();
const port = process.env.DEFAULT_PORT || 5000;

export const startServer = () => {
  try {
    // Connect to MongoDB
    mongoose.connect(process.env.CONNECTION_STRING, mongoOptions).then(() => {
      console.log('Database connected successfully.');

      // Create HTTP server and integrate with Express
      const httpServer = createServer(app);

      // Set up Socket.IO with the HTTP server
      const io = new SocketIOServer(httpServer, {
        cors: {
          origin: 'http://localhost:3000', // Adjust this origin as needed
          methods: ['GET', 'POST'],
        },
      });

      // Make the io instance accessible in Express routes
      app.set('io', io); // Store the io instance on the Express app

      // Socket.IO connection event
      io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('io', () => {
          io.emit(io); // Broadcasts to all connected clients
        });

        // Chat or screenshare event listeners
        socket.on('chatMessage', (msg) => {
          io.emit('chatMessage', msg); // Broadcasts to all connected clients
        });

        // Example for invitation notification
        socket.on('sendInvitation', (data) => {
          const { email, inviterName, roomId } = data;

          // Emit notification to specific user based on their email (or a user-mapped ID if available)
          io.emit('receiveInvitation', {
            message: `${inviterName} has invited you to join room ${roomId}`,
            email,
          });
        });

        socket.on('disconnect', () => {
          console.log('User disconnected:', socket.id);
        });
      });

      // Start the server on the specified port
      httpServer.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    });
  } catch (error) {
    logger.error(`Error: ${error}`);
  }
};
