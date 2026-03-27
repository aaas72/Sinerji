import { Request, Response, NextFunction } from 'express';
import { BadgeService } from '../services/badge.service';

const badgeService = new BadgeService();

export class BadgeController {
  async getAllBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const badges = await badgeService.getAllBadges();
      res.status(200).json({
        status: 'success',
        data: { badges },
      });
    } catch (error) {
      next(error);
    }
  }
}
