import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { MailService } from './mail.service';

const mailService = new MailService();

export class CronService {
  /**
   * Auto-cancel submissions where student accepted the offer but failed to deliver the work before the deadline + grace period.
   * Refunds the company.
   */
  async autoCancelOverdueSubmissions() {
    console.log('[Cron] Running autoCancelOverdueSubmissions...');
    // Find submissions that are 'accepted' but task deadline has passed
    const now = new Date();
    // We add a grace period of 3 days
    const gracePeriod = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const overdueSubmissions = await prisma.submission.findMany({
      where: {
        status: 'accepted',
        task: {
          deadline: {
            lt: gracePeriod // Deadline was more than 3 days ago
          }
        }
      },
      include: {
        task: true,
        student: { include: { user: true } }
      }
    });

    let cancelledCount = 0;

    for (const submission of overdueSubmissions) {
      try {
        let paymentStatusUpdate = undefined;
        if (submission.payment_status === 'escrow_locked' && submission.payment_transaction_id) {
          await this.cancelPayment(submission.payment_transaction_id);
          paymentStatusUpdate = 'cancelled';
        }

        await prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: 'rejected',
            ...(paymentStatusUpdate ? { payment_status: paymentStatusUpdate } : {})
          }
        });
        
        cancelledCount++;
        console.log(`[Cron] Auto-cancelled submission ${submission.id} for task ${submission.task_id}`);
      } catch (error) {
        console.error(`[Cron] Error auto-cancelling submission ${submission.id}:`, error);
      }
    }

    return { message: `Auto-cancelled ${cancelledCount} overdue submissions.` };
  }

  /**
   * Auto-approve submissions where student delivered the work but the company has not reviewed it within 7 days.
   * Releases money to the student.
   */
  async autoApproveSubmissions() {
    console.log('[Cron] Running autoApproveSubmissions...');
    // Submissions that are 'submitted' for more than 7 days
    const now = new Date();
    const reviewPeriod = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // We don't have a 'submitted_at' timestamp on the submission model!
    // As a fallback, we check if the task deadline was more than 7 days ago,
    // assuming they submitted before the deadline.
    // Or we could check the "updated_at" but we don't have that either in schema.
    // Let's use task deadline + 7 days as the auto-approve trigger.
    
    const unreviewedSubmissions = await prisma.submission.findMany({
      where: {
        status: 'submitted',
        task: {
          deadline: {
            lt: reviewPeriod
          }
        }
      },
      include: {
        task: true
      }
    });

    let approvedCount = 0;

    for (const submission of unreviewedSubmissions) {
      try {
        let paymentStatusUpdate = undefined;
        if (submission.payment_status === 'escrow_locked' && submission.payment_transaction_id) {
          await this.releasePayment(submission.payment_transaction_id);
          paymentStatusUpdate = 'released';
        }

        await prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: 'approved',
            ...(paymentStatusUpdate ? { payment_status: paymentStatusUpdate } : {})
          }
        });

        approvedCount++;
        console.log(`[Cron] Auto-approved submission ${submission.id} for task ${submission.task_id}`);
      } catch (error) {
        console.error(`[Cron] Error auto-approving submission ${submission.id}:`, error);
      }
    }

    return { message: `Auto-approved ${approvedCount} submissions.` };
  }

  /**
   * Mark open tasks as Expired if the deadline has passed and no active submissions.
   */
  async expireTasks() {
    console.log('[Cron] Running expireTasks...');
    const now = new Date();

    const expiredTasks = await prisma.task.findMany({
      where: {
        status: { in: ['Open', 'open'] },
        deadline: { lt: now }
      }
    });

    let expiredCount = 0;

    for (const task of expiredTasks) {
      const activeSubmissionsCount = await prisma.submission.count({
        where: {
          task_id: task.id,
          status: { in: ['offered', 'accepted', 'submitted', 'approved', 'reviewed'] }
        }
      });

      if (activeSubmissionsCount === 0) {
        await prisma.task.update({
          where: { id: task.id },
          data: { status: 'Expired' }
        });
        expiredCount++;
        console.log(`[Cron] Expired task ${task.id}`);
      }
    }

    return { message: `Expired ${expiredCount} tasks.` };
  }

  // --- Helper Methods for Payments ---
  private async cancelPayment(paymentTransactionId: string) {
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001';
    const axios = require('axios');
    const response = await axios.post(`${paymentServiceUrl}/api/payments/cancel`, {
      paymentTransactionId
    });
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Payment cancel failed');
    }
    return true;
  }

  private async releasePayment(paymentTransactionId: string) {
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001';
    const axios = require('axios');
    const response = await axios.post(`${paymentServiceUrl}/api/payments/release`, {
      paymentTransactionId
    });
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Payment release failed');
    }
    return true;
  }
}
