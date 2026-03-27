import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { createReviewSchema } from '../utils/validation';
import { AppError } from '../utils/AppError';

const reviewService = new ReviewService();

export class ReviewController {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const companyUserId = req.user!.id;
      const submissionId = parseInt(req.params.submissionId);
      
      const validation = createReviewSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError(validation.error.issues[0].message, 400);
      }

      const review = await reviewService.createReview(companyUserId, submissionId, validation.data);

      res.status(201).json({
        status: 'success',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }

  async getReview(req: Request, res: Response, next: NextFunction) {
    try {
      const submissionId = parseInt(req.params.submissionId);
      const review = await reviewService.getReview(submissionId);

      res.status(200).json({
        status: 'success',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }
}
