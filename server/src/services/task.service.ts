import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { createTaskSchema, updateTaskSchema } from '../utils/validation';
import { z } from 'zod';

const prisma = new PrismaClient();

interface TaskFilters {
  search?: string;
  category?: string;
}

export class TaskService {
  async getAllTasks(filters: TaskFilters) {
    const { search, category } = filters;

    const where: any = {
      status: 'Open' // By default, students should only see open tasks? Or maybe all. Let's say open.
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        company: {
          select: {
            company_name: true,
          },
        },
        requiredSkills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return tasks;
  }

  async getTaskById(taskId: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        company: {
          select: { company_name: true, website_url: true, description: true }
        },
        requiredSkills: {
          include: { skill: true }
        }
      }
    });

    if (!task) throw new AppError('Task not found', 404);
    return task;
  }

  // Company specific methods
  async getCompanyTasks(companyUserId: number) {
    return prisma.task.findMany({
      where: { company_user_id: companyUserId },
      include: {
        requiredSkills: { include: { skill: true } },
        _count: { select: { submissions: true } }
      },
      orderBy: { id: 'desc' }
    });
  }

  async createTask(companyUserId: number, data: z.infer<typeof createTaskSchema>) {
    const { hardSkills, softSkills, requiredSkills, deadline, ...taskData } = data;

    const task = await prisma.task.create({
      data: {
        ...taskData,
        status: 'Open',
        company_user_id: companyUserId,
        deadline: deadline && deadline.length > 0 ? new Date(deadline) : null,
      },
    });

    // Persist hard skills with rich metadata
    if (hardSkills && hardSkills.length > 0) {
      for (const hs of hardSkills) {
        let skill = await prisma.skill.findUnique({ where: { name: hs.skill } });
        if (!skill) skill = await prisma.skill.create({ data: { name: hs.skill } });
        await prisma.taskSkill.create({
          data: {
            task_id: task.id,
            skill_id: skill.id,
            level: hs.level,
            is_required: hs.isRequired,
            years_of_experience: hs.yearsOfExperience ?? null,
          },
        });
      }
    }

    return this.getTaskById(task.id);
  }

  async updateTask(companyUserId: number, taskId: number, data: z.infer<typeof updateTaskSchema>) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) throw new AppError('Task not found', 404);
    if (task.company_user_id !== companyUserId) throw new AppError('Not authorized to update this task', 403);

    const { hardSkills, softSkills, requiredSkills, deadline, ...updateData } = data;

    await prisma.task.update({
      where: { id: taskId },
      data: {
        ...updateData,
        deadline: deadline && deadline.length > 0 ? new Date(deadline) : undefined,
      },
    });

    // Re-sync hard skills if provided
    if (hardSkills && hardSkills.length > 0) {
      await prisma.taskSkill.deleteMany({ where: { task_id: taskId } });
      for (const hs of hardSkills) {
        let skill = await prisma.skill.findUnique({ where: { name: hs.skill } });
        if (!skill) skill = await prisma.skill.create({ data: { name: hs.skill } });
        await prisma.taskSkill.create({
          data: {
            task_id: taskId,
            skill_id: skill.id,
            level: hs.level,
            is_required: hs.isRequired,
            years_of_experience: hs.yearsOfExperience ?? null,
          },
        });
      }
    }

    return this.getTaskById(taskId);
  }

  async deleteTask(companyUserId: number, taskId: number) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) throw new AppError('Task not found', 404);
    if (task.company_user_id !== companyUserId) throw new AppError('Not authorized to delete this task', 403);

    // Delete relations first or rely on cascade
    // Delete reviews and awarded badges for submissions of this task
    const submissions = await prisma.submission.findMany({ where: { task_id: taskId } });
    for (const sub of submissions) {
      const review = await prisma.review.findUnique({ where: { submission_id: sub.id } });
      if (review) {
        await prisma.awardedBadge.deleteMany({ where: { review_id: sub.id } });
        await prisma.review.delete({ where: { submission_id: sub.id } });
      }
    }

    await prisma.taskSkill.deleteMany({ where: { task_id: taskId } });
    await prisma.submission.deleteMany({ where: { task_id: taskId } });

    await prisma.task.delete({ where: { id: taskId } });

    return { message: 'Task deleted successfully' };
  }
}
