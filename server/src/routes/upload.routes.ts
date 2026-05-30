import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadFile } from '../controllers/upload.controller';
import { protect } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename: timestamp + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter (restrict to images/PDFs/docx)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'image/jpeg', 
        'image/png', 
        'image/jpg', 
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, DOCX, and PDF are allowed.'));
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit (more robust for high-res images and CVs)
    }
});

// Route: POST /api/upload
// Requires authentication and handles multer errors gracefully
router.post('/', protect, (req, res, next) => {
    upload.single('file')(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError('File is too large. Maximum limit is 10MB.', 400));
            }
            return next(new AppError(`Upload error: ${err.message}`, 400));
        } else if (err) {
            return next(new AppError(err.message, 400));
        }
        next();
    });
}, uploadFile);

export default router;
