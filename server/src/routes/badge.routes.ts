import { Router } from 'express';
import { BadgeController } from '../controllers/badge.controller';

const router = Router();
const badgeController = new BadgeController();

router.get('/', badgeController.getAllBadges);

export default router;
