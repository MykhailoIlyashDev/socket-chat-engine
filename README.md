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
npm i socket-chat-flash
```

## Usage

### Server Setup

```javascript
const express = require('express');
const http = require('http');
const { SocketChatEngine } = require('socket-chat-flash');

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

### Complete Example

## Server (server.js)

```javascript
const express = require('express');
const express = require('express');
const http = require('http');
const path = require('path');
const { SocketChatEngine } = require('socket-chat-flash');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize chat engine
const chatEngine = new SocketChatEngine(server);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Client (public/index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat App</title>
  <style>
    #messages { height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; }
    .message { margin-bottom: 10px; }
    .system { color: #888; font-style: italic; }
  </style>
</head>
<body>
  <div id="login">
    <h2>Login</h2>
    <input type="text" id="userId" placeholder="Enter user ID">
    <button id="loginBtn">Login</button>
  </div>

  <div id="chat" style="display: none;">
    <h2>Chat</h2>
    <div>
      <input type="text" id="roomId" placeholder="Room ID">
      <button id="joinBtn">Join Room</button>
      <button id="leaveBtn">Leave Room</button>
    </div>
    <div id="currentRoom"></div>
    <div id="messages"></div>
    <div>
      <input type="text" id="messageInput" placeholder="Type a message...">
      <button id="sendBtn">Send</button>
    </div>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    // DOM elements
    const loginDiv = document.getElementById('login');
    const chatDiv = document.getElementById('chat');
    const userIdInput = document.getElementById('userId');
    const roomIdInput = document.getElementById('roomId');
    const messageInput = document.getElementById('messageInput');
    const messagesDiv = document.getElementById('messages');
    const currentRoomDiv = document.getElementById('currentRoom');
    
    // Connect to server
    const socket = io();
    
    let currentUserId = null;
    let currentRoomId = null;
    
    // Add message to chat
    function addMessage(text, isSystem = false) {
      const messageEl = document.createElement('div');
      messageEl.className = isSystem ? 'message system' : 'message';
      messageEl.textContent = text;
      messagesDiv.appendChild(messageEl);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    // Login button
    document.getElementById('loginBtn').addEventListener('click', () => {
      const userId = userIdInput.value.trim();
      if (!userId) return;
      
      currentUserId = userId;
      socket.emit('auth', userId);
    });
    
    // Join room button
    document.getElementById('joinBtn').addEventListener('click', () => {
      const roomId = roomIdInput.value.trim();
      if (!roomId) return;
      
      currentRoomId = roomId;
      socket.emit('join_room', roomId);
      currentRoomDiv.textContent = `Current room: ${roomId}`;
    });
    
    // Leave room button
    document.getElementById('leaveBtn').addEventListener('click', () => {
      if (!currentRoomId) return;
      
      socket.emit('leave_room', currentRoomId);
      addMessage(`Left room ${currentRoomId}`, true);
      currentRoomId = null;
      currentRoomDiv.textContent = '';
    });
    
    // Send message button
    document.getElementById('sendBtn').addEventListener('click', () => {
      const text = messageInput.value.trim();
      if (!text || !currentRoomId) return;
      
      socket.emit('message', { roomId: currentRoomId, text });
      messageInput.value = '';
    });
    
    // Socket events
    socket.on('auth_success', () => {
      loginDiv.style.display = 'none';
      chatDiv.style.display = 'block';
      addMessage(`Logged in as ${currentUserId}`, true);
    });
    
    socket.on('message', (message) => {
      const prefix = message.userId === currentUserId ? 'You' : message.userId;
      addMessage(`${prefix}: ${message.text}`);
    });
    
    socket.on('user_joined', (data) => {
      addMessage(`${data.userId} joined the room`, true);
    });
    
    socket.on('user_left', (data) => {
      addMessage(`${data.userId} left the room`, true);
    });
    
    socket.on('room_users', (data) => {
      addMessage(`Users in room: ${data.users.join(', ')}`, true);
    });
  </script>
</body>
</html>

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

## Data Types

### Message Object

```typescript
interface Message {
  id: string;         // Unique message ID
  roomId: string;     // Room ID where message was sent
  userId: string;     // User ID of sender
  text: string;       // Message content
  timestamp: number;  // Unix timestamp
}
```

## License

MIT

Made with by Michael Ilyash
