import { PrismaClient } from '../server/node_modules/@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const task = await prisma.task.findUnique({
    where: { id: 55 }
  });

  const company = await prisma.user.findUnique({
    where: { id: task?.company_user_id }
  });

  console.log('Company Email:', company?.email);
}

main().finally(() => prisma.$disconnect());
