import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { createReviewSchema, createCompanyReviewSchema } from '../utils/validation';
import { z } from 'zod';



export class ReviewService {
    async createReview(companyUserId: number, submissionId: number, data: z.infer<typeof createReviewSchema>) {
        // Get submission and verify it exists
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: { task: true }
        });

        if (!submission) {
            throw new AppError('Submission not found', 404);
        }

        // Verify company owns the task
        if (submission.task.company_user_id !== companyUserId) {
            throw new AppError('Not authorized to review this submission', 403);
        }

        // Verify the submission is completed and approved
        if (submission.status !== 'approved') {
            throw new AppError('Görev henüz tamamlanıp onaylanmadığı için değerlendirme yapılamaz.', 400);
        }

        // Check if review already exists
        const existingReview = await prisma.review.findUnique({
            where: { submission_id: submissionId }
        });

        if (existingReview) {
            throw new AppError('Submission already reviewed', 400);
        }

        // Transaction to create review and update submission status
        const review = await prisma.$transaction(async (tx) => {
            const newReview = await tx.review.create({
                data: {
                    submission_id: submissionId,
                    rating: data.rating,
                    feedback: data.feedback
                }
            });

            // Award badges if any
            if (data.badgeIds && data.badgeIds.length > 0) {
                for (const badgeId of data.badgeIds) {
                    await tx.awardedBadge.create({
                        data: {
                            review_id: submissionId,
                            badge_id: badgeId
                        }
                    });
                }
            }

            // Update submission status
            await tx.submission.update({
                where: { id: submissionId },
                data: { status: 'reviewed' }
            });

            return newReview;
        });

        return review;
    }

    async getReview(submissionId: number) {
        const review = await prisma.review.findUnique({
            where: { submission_id: submissionId },
            include: {
                awardedBadges: {
                    include: { badge: true }
                }
            }
        });

        if (!review) throw new AppError('Review not found', 404);
        return review;
    }

    async createCompanyReview(studentUserId: number, submissionId: number, data: z.infer<typeof createCompanyReviewSchema>) {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: { task: true }
        });

        if (!submission) {
            throw new AppError('Submission not found', 404);
        }

        if (submission.student_user_id !== studentUserId) {
            throw new AppError('Not authorized', 403);
        }

        if (submission.status !== 'approved' && submission.status !== 'reviewed') {
            throw new AppError('Görev henüz tamamlanmadığı için değerlendirme yapılamaz.', 400);
        }

        const existingReview = await prisma.companyReview.findUnique({
            where: { submission_id: submissionId }
        });

        if (existingReview) {
            throw new AppError('You have already reviewed this company for this task.', 400);
        }

        return prisma.companyReview.create({
            data: {
                submission_id: submissionId,
                rating: data.rating,
                feedback: data.feedback
            }
        });
    }
}
