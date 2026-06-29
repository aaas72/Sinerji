import { PrismaClient } from '../server/node_modules/@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const taskId = 55;
  
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task) {
    console.error('Task not found');
    return;
  }

  const skills = [
    { name: 'React', level: 3, isRequired: true },
    { name: 'Node.js', level: 3, isRequired: true },
    { name: 'Figma', level: 2, isRequired: false }
  ];

  for (const s of skills) {
    const skillRecord = await prisma.skill.findFirst({ where: { name: s.name } }) || await prisma.skill.create({ data: { name: s.name } });
    
    // Create task skill if it doesn't exist
    const existing = await prisma.taskSkill.findFirst({
      where: { task_id: taskId, skill_id: skillRecord.id }
    });
    
    if (!existing) {
      await prisma.taskSkill.create({
        data: {
          task_id: taskId,
          skill_id: skillRecord.id,
          level: s.level,
          is_required: s.isRequired
        }
      });
    }
  }

  console.log(`Görev ${taskId} için yetenekler başarıyla eklendi!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
