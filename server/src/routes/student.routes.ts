import express from 'express';
import multer from 'multer';
import { getAllStudents, getMyProfile, updateMyProfile, addSkill, removeSkill, getMyStats, getMatchingStudentsForTask, saveTask, unsaveTask, getSavedTasks, getStudentProfile, verifyStudentDocument, registerBankDetails, sendUniversityEmailVerification, verifyUniversityEmail } from '../controllers/student.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Protect all routes after this middleware
router.use(protect);

router.post('/verify-document', restrictTo('student'), upload.single('document'), verifyStudentDocument);
router.post('/bank-setup', restrictTo('student'), registerBankDetails);
router.post('/verify-university-email/send', restrictTo('student'), sendUniversityEmailVerification);
router.post('/verify-university-email/confirm', restrictTo('student'), verifyUniversityEmail);


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
