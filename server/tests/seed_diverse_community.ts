import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  // Delete all data respecting foreign keys
  await prisma.transaction.deleteMany();
  await prisma.companyReview.deleteMany();
  await prisma.awardedBadge.deleteMany();
  await prisma.review.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.taskSkill.deleteMany();
  await prisma.savedTask.deleteMany();
  await prisma.task.deleteMany();
  
  await prisma.studentSkill.deleteMany();
  // Optional: keep static skills
  // await prisma.skill.deleteMany();
  
  await prisma.recommendation.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();

  await prisma.companyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('Database cleaned successfully.');

  const defaultPassword = await bcrypt.hash('Password123!', 12);

  // Diverse Companies
  const companiesData = [
    { name: 'TechNova', industry: 'Software Engineering', domain: 'technova.com' },
    { name: 'HealthSync', industry: 'Healthcare tech', domain: 'healthsync.co' },
    { name: 'FinTrust', industry: 'Financial Services', domain: 'fintrust.bank' },
    { name: 'BuildWell', industry: 'Construction', domain: 'buildwell.com' },
    { name: 'MarketPulse', industry: 'Marketing & Advertising', domain: 'marketpulse.agency' },
    { name: 'EcoEnergy', industry: 'Renewable Energy', domain: 'ecoenergy.org' }
  ];

  console.log('Creating diverse companies...');
  for (const comp of companiesData) {
    await prisma.user.create({
      data: {
        email: `contact@${comp.domain}`,
        password_hash: defaultPassword,
        role: 'COMPANY',
        companyProfile: {
          create: {
            company_name: comp.name,
            industry: comp.industry,
            description: `A leading company in ${comp.industry}.`,
            location: 'Istanbul, Turkey',
            website_url: `https://www.${comp.domain}`
          }
        }
      }
    });
  }

  // Diverse Students
  const studentsData = [
    { major: 'Computer Science', interests: 'Software Engineering, AI, Web Development' },
    { major: 'Graphic Design', interests: 'UI/UX, Branding, Illustration' },
    { major: 'Business Administration', interests: 'Management, Finance, Operations' },
    { major: 'Data Science', interests: 'Machine Learning, Data Analysis, Statistics' },
    { major: 'Mechanical Engineering', interests: 'Robotics, Automation, Manufacturing' },
    { major: 'Architecture', interests: 'Urban Design, Sustainable Building' },
    { major: 'Marketing', interests: 'Digital Marketing, SEO, Content Creation' },
    { major: 'Law', interests: 'Corporate Law, Intellectual Property' },
    { major: 'Medicine', interests: 'Clinical Research, Public Health' },
    { major: 'Psychology', interests: 'Human Resources, Organizational Behavior' }
  ];

  console.log('Creating diverse students...');
  for (let i = 0; i < studentsData.length; i++) {
    const sd = studentsData[i];
    await prisma.user.create({
      data: {
        email: `student${i+1}@university.edu`,
        password_hash: defaultPassword,
        role: 'STUDENT',
        studentProfile: {
          create: {
            full_name: `Student ${i+1}`,
            major: sd.major,
            categories_of_interest: sd.interests,
            university: 'Global University',
            bio: `I am passionate about ${sd.major} and eager to learn.`,
            availability_status: 'available',
            graduation_year: 2026 + (i % 4)
          }
        }
      }
    });
  }

  console.log('✅ Diverse community of companies and students seeded successfully!');
  console.log('Note: No tasks or submissions have been created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
