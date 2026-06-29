import { PrismaClient } from '../server/node_modules/@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const taskId = 55;
  const studentEmail = 'student1@example.com';

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      company: true
    }
  });

  if (!task) {
    console.error('Task not found');
    return;
  }

  const student = await prisma.user.findUnique({
    where: { email: studentEmail }
  });

  if (!student) {
    console.error('Student not found');
    return;
  }

  // Check if submission already exists
  const existing = await prisma.submission.findFirst({
    where: { task_id: taskId, student_user_id: student.id }
  });

  if (!existing) {
    await prisma.submission.create({
      data: {
        task_id: taskId,
        student_user_id: student.id,
        submission_content: 'Bu görev için gerekli tüm yeteneklere ve tecrübeye sahibim. Daha önce benzer projeler geliştirdim. İlgili teknolojilerdeki uzmanlığım sayesinde bu görevi başarıyla ve zamanında teslim edebilirim.',
        status: 'submitted',
        proposed_budget: task.reward_amount ? Number(task.reward_amount) : 0,
        estimated_delivery_days: 14,
        payment_status: 'pending'
      }
    });
    console.log('Başvuru başarıyla oluşturuldu!');
  } else {
    console.log('Başvuru zaten mevcut.');
  }

  console.log(`Şirket E-postası: ${task.company.email}`);
  console.log(`Şirket Şifresi: password123`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
