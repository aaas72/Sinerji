import express from 'express';
import { getMyProfile, updateMyProfile, getCompanyProfile, getMyStats, getAllCompanies } from '../controllers/company.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Specific routes first
router.get('/me', restrictTo('company'), getMyProfile);
router.get('/me/stats', restrictTo('company'), getMyStats);
router.patch('/me', restrictTo('company'), updateMyProfile);

// Dynamic routes last
router.get('/', getAllCompanies);
router.get('/:id', getCompanyProfile);

export default router;
