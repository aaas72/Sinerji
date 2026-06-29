import { Request, Response, NextFunction } from 'express';
import { SubmissionService } from '../services/submission.service';
import { createSubmissionSchema } from '../utils/validation';
import { AppError } from '../utils/AppError';
import { notificationService } from '../services/notification.service';
import { getIO, userSockets } from '../socket';

import { MailService } from '../services/mail.service';

const submissionService = new SubmissionService();
const mailService = new MailService();

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

          // Trigger Notification
          const studentId = submission.student_user_id;
          const statusText = status === 'approved' ? 'Kabul Edildi' : 'Reddedildi';
          const notificationMessage = `"${submission.task.title}" görevi için başvurunuz ${statusText}.`;

          await notificationService.createNotification(
            studentId,
            'Başvuru Durumu Güncellendi',
            notificationMessage,
            status === 'approved' ? 'application_accepted' : 'application_rejected',
            '/student/applications'
          );

          if (status === 'approved' && submission.guarantee_token) {
              const studentName = submission.student?.user?.first_name 
                ? `${submission.student.user.first_name} ${submission.student.user.last_name}` 
                : 'Öğrenci';
              const companyName = submission.task?.company?.company_name || 'Sinerji Şirketi';
              
              const guaranteeUrl = `http://localhost:3000/verify/${submission.guarantee_token}`;
              
              const studentEmail = submission.student?.user?.email;
              if (studentEmail) {
                  await mailService.sendInternshipGuaranteeEmail(studentEmail, studentName, companyName, guaranteeUrl);
              }
          }

          res.status(200).json({
              status: 'success',
              data: { submission }
          });
      } catch (error) {
          next(error);
      }
  }

  async offerUnpaid(req: Request, res: Response, next: NextFunction) {
      try {
          const companyUserId = req.user!.id;
          const submissionId = parseInt(req.params.id);

          const submission = await submissionService.offerUnpaidSubmission(
              submissionId,
              companyUserId
          );

          res.json({ success: true, data: submission });
      } catch (error) {
          next(error);
      }
  }

  async paySubmission(req: Request, res: Response, next: NextFunction) {
      try {
          const companyUserId = req.user!.id;
          const submissionId = parseInt(req.params.id);
          const { cardHolderName, cardNumber, expireMonth, expireYear, cvv } = req.body;

          if (!cardHolderName || !cardNumber || !expireMonth || !expireYear || !cvv) {
              throw new AppError('Tüm kart bilgileri gereklidir.', 400);
          }

          const submission = await submissionService.paySubmission(
              submissionId,
              companyUserId,
              { cardHolderName, cardNumber, expireMonth, expireYear, cvv },
              req.user!.email
          );

          // Notify student that payment is escrowed and offer is made
          await notificationService.createNotification(
              submission.student_user_id,
              'Yeni İş Teklifi ve Bütçe Güvencesi',
              `"${submission.task.title}" görevi için şirket bütçeyi güvenceye aldı. Lütfen teklifi inceleyip yanıtlayın.`,
              'success',
              '/student/applications'
          );

          res.status(200).json({
              status: 'success',
              message: 'Bütçe başarıyla Escrow\'da kilitlendi.',
              data: { submission }
          });
      } catch (error) {
          next(error);
      }
  }

  async submitWork(req: Request, res: Response, next: NextFunction) {
      try {
          const studentId = req.user!.id;
          const submissionId = parseInt(req.params.id);
          const { workLink } = req.body;

          if (!workLink) {
              throw new AppError('Çalışma linki (workLink) gereklidir.', 400);
          }

          const submission = await submissionService.submitWork(submissionId, studentId, workLink);

          // Notify company
          await notificationService.createNotification(
              submission.task.company_user_id,
              'Görev Teslim Edildi',
              `"${submission.task.title}" görevi için çalışan çalışmasını teslim etti. Lütfen inceleyin.`,
              'info',
              `/company/tasks/${submission.task_id}/applicants/${submission.id}`
          );

          res.status(200).json({
              status: 'success',
              message: 'Çalışma başarıyla teslim edildi.',
              data: { submission }
          });
      } catch (error) {
          next(error);
      }
  }
  async respondToOffer(req: Request, res: Response, next: NextFunction) {
      try {
          const studentId = req.user!.id;
          const submissionId = parseInt(req.params.id);
          const { accept } = req.body;

          if (typeof accept !== 'boolean') {
              throw new AppError('Accept status must be a boolean (true/false).', 400);
          }

          const submission = await submissionService.respondToOffer(submissionId, studentId, accept);

          // Notify company
          const statusText = accept ? 'Kabul Etti' : 'Reddetti';
          await notificationService.createNotification(
              submission.task.company_user_id,
              'Teklif Yanıtlandı',
              `"${submission.task.title}" görevi için çalışan teklifinizi ${statusText}.`,
              accept ? 'success' : 'error',
              `/company/tasks/${submission.task_id}/applicants/${submission.id}`
          );

          res.status(200).json({
              status: 'success',
              message: accept ? 'Teklifi başarıyla kabul ettiniz.' : 'Teklifi reddettiniz.',
              data: { submission }
          });
      } catch (error) {
          next(error);
      }
  }

  async verifyGuarantee(req: Request, res: Response, next: NextFunction) {
      try {
          const { token } = req.params;
          if (!token) {
              throw new AppError('Sertifika kodu gerekli.', 400);
          }

          const details = await submissionService.getGuaranteeDetails(token);

          res.status(200).json({
              status: 'success',
              data: details
          });
      } catch (error) {
          next(error);
      }
  }
}