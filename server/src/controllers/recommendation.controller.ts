import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { createRecommendationSchema } from '../utils/validation';
import { AppError } from '../utils/AppError';

const recommendationService = new RecommendationService();

export class RecommendationController {
  async createRecommendation(req: Request, res: Response, next: NextFunction) {
    try {
      const companyUserId = req.user!.id;
      
      const validation = createRecommendationSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError(validation.error.issues[0].message, 400);
      }

      const recommendation = await recommendationService.createRecommendation(companyUserId, validation.data);

      res.status(201).json({
        status: 'success',
        data: { recommendation },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = parseInt(req.params.studentId);
      const recommendations = await recommendationService.getStudentRecommendations(studentId);

      res.status(200).json({
        status: 'success',
        results: recommendations.length,
        data: { recommendations },
      });
    } catch (error) {
      next(error);
    }
  }
}
