import express from 'express';
import { getAllStudents, getMyProfile, updateMyProfile, addSkill, removeSkill, getMyStats, getMatchingStudentsForTask, saveTask, unsaveTask, getSavedTasks, getStudentProfile } from '../controllers/student.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/', restrictTo('company', 'student'), getAllStudents);

router.get('/task/:taskId/matches', restrictTo('company'), getMatchingStudentsForTask);

router.get('/me', restrictTo('student'), getMyProfile);
router.get('/me/stats', restrictTo('student'), getMyStats);
router.patch('/me', restrictTo('student'), updateMyProfile);
router.post('/skills', restrictTo('student'), addSkill);
router.delete('/skills/:skillId', restrictTo('student'), removeSkill);

// Saved Tasks
router.get('/saved-tasks', restrictTo('student'), getSavedTasks);
router.post('/tasks/:taskId/save', restrictTo('student'), saveTask);
router.delete('/tasks/:taskId/save', restrictTo('student'), unsaveTask);

// Dynamic routes last
router.get('/:id', getStudentProfile);

export default router;
