import prisma from '../lib/prisma';



export class SkillService {
  async getAllSkills() {
    return prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
