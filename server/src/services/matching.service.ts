import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

// Matching Service to calculate match percentages between students and tasks
export class MatchingService {
  
  // Get tasks that match a student's skills
  async getRecommendedTasksForStudent(studentUserId: number) {
    const student = await prisma.studentProfile.findUnique({
      where: { user_id: studentUserId },
      include: { skills: { include: { skill: true } } }
    });

    if (!student) throw new AppError('Student profile not found', 404);

    const studentSkillNames = student.skills.map((s: any) => s.skill.name.toLowerCase());

    const tasks = await prisma.task.findMany({
      where: { status: 'Open' },
      include: {
        company: { select: { company_name: true, logo_url: true } },
        requiredSkills: { include: { skill: true } }
      }
    });

    const matchedTasks = tasks.map((task: any) => {
      const requiredSkillsCount = task.requiredSkills.length;
      let matchCount = 0;

      if (requiredSkillsCount === 0) {
        return { ...task, matchPercentage: 0 };
      }

      task.requiredSkills.forEach((taskSkill: any) => {
         if (studentSkillNames.includes(taskSkill.skill.name.toLowerCase())) {
            matchCount++;
         }
      });

      const matchPercentage = Math.round((matchCount / requiredSkillsCount) * 100);
      return { ...task, matchPercentage };
    });

    return matchedTasks
      .filter((t: any) => t.matchPercentage > 0)
      .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);
  }

  // Get students who match a task's required skills
  async getMatchingStudentsForTask(companyUserId: number, taskId: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId, company_user_id: companyUserId },
      include: { requiredSkills: { include: { skill: true } } }
    });

    if (!task) throw new AppError('Task not found or not authorized', 404);

    const requiredSkillNames = task.requiredSkills.map((ts: any) => ts.skill.name.toLowerCase());
    if (requiredSkillNames.length === 0) return [];

    const taskSkillIds = task.requiredSkills.map((ts: any) => ts.skill_id);

    const students = await prisma.studentProfile.findMany({
      where: {
        skills: {
          some: {
            skill_id: { in: taskSkillIds }
          }
        }
      },
      include: {
        skills: { include: { skill: true } },
        user: { select: { email: true } }
      }
    });

    const matchedStudents = students.map((student: any) => {
      let matchCount = 0;
      const studentSkillNames = student.skills.map((s: any) => s.skill.name.toLowerCase());

      requiredSkillNames.forEach((req: string) => {
        if (studentSkillNames.includes(req)) matchCount++;
      });

      const matchPercentage = Math.round((matchCount / requiredSkillNames.length) * 100);
      return { ...student, matchPercentage };
    });

    return matchedStudents
      .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);
  }
}
