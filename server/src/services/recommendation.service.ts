import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { z } from 'zod';
import { createRecommendationSchema } from '../utils/validation';

const prisma = new PrismaClient();

export class RecommendationService {
  async createRecommendation(companyUserId: number, data: z.infer<typeof createRecommendationSchema>) {
    const { studentUserId, content } = data;

    // Verify student exists
    const student = await prisma.studentProfile.findUnique({
      where: { user_id: studentUserId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Check if recommendation already exists from this company to this student?
    // Maybe allow multiple? Or one per company? Let's restrict to one per company for now to avoid spam.
    const existingRecommendation = await prisma.recommendation.findFirst({
        where: {
            company_user_id: companyUserId,
            student_user_id: studentUserId
        }
    });

    if (existingRecommendation) {
        throw new AppError('You have already written a recommendation for this student', 400);
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        company_user_id: companyUserId,
        student_user_id: studentUserId,
        content,
      },
      include: {
        company: {
            select: {
                company_name: true,
                website_url: true
            }
        }
      }
    });

    return recommendation;
  }

  async getStudentRecommendations(studentUserId: number) {
      return prisma.recommendation.findMany({
          where: { student_user_id: studentUserId },
          include: {
              company: {
                  select: {
                      company_name: true,
                      website_url: true,
                      description: true
                  }
              }
          },
          orderBy: {
              created_at: 'desc'
          }
      });
  }
}
