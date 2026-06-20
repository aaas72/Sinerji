import { Router } from 'express';
import { SubmissionController } from '../controllers/submission.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const submissionController = new SubmissionController();

router.use(protect);

// Student routes
router.post('/task/:taskId', restrictTo('student'), submissionController.createSubmission);
router.get('/my', restrictTo('student'), submissionController.getMySubmissions);

// Company routes
router.get('/task/:taskId', restrictTo('company'), submissionController.getTaskSubmissions);

// Shared/Individual route
router.get('/:id', submissionController.getSubmission);

// Company: update submission status and process payment
router.patch('/:id', restrictTo('company'), submissionController.updateSubmission);
router.post('/:id/pay', restrictTo('company'), submissionController.paySubmission);

export default router;

