import express from 'express';
import http from 'http';
import { SocketChatEngine } from './index';

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize SocketChatEngine
const chatEngine = new SocketChatEngine(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
