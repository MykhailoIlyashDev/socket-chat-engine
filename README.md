# Socket Chat Engine

A lightweight socket-based chat engine for Node.js backend applications.

## Features

- Simple and lightweight chat implementation
- Real-time messaging with Socket.IO
- Room-based chat functionality
- User authentication
- TypeScript support

## Installation

```bash
npm i socket-chat-engine
```

## Usage

### Server Setup

```javascript
const express = require('express');
const http = require('http');
const { SocketChatEngine } = require('mikelenode-chat-engine');

// Create server
const app = express();
const server = http.createServer(app);

// Initialize chat engine
const chatEngine = new SocketChatEngine(server);

// Start server
server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Client Implementation

```javascript
// Connect to server
const socket = io('http://localhost:3000');

// Authenticate
socket.emit('auth', 'user123');

// Join a room
socket.emit('join_room', 'room1');

// Send a message
socket.emit('message', { roomId: 'room1', text: 'Hello!' });

// Listen for messages
socket.on('message', (message) => {
  console.log(`${message.userId}: ${message.text}`);
});

// Listen for room events
socket.on('user_joined', (data) => {
  console.log(`${data.userId} joined the room`);
});

socket.on('user_left', (data) => {
  console.log(`${data.userId} left the room`);
});
```

## API

### Server Methods

- `sendToRoom(roomId, event, data)` - Send event to all users in a room
- `sendToUser(userId, event, data)` - Send event to a specific user
- `getRoomUsers(roomId)` - Get all users in a room
- `getRooms()` - Get all active rooms

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `auth` | Client → Server | Authenticate a user |
| `join_room` | Client → Server | Join a chat room |
| `leave_room` | Client → Server | Leave a chat room |
| `message` | Client → Server | Send a message |
| `auth_success` | Server → Client | Authentication successful |
| `user_joined` | Server → Client | User joined a room |
| `user_left` | Server → Client | User left a room |
| `message` | Server → Client | New message received |
| `room_users` | Server → Client | List of users in a room |

## License

MIT

Made with by Michael Ilyash
