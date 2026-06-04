// Student service for profile and task management
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { updateStudentProfileSchema, addSkillSchema } from '../utils/validation';
import { z } from 'zod';



export class StudentService {
  async getAllStudents() {
    const students = await prisma.studentProfile.findMany({
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        user: {
          select: {
            email: true,
            role: true,
            created_at: true,
          },
        },
      },
    });
    return students;
  }

  async getProfile(userId: number) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        recommendations: {
          include: {
            company: true,
          },
        },
        submissions: {
          where: {
            status: 'approved',
          },
          include: {
            task: {
              include: {
                company: true,
              },
            },
            review: {
              include: {
                awardedBadges: {
                  include: {
                    badge: true
                  }
                }
              }
            },
          },
        },
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
      throw new AppError('Student profile not found', 404);
    }

    return profile;
  }

  async updateProfile(userId: number, data: z.infer<typeof updateStudentProfileSchema>) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404);
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { user_id: userId },
      data: {
        ...data,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return updatedProfile;
  }

  async addSkill(userId: number, skillName: string, category: string = "General", level: number = 3) {
    // Check if skill exists, if not create it
    let skill = await prisma.skill.findUnique({
      where: { name: skillName },
    });

    if (!skill) {
      skill = await prisma.skill.create({
        data: { name: skillName },
      });
    }

    // Check if student already has this skill
    const existingStudentSkill = await prisma.studentSkill.findUnique({
      where: {
        student_user_id_skill_id: {
          student_user_id: userId,
          skill_id: skill.id,
        },
      },
    });

    if (existingStudentSkill) {
      // Update category if it exists but user wants to change/re-add it? 
      // Or just throw error?
      // Let's allow updating category if it exists
      await prisma.studentSkill.update({
        where: {
          student_user_id_skill_id: {
            student_user_id: userId,
            skill_id: skill.id,
          }
        },
        data: { category, level }
      });
    } else {
      // Add skill to student
      await prisma.studentSkill.create({
        data: {
          student_user_id: userId,
          skill_id: skill.id,
          category,
          level,
        },
      });
    }

    return this.getProfile(userId);
  }

  async removeSkill(userId: number, skillId: number) {
    const existingStudentSkill = await prisma.studentSkill.findUnique({
      where: {
        student_user_id_skill_id: {
          student_user_id: userId,
          skill_id: skillId,
        },
      },
    });

    if (!existingStudentSkill) {
      throw new AppError('Skill not found in student profile', 404);
    }

    await prisma.studentSkill.delete({
      where: {
        student_user_id_skill_id: {
          student_user_id: userId,
          skill_id: skillId,
        },
      },
    });

    return this.getProfile(userId);
  }

  async getStats(userId: number) {
    const completedTasksCount = await prisma.submission.count({
      where: {
        student_user_id: userId,
        status: 'approved',
      },
    });

    const totalApplicationsCount = await prisma.submission.count({
      where: {
        student_user_id: userId,
      },
    });

    // Calculate average rating from reviews on student's submissions
    const reviews = await prisma.review.aggregate({
      where: {
        submission: {
          student_user_id: userId,
        },
      },
      _avg: {
        rating: true,
      },
    });

    const badgesEarnedCount = await prisma.awardedBadge.count({
      where: {
        review: {
          submission: {
            student_user_id: userId,
          },
        },
      },
    });

    return {
      completedTasks: completedTasksCount,
      totalApplications: totalApplicationsCount,
      averageRating: reviews._avg.rating || 0,
      badgesEarned: badgesEarnedCount,
    };
  }

  async saveTask(userId: number, taskId: number) {
    return prisma.savedTask.upsert({
      where: {
        student_user_id_task_id: {
          student_user_id: userId,
          task_id: taskId,
        },
      },
      update: {},
      create: {
        student_user_id: userId,
        task_id: taskId,
      },
    });
  }

  async unsaveTask(userId: number, taskId: number) {
    return prisma.savedTask.delete({
      where: {
        student_user_id_task_id: {
          student_user_id: userId,
          task_id: taskId,
        },
      },
    });
  }

  async getSavedTasks(userId: number) {
    const saved = await prisma.savedTask.findMany({
      where: { student_user_id: userId },
      include: {
        task: {
          include: {
            company: true,
            requiredSkills: {
              include: { skill: true }
            }
          }
        }
      },
      orderBy: { saved_at: 'desc' }
    });
    return saved.map((s: any) => s.task);
  }

  async verifyDocument(userId: number, fileBuffer: Buffer, fileName: string, mimeType: string) {
    const FormData = require('form-data');
    const axios = require('axios');

    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404);
    }

    if (profile.is_verified) {
      throw new AppError('Profile is already verified', 400);
    }

    const verifyUrl = process.env.STUDENT_VERIFICATION_SERVICE_URL 
      ? `${process.env.STUDENT_VERIFICATION_SERVICE_URL}/api/verify-student`
      : 'http://localhost:4000/api/verify-student';

    try {
      const formData = new FormData();
      formData.append('document', fileBuffer, {
        filename: fileName,
        contentType: mimeType,
      });

      const response = await axios.post(verifyUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          // Optional: 'x-api-key': process.env.VERIFY_SERVICE_API_KEY
        },
      });

      const data = response.data;

      if (data.success && data.verified) {
        // Verification succeeded! Update student profile
        const updatedProfile = await prisma.studentProfile.update({
          where: { user_id: userId },
          data: {
            is_verified: true,
            university: data.university || profile.university,
            major: data.program || profile.major,
            // You can also capture full_name if you want to strictly match it
          },
        });

        return {
          success: true,
          message: 'Student verified successfully',
          profile: updatedProfile,
        };
      } else {
        throw new AppError(data.error || data.message || 'Verification failed', 400);
      }
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new AppError(`Verification service error: ${errMsg}`, 500);
    }
  }
}
