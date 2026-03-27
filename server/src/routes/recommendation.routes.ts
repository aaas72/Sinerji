import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const recommendationController = new RecommendationController();

router.use(protect);

// Company routes
router.post('/', restrictTo('company'), recommendationController.createRecommendation);

// Shared routes (Students can view their own, companies can view students', etc.)
// Actually, profile is public usually, but let's keep it protected for now or as requested.
router.get('/student/:studentId', recommendationController.getStudentRecommendations);

export default router;
