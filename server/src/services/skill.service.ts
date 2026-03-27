import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SkillService {
  async getAllSkills() {
    return prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
