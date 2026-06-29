import { Router } from 'express';
import { CronController } from '../controllers/cron.controller';

const router = Router();
const cronController = new CronController();

// In a real production app, these endpoints should be protected by an internal API key or IP whitelist
// so that only the task scheduler can call them.
router.post('/auto-cancel', cronController.triggerAutoCancel);
router.post('/auto-approve', cronController.triggerAutoApprove);
router.post('/expire-tasks', cronController.triggerExpireTasks);

export default router;
