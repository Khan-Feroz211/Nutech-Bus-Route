import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

export interface JwtPayload {
  userId: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function setupWebSocketAuth(io: Server) {
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    const payload = verifyToken(token);
    
    if (!payload) {
      return next(new Error('Invalid or expired token'));
    }
    
    socket.userId = payload.userId;
    socket.role = payload.role;
    
    next();
  });
  
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.role})`);
    
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userId}, reason: ${reason}`);
    });
  });
}

export function requireRole(...allowedRoles: string[]) {
  return (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    if (!socket.role) {
      return next(new Error('Role not found'));
    }
    
    if (!allowedRoles.includes(socket.role)) {
      return next(new Error('Insufficient permissions'));
    }
    
    next();
  };
}

export function emitToRole(io: Server, role: string, event: string, data: unknown) {
  io.emit(event, data);
}

export function emitToUser(io: Server, userId: string, event: string, data: unknown) {
  io.to(`user:${userId}`).emit(event, data);
}

export function joinUserRoom(socket: AuthenticatedSocket) {
  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
  }
}

export function joinRoleRoom(socket: AuthenticatedSocket) {
  if (socket.role) {
    socket.join(`role:${socket.role}`);
  }
}
