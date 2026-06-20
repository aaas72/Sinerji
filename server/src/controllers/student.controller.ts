import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { updateStudentProfileSchema, addSkillSchema } from '../utils/validation';
import { AppError } from '../utils/AppError';
import { userSockets, getIO } from '../socket';
import { notificationService } from '../services/notification.service';
import logger from '../utils/logger';

const studentService = new StudentService();
import { MatchingService } from '../services/matching.service';
const matchingService = new MatchingService();

export const getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await studentService.getAllStudents();
    res.status(200).json({
      status: 'success',
      data: { students },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) {
      return next(new AppError('Invalid student ID', 400));
    }
    const profile = await studentService.getProfile(studentId);
    res.status(200).json({
      status: 'success',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    const profile = await studentService.getProfile(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    const stats = await studentService.getStats(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const validation = updateStudentProfileSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessages = (validation.error as any).errors.map((e: any) => e.message).join(', ');
      return next(new AppError(errorMessages, 400));
    }

    const updatedProfile = await studentService.updateProfile(req.user.id, validation.data);

    res.status(200).json({
      status: 'success',
      data: {
        profile: updatedProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const validation = addSkillSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessages = (validation.error as any).errors.map((e: any) => e.message).join(', ');
      return next(new AppError(errorMessages, 400));
    }

    const updatedProfile = await studentService.addSkill(req.user.id, validation.data.skillName, validation.data.category, validation.data.level);

    res.status(200).json({
      status: 'success',
      data: {
        profile: updatedProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const skillId = parseInt(req.params.skillId);

    if (isNaN(skillId)) {
      return next(new AppError('Invalid skill ID', 400));
    }

    const updatedProfile = await studentService.removeSkill(req.user.id, skillId);

    res.status(200).json({
      status: 'success',
      data: {
        profile: updatedProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMatchingStudentsForTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'company') {
      return next(new AppError('Not authorized', 403));
    }
    const taskId = parseInt(req.params.taskId);
    if (isNaN(taskId)) return next(new AppError('Invalid task ID', 400));
    const students = await matchingService.getMatchingStudentsForTask(req.user.id, taskId);
    res.status(200).json({
      status: 'success',
      data: { students },
    });
  } catch (error) {
    next(error);
  }
};

export const saveTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseInt(req.params.taskId);
    await studentService.saveTask(req.user!.id, taskId);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

export const unsaveTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseInt(req.params.taskId);
    await studentService.unsaveTask(req.user!.id, taskId);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

export const getSavedTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await studentService.getSavedTasks(req.user!.id);
    res.status(200).json({
      status: 'success',
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyStudentDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return next(new AppError('Only students can verify documents', 403));
    }

    const file = req.file;
    if (!file) {
      return next(new AppError('Please upload a PDF document', 400));
    }

    if (file.mimetype !== 'application/pdf') {
      return next(new AppError('Only PDF files are allowed', 400));
    }

    const userId = req.user.id;
    const fileBuffer = file.buffer;
    const fileName = file.originalname;
    const fileMimeType = file.mimetype;

    const result = await studentService.verifyDocument(userId, fileBuffer, fileName, fileMimeType);
    
    // Create a persistent success notification
    await notificationService.createNotification(
      userId,
      'Hesabınız Doğrulandı',
      `Öğrenci belgeniz e-Devlet üzerinden başarıyla doğrulandı. Üniversite: ${result.profile.university || ''}`,
      'success',
      '/student/settings'
    );

    res.status(200).json({
      status: 'success',
      message: 'Tebrikler! Hesabınız başarıyla doğrulandı.',
      data: {
        profile: result.profile
      }
    });

  } catch (error: any) {
    // If it fails, also create a persistent error notification
    if (req.user?.id) {
      await notificationService.createNotification(
        req.user.id,
        'Doğrulama Başarısız',
        `Öğrenci belgesi doğrulanırken bir hata oluştu: ${error.message}`,
        'error',
        '/student/settings'
      ).catch(err => logger.error('Failed to create error notification:', err));
    }
    next(error);
  }
};

export const registerBankDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return next(new AppError('Only students can set up bank details', 403));
    }

    const { name, surname, email, gsmNumber, identityNumber, iban, address } = req.body;

    if (!name || !surname || !email || !gsmNumber || !identityNumber || !iban || !address) {
      return next(new AppError('Tüm banka ve kimlik bilgileri gereklidir.', 400));
    }

    const updatedProfile = await studentService.registerBankDetails(req.user.id, {
      name,
      surname,
      email,
      gsmNumber,
      identityNumber,
      iban,
      address
    });

    res.status(200).json({
      status: 'success',
      message: 'Banka hesabı başarıyla tanımlandı.',
      data: {
        profile: updatedProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

