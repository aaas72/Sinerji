import express from 'express';
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getCompanyTasks,
    getTasksByCompanyId,
    getRecommendedTasks
} from '../controllers/task.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// Public or Protected? Tasks usually can be seen by authenticated users
router.use(protect);

// General routes
router.get('/recommended', restrictTo('student'), getRecommendedTasks);
router.get('/', getTasks);
router.get('/:taskId', getTaskById);

// Company specific routes
// Note: Order matters. /company/my-tasks should be before /:taskId if it were under the same path structure without specific prefix.
// But here I'll put it as a separate endpoint or query param? 
// Ideally RESTful would be GET /tasks?company=me or GET /companies/me/tasks
// Let's stick to a simple dedicated route for convenience
router.get('/company/my-tasks', restrictTo('company'), getCompanyTasks);
router.get('/company/:companyId', getTasksByCompanyId);

router.post('/', restrictTo('company'), createTask);
router.patch('/:taskId', restrictTo('company'), updateTask);
router.delete('/:taskId', restrictTo('company'), deleteTask);

export default router;
