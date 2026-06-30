import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Truncating tables...');
  const tables = [
    'awarded_badges', 'reviews', 'submissions', 'task_skills', 'tasks',
    'student_skills', 'recommendations', 'student_profiles', 'company_profiles',
    'badges', 'skills', 'users'
  ];
  
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
  }
  console.log('Database cleared successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
