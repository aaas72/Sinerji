import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return next(new AppError('No file uploaded', 400));
        }

        // The file is saved in 'server/uploads/' directory
        // We return the public URL to access it
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.status(200).json({
            status: 'success',
            data: {
                url: fileUrl,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (error) {
        next(error);
    }
};
