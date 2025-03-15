import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

/**
 * Simple chat room data structure
 */
interface Room {
  id: string;
  users: Set<string>;
}

/**
 * Socket Chat Engine - A lightweight backend socket chat library
 */
export class SocketChatEngine {
  private io: Server;
  private rooms: Map<string, Room> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  /**
   * Creates a new SocketChatEngine instance
   * @param server HTTP server instance
   * @param options Socket.IO options
   */
  constructor(server: HttpServer, options: any = {}) {
    this.io = new Server(server, options);
    this.setupEventHandlers();
  }

  /**
   * Set up socket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      // Handle user authentication
      socket.on('auth', (userId: string) => {
        this.userSockets.set(userId, socket.id);
        this.socketUsers.set(socket.id, userId);
        
        // Emit successful authentication
        socket.emit('auth_success', { userId });
      });

      // Handle joining a room
      socket.on('join_room', (roomId: string) => {
        const userId = this.socketUsers.get(socket.id);
        if (!userId) return;

        // Create room if it doesn't exist
        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, {
            id: roomId,
            users: new Set()
          });
        }

        // Add user to room
        const room = this.rooms.get(roomId);
        if (room) {
          room.users.add(userId);
          socket.join(roomId);
          
          // Notify room about new user
          socket.to(roomId).emit('user_joined', {
            roomId,
            userId
          });
          
          // Send user list to the joining user
          socket.emit('room_users', {
            roomId,
            users: Array.from(room.users)
          });
        }
      });

      // Handle leaving a room
      socket.on('leave_room', (roomId: string) => {
        const userId = this.socketUsers.get(socket.id);
        if (!userId) return;

        this.leaveRoom(socket, userId, roomId);
      });

      // Handle sending messages
      socket.on('message', (data: { roomId: string; text: string }) => {
        const userId = this.socketUsers.get(socket.id);
        if (!userId || !data.roomId || !data.text) return;

        const room = this.rooms.get(data.roomId);
        if (!room || !room.users.has(userId)) return;

        // Create message object
        const message = {
          id: Date.now().toString(),
          roomId: data.roomId,
          userId,
          text: data.text,
          timestamp: Date.now()
        };

        // Broadcast message to room
        this.io.to(data.roomId).emit('message', message);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const userId = this.socketUsers.get(socket.id);
        if (!userId) return;

        // Remove user from all rooms
        this.rooms.forEach((room, roomId) => {
          if (room.users.has(userId)) {
            this.leaveRoom(socket, userId, roomId);
          }
        });

        // Clean up user mappings
        this.userSockets.delete(userId);
        this.socketUsers.delete(socket.id);
      });
    });
  }

  /**
   * Helper method to handle a user leaving a room
   */
  private leaveRoom(socket: Socket, userId: string, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Remove user from room
    room.users.delete(userId);
    socket.leave(roomId);

    // Notify room about user leaving
    this.io.to(roomId).emit('user_left', {
      roomId,
      userId
    });

    // Delete room if empty
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  /**
   * Send a message to a specific room
   */
  public sendToRoom(roomId: string, event: string, data: any): void {
    this.io.to(roomId).emit(event, data);
  }

  /**
   * Send a message to a specific user
   */
  public sendToUser(userId: string, event: string, data: any): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /**
   * Get all users in a room
   */
  public getRoomUsers(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users) : [];
  }

  /**
   * Get all rooms
   */
  public getRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}

export default SocketChatEngine;
