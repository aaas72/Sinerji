import { PrismaClient } from '../server/node_modules/@prisma/client';
import bcrypt from '../server/node_modules/bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load the .env from the server directory
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const prisma = new PrismaClient();

async function main() {
  console.log("Veritabanı temizleniyor...");
  
  try {
    // Delete in reverse order of dependencies to avoid foreign key constraints
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.savedTask.deleteMany();
    await prisma.awardedBadge.deleteMany();
    await prisma.review.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.taskSkill.deleteMany();
    await prisma.task.deleteMany();
    await prisma.studentSkill.deleteMany();
    await prisma.recommendation.deleteMany();
    await prisma.companyProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();

    console.log("Veritabanı temizlendi.");
  } catch (error) {
    console.error("Veritabanı temizlenemedi. PostgreSQL sunucusu çalışıyor mu?");
    console.error(error);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create 10 Companies
  const companies = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `company${i}@example.com`,
        password_hash: passwordHash,
        role: 'company',
        companyProfile: {
          create: {
            company_name: `Şirket ${i} A.Ş.`,
            description: `Kendi alanımızda lider bir şirketiz. En iyi hizmeti sunmayı hedefliyoruz.`,
            industry: ['Tasarım', 'Pazarlama', 'Finans', 'Eğitim', 'Teknoloji'][i % 5],
            location: 'İstanbul, Türkiye'
          }
        }
      },
      include: { companyProfile: true }
    });
    companies.push(user);
  }
  console.log("10 şirket hesabı oluşturuldu.");

  // 2. Create 20 Students
  for (let i = 1; i <= 20; i++) {
    await prisma.user.create({
      data: {
        email: `student${i}@example.com`,
        password_hash: passwordHash,
        role: 'student',
        studentProfile: {
          create: {
            full_name: `Öğrenci ${i}`,
            university: `Sinerji Üniversitesi`,
            bio: `Deneyim kazanmak için fırsatlar arayan hırslı bir öğrenciyim.`,
            major: ['Bilgisayar Mühendisliği', 'İşletme', 'Grafik Tasarım', 'Mühendislik', 'Edebiyat'][i % 5],
            graduation_year: 2026,
            is_verified: true
          }
        }
      }
    });
  }
  console.log("20 öğrenci hesabı oluşturuldu.");

  // 3. Create 2 Tasks for each Company in various fields with varying rewards
  const fields = [
    { category: 'Tasarım', title: 'Yeni Bir Girişim İçin Logo Tasarımı', reward: '100 USD' },
    { category: 'Pazarlama', title: 'Sosyal Medya Kampanya Yönetimi', reward: '150 USD' },
    { category: 'İçerik Yazarlığı', title: 'Yapay Zeka Hakkında 5 Blog Yazısı', reward: '80 USD' },
    { category: 'Çeviri', title: 'Web Sitesini İngilizceye Çevirme', reward: '120 USD' },
    { category: 'Video Kurgu', title: 'Ürün Tanıtım Videosu Düzenleme', reward: '200 USD' },
    { category: 'Veri Girişi', title: 'Verileri Excel Tablolarına Ekleme', reward: '50 USD' },
    { category: 'Muhasebe', title: 'Aylık Ön Muhasebe Desteği', reward: '180 USD' },
    { category: 'Araştırma', title: 'E-Ticaret Pazar Araştırması', reward: '130 USD' },
    { category: 'Programlama', title: 'İnteraktif Açılış Sayfası Geliştirme', reward: '250 USD' },
    { category: 'Müşteri Destek', title: 'E-posta Üzerinden Müşteri Sorularını Yanıtlama', reward: '90 USD' },
  ];

  let taskCount = 0;
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    // Pick two different fields for this company
    const field1 = fields[(i * 2) % fields.length];
    const field2 = fields[(i * 2 + 1) % fields.length];

    await prisma.task.create({
      data: {
        company_user_id: company.id,
        title: field1.title,
        description: `Şu konuda bize yardımcı olacak yetenekli birini arıyoruz: ${field1.title}.`,
        category: field1.category,
        reward_type: 'paid',
        reward_amount: field1.reward,
        status: 'Open',
        deadline: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      }
    });

    await prisma.task.create({
      data: {
        company_user_id: company.id,
        title: field2.title,
        description: `Şu konuda bize yardımcı olacak yetenekli birini arıyoruz: ${field2.title}.`,
        category: field2.category,
        reward_type: 'paid',
        reward_amount: field2.reward,
        status: 'Open',
        deadline: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
      }
    });
    
    taskCount += 2;
  }
  
  console.log(`Çeşitli alanlarda ${taskCount} görev oluşturuldu.`);
  console.log("Veri ekleme tamamlandı! (Öğrenci başvurusu oluşturulmadı)");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
