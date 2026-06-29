import { Router } from 'express';
import { SubmissionController } from '../controllers/submission.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const submissionController = new SubmissionController();

// Public route for verifying internship guarantee
router.get('/verify-guarantee/:token', submissionController.verifyGuarantee);

router.use(protect);

// Student routes
router.post('/task/:taskId', restrictTo('student'), submissionController.createSubmission);
router.get('/my', restrictTo('student'), submissionController.getMySubmissions);
router.post('/:id/submit-work', restrictTo('student'), submissionController.submitWork);
router.post('/:id/offer-response', restrictTo('student'), submissionController.respondToOffer);

// Company routes
router.get('/task/:taskId', restrictTo('company'), submissionController.getTaskSubmissions);

// Shared/Individual route
router.get('/:id', submissionController.getSubmission);

// Company: update submission status and process payment
router.patch('/:id', restrictTo('company'), submissionController.updateSubmission);
router.post('/:id/offer-unpaid', restrictTo('company'), submissionController.offerUnpaid);
router.post('/:id/pay', restrictTo('company'), submissionController.paySubmission);

export default router;

