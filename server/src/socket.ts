import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from './utils/logger';

let io: Server;

// Store mapping of userId to socketId
export const userSockets = new Map<number, string>();

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            credentials: true
        }
    });

    // Authentication Middleware for Socket.io
    io.use((socket, next) => {
        try {
            // Get token from handshake auth or cookies
            const token = socket.handshake.auth.token || getCookie('jwt', socket.handshake.headers.cookie);
            
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            (socket as any).userId = decoded.id;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        
        if (userId) {
            userSockets.set(userId, socket.id);
            logger.info(`User ${userId} connected with socket ${socket.id}`);
        }

        socket.on('disconnect', () => {
            if (userId) {
                userSockets.delete(userId);
                logger.info(`User ${userId} disconnected`);
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Helper to extract cookie
function getCookie(name: string, cookieString?: string) {
    if (!cookieString) return null;
    const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}
