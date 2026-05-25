import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { successResponse } from '../utils/responseFormatter';
import { AppError } from '../utils/AppError';

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) return next(new AppError('User not found', 401));

        const notifications = await notificationService.getUserNotifications(userId);
        const unreadCount = await notificationService.getUnreadCount(userId);

        res.json(successResponse({ notifications, unreadCount }));
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const notificationId = parseInt(req.params.id);

        if (!userId) return next(new AppError('User not found', 401));
        if (isNaN(notificationId)) return next(new AppError('Invalid notification ID', 400));

        const notification = await notificationService.markAsRead(notificationId, userId);
        res.json(successResponse({ notification }));
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) return next(new AppError('User not found', 401));

        await notificationService.markAllAsRead(userId);
        res.json(successResponse({ message: 'All notifications marked as read' }));
    } catch (error) {
        next(error);
    }
};
