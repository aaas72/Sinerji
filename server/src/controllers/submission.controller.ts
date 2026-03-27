import { Request, Response, NextFunction } from 'express';
import { SubmissionService } from '../services/submission.service';
import { createSubmissionSchema } from '../utils/validation';
import { AppError } from '../utils/AppError';

const submissionService = new SubmissionService();

export class SubmissionController {
  async createSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.id;
      const taskId = parseInt(req.params.taskId);
      
      const validation = createSubmissionSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError(validation.error.issues[0].message, 400);
      }

      const submission = await submissionService.createSubmission(studentId, taskId, validation.data);

      res.status(201).json({
        status: 'success',
        data: { submission },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const submissionId = parseInt(req.params.id);
      const submission = await submissionService.getSubmissionById(submissionId);

      // Authorization check
      const userId = req.user!.id;
      const userRole = req.user!.role;

      if (userRole === 'student' && submission.student_user_id !== userId) {
         throw new AppError('Not authorized to view this submission', 403);
      }
      
      if (userRole === 'company') {
          if (submission.task.company_user_id !== userId) {
              throw new AppError('Not authorized to view this submission', 403);
          }
      }

      res.status(200).json({
        status: 'success',
        data: { submission },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskSubmissions(req: Request, res: Response, next: NextFunction) {
      try {
          const companyUserId = req.user!.id;
          const taskId = parseInt(req.params.taskId);
          
          const submissions = await submissionService.getTaskSubmissions(taskId, companyUserId);
          
          res.status(200).json({
              status: 'success',
              results: submissions.length,
              data: { submissions }
          });
      } catch (error) {
          next(error);
      }
  }
  
  async getMySubmissions(req: Request, res: Response, next: NextFunction) {
      try {
          const studentId = req.user!.id;
          const submissions = await submissionService.getMySubmissions(studentId);
          
          res.status(200).json({
              status: 'success',
              results: submissions.length,
              data: { submissions }
          });
      } catch (error) {
          next(error);
      }
  }

  async updateSubmission(req: Request, res: Response, next: NextFunction) {
      try {
          const companyUserId = req.user!.id;
          const submissionId = parseInt(req.params.id);
          const { status } = req.body;

          if (!['approved', 'rejected'].includes(status)) {
              throw new AppError('Status must be approved or rejected', 400);
          }

          const submission = await submissionService.updateSubmissionStatus(
              submissionId,
              companyUserId,
              status as 'approved' | 'rejected'
          );

          res.status(200).json({
              status: 'success',
              data: { submission }
          });
      } catch (error) {
          next(error);
      }
  }
}
