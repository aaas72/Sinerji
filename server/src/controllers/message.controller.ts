import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const getContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    const currentUserId = req.user.id;

    // Find all unique users this user has exchanged messages with
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: currentUserId },
          { receiver_id: currentUserId }
        ]
      },
      orderBy: { created_at: 'desc' },
      include: {
        sender: {
          include: { companyProfile: true, studentProfile: true }
        },
        receiver: {
          include: { companyProfile: true, studentProfile: true }
        }
      }
    });

    const contactMap = new Map();
    messages.forEach(msg => {
      const isSender = msg.sender_id === currentUserId;
      const otherUser = isSender ? msg.receiver : msg.sender;
      
      if (!contactMap.has(otherUser.id)) {
        let name = 'Unknown';
        let role = otherUser.role;
        let initials = 'U';
        
        if (otherUser.companyProfile) {
          name = otherUser.companyProfile.company_name;
          initials = name.substring(0, 2).toUpperCase();
        } else if (otherUser.studentProfile) {
          name = otherUser.studentProfile.full_name;
          initials = name.substring(0, 2).toUpperCase();
        }

        contactMap.set(otherUser.id, {
          id: otherUser.id,
          name,
          role,
          initials,
          lastMessageTime: msg.created_at,
          unread: !isSender && !msg.is_read ? 1 : 0 // simplify unread counting
        });
      } else {
        if (!isSender && !msg.is_read) {
          contactMap.get(otherUser.id).unread += 1;
        }
      }
    });

    const contacts = Array.from(contactMap.values());

    res.status(200).json({
      status: 'success',
      data: { contacts }
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: currentUserId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: currentUserId }
        ]
      },
      orderBy: { created_at: 'asc' }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        sender_id: otherUserId,
        receiver_id: currentUserId,
        is_read: false
      },
      data: { is_read: true }
    });

    res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    const sender_id = req.user.id;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return next(new AppError('receiver_id and content are required', 400));
    }

    const message = await prisma.message.create({
      data: {
        sender_id,
        receiver_id: parseInt(receiver_id),
        content
      }
    });

    res.status(201).json({
      status: 'success',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};
