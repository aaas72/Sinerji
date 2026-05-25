import express from 'express';
import { getStats, getLatestTasks, getTopCompanies } from '../controllers/public.controller';

const router = express.Router();

router.get('/stats', getStats);
router.get('/tasks', getLatestTasks);
router.get('/top-companies', getTopCompanies);

export default router;
