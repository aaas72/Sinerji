import { PrismaClient } from '@prisma/client';
import { getIO, userSockets } from '../socket';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const notificationService = {
    async createNotification(userId: number, title: string, message: string, type: string = 'info', link?: string) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    user_id: userId,
                    title,
                    message,
                    type,
                    link
                }
            });

            // If the user is online, emit the notification via Socket.io
            const socketId = userSockets.get(userId);
            if (socketId) {
                const io = getIO();
                io.to(socketId).emit('new_notification', notification);
            }

            return notification;
        } catch (error) {
            logger.error('Error creating notification', error);
            throw error;
        }
    },

    async getUserNotifications(userId: number) {
        return prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 50 // Limit to last 50
        });
    },

    async getUnreadCount(userId: number) {
        return prisma.notification.count({
            where: { user_id: userId, is_read: false }
        });
    },

    async markAsRead(notificationId: number, userId: number) {
        return prisma.notification.update({
            where: { id: notificationId, user_id: userId }, // Ensure user owns it
            data: { is_read: true }
        });
    },

    async markAllAsRead(userId: number) {
        return prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true }
        });
    }
};
