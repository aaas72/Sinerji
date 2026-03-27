import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { updateCompanyProfileSchema } from '../utils/validation';
import { z } from 'zod';

const prisma = new PrismaClient();

export class CompanyService {
  async getProfile(userId: number) {
    const profile = await prisma.companyProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            created_at: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError('Company profile not found', 404);
    }

    return profile;
  }

  async updateProfile(userId: number, data: z.infer<typeof updateCompanyProfileSchema>) {
    const profile = await prisma.companyProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new AppError('Company profile not found', 404);
    }

    const updatedProfile = await prisma.companyProfile.update({
      where: { user_id: userId },
      data: {
        ...data,
      },
    });

    return updatedProfile;
  }

  async getStats(userId: number) {
    const activeTasksCount = await prisma.task.count({
      where: {
        company_user_id: userId,
        status: 'open',
      },
    });

    const totalTasksCount = await prisma.task.count({
      where: {
        company_user_id: userId,
      },
    });

    const totalApplicationsCount = await prisma.submission.count({
      where: {
        task: {
          company_user_id: userId,
        },
      },
    });

    const pendingApplicationsCount = await prisma.submission.count({
      where: {
        task: {
          company_user_id: userId,
        },
        status: 'pending',
      },
    });

    const hiredStudentsCount = await prisma.submission.count({
      where: {
        task: {
          company_user_id: userId,
        },
        status: 'approved',
      },
    });

    const recentTasks = await prisma.task.findMany({
      where: {
        company_user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        created_at: true,
        _count: {
          select: { submissions: true },
        },
      },
    });

    const recentApplications = await prisma.submission.findMany({
      where: {
        task: {
          company_user_id: userId,
        },
      },
      orderBy: {
        submitted_at: 'desc',
      },
      take: 5,
      select: {
        id: true,
        status: true,
        submitted_at: true,
        task: {
          select: {
            title: true,
          },
        },
        student: {
          select: {
            full_name: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      activeTasks: activeTasksCount,
      totalTasks: totalTasksCount,
      totalApplications: totalApplicationsCount,
      pendingApplications: pendingApplicationsCount,
      hiredStudents: hiredStudentsCount,
      recentTasks,
      recentApplications,
    };
  }
}
