import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validation';
import { AppError } from '../utils/AppError';

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessages = (validation.error as any).errors.map((e: any) => e.message).join(', ');
      return next(new AppError(errorMessages, 400));
    }

    const { user, token } = await authService.register(validation.data);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return next(new AppError('Invalid email or password format', 400));
    }

    const { user, token } = await authService.login(validation.data);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};
