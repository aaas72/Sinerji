import { PrismaClient } from '../server/node_modules/@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'student1@example.com' }
  });

  if (!user) {
    console.error('User not found');
    return;
  }

  // Find or create skills
  const skills = [
    { name: 'React', level: 5 },
    { name: 'Node.js', level: 4 },
    { name: 'TypeScript', level: 5 },
    { name: 'Next.js', level: 5 },
    { name: 'Tailwind CSS', level: 5 },
    { name: 'PostgreSQL', level: 4 },
    { name: 'MongoDB', level: 4 },
    { name: 'Python', level: 3 },
    { name: 'Git', level: 5 },
    { name: 'Docker', level: 3 },
    { name: 'GraphQL', level: 4 },
    { name: 'Redux', level: 4 },
    { name: 'Figma', level: 3 }
  ];

  const skillRecords = [];
  for (const s of skills) {
    const record = await prisma.skill.findFirst({ where: { name: s.name } }) || await prisma.skill.create({ data: { name: s.name } });
    skillRecords.push({ ...record, targetLevel: s.level });
  }

  // Update profile
  await prisma.studentProfile.update({
    where: { user_id: user.id },
    data: {
      full_name: 'Öğrenci 1 (Senior Fullstack Developer)',
      bio: 'Ben tutkulu bir yazılım geliştiricisiyim. Modern web teknolojileriyle (React, Next.js, Node.js, TypeScript) kullanıcı dostu ve ölçeklenebilir uygulamalar geliştirmeyi seviyorum. Hem Frontend hem de Backend tarafında güçlü deneyimim var. Sürekli öğrenmeye ve kendimi geliştirmeye açığım.',
      major: 'Bilgisayar Mühendisliği',
      graduation_year: 2024,
      github_url: 'https://github.com/ogrenci1-dev',
      website_url: 'https://ogrenci1.dev',
      categories_of_interest: 'Web Geliştirme, Frontend, Backend, Fullstack, Yapay Zeka',
      is_verified: true,
      is_university_email_verified: true,
      sub_merchant_key: 'TR123456789012345678901234'
    }
  });

  // Assign skills
  await prisma.studentSkill.deleteMany({ where: { student_user_id: user.id } });
  await prisma.studentSkill.createMany({
    data: skillRecords.map(s => ({
      student_user_id: user.id,
      skill_id: s.id,
      level: s.targetLevel
    }))
  });

  console.log('Öğrenci 1 profili başarıyla güncellendi ve güçlendirildi.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
