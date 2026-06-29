import { Request, Response, NextFunction } from 'express';
import { CronService } from '../services/cron.service';

const cronService = new CronService();

export class CronController {
  async triggerAutoCancel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cronService.autoCancelOverdueSubmissions();
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async triggerAutoApprove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cronService.autoApproveSubmissions();
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async triggerExpireTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cronService.expireTasks();
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
