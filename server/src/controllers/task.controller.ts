import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema } from '../utils/validation';
import { AppError } from '../utils/AppError';

const taskService = new TaskService();
import { MatchingService } from '../services/matching.service';
const matchingService = new MatchingService();

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search, category } = req.query;

        const filters = {
            search: typeof search === 'string' ? search : undefined,
            category: typeof category === 'string' ? category : undefined,
        };

        const tasks = await taskService.getAllTasks(filters);

        res.status(200).json({
            status: 'success',
            data: {
                tasks,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = parseInt(req.params.taskId);
        if (isNaN(taskId)) return next(new AppError('Invalid task ID', 400));

        const task = await taskService.getTaskById(taskId);

        res.status(200).json({
            status: 'success',
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};

export const getCompanyTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || req.user.role !== 'company') {
            return next(new AppError('Not authorized', 403));
        }

        const tasks = await taskService.getCompanyTasks(req.user.id);

        res.status(200).json({
            status: 'success',
            data: { tasks }
        });
    } catch (error) {
        next(error);
    }
};

export const getTasksByCompanyId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyId = parseInt(req.params.companyId);
        if (isNaN(companyId)) return next(new AppError('Invalid company ID', 400));

        const tasks = await taskService.getCompanyTasks(companyId);

        res.status(200).json({
            status: 'success',
            data: { tasks }
        });
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || req.user.role !== 'company') {
            return next(new AppError('Not authorized', 403));
        }

        const validation = createTaskSchema.safeParse(req.body);
        if (!validation.success) {
            const errorMessages = validation.error.issues.map((e) => e.message).join(', ');
            return next(new AppError(errorMessages, 400));
        }

        const task = await taskService.createTask(req.user.id, validation.data);

        res.status(201).json({
            status: 'success',
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || req.user.role !== 'company') {
            return next(new AppError('Not authorized', 403));
        }

        const taskId = parseInt(req.params.taskId);
        if (isNaN(taskId)) return next(new AppError('Invalid task ID', 400));

        const validation = updateTaskSchema.safeParse(req.body);
        if (!validation.success) {
            const errorMessages = validation.error.issues.map((e) => e.message).join(', ');
            return next(new AppError(errorMessages, 400));
        }

        const task = await taskService.updateTask(req.user.id, taskId, validation.data);

        res.status(200).json({
            status: 'success',
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || req.user.role !== 'company') {
            return next(new AppError('Not authorized', 403));
        }

        const taskId = parseInt(req.params.taskId);
        if (isNaN(taskId)) return next(new AppError('Invalid task ID', 400));

        await taskService.deleteTask(req.user.id, taskId);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

export const getRecommendedTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || req.user.role !== 'student') {
            return next(new AppError('Not authorized', 403));
        }
        const tasks = await matchingService.getRecommendedTasksForStudent(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { tasks }
        });
    } catch (error) {
        next(error);
    }
};
