/**
 * =============================================================================
 * Sinerji Payment Escrow End-to-End Integration Test
 * =============================================================================
 * How to Run:
 *   cd d:\UN\4\1\BP\Sinerji_Project\tests
 *   npx ts-node payment_flow_test.ts
 * =============================================================================
 */

import http from "http";
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "../server/node_modules/@prisma/client";

// Load environment variables from core backend
dotenv.config({ path: path.join(__dirname, "../server/.env") });

const SERVER = "http://localhost:5000/api";
const prisma = new PrismaClient();

// Helper to make HTTP requests
function request(
  method: string, url: string,
  body?: object, headers?: Record<string, string>
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const payload = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        ...(headers || {}),
      },
    };
    const req = http.request(opts, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        let data: any;
        try { data = JSON.parse(raw); } catch { data = raw; }
        resolve({ status: res.statusCode || 0, data });
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function log(msg: string) {
  console.log(`  [TEST] ${msg}`);
}

async function runTest() {
  console.log("\n=================================================================");
  console.log("🚀 STARTING SINERJI PAYMENT ESCROW INTEGRATION TEST");
  console.log("=================================================================\n");

  const rand = Math.random().toString(36).substring(7);
  const studentEmail = `student_${rand}@sinerji-test.com`;
  const companyEmail = `company_${rand}@sinerji-test.com`;
  const password = "TestPassword123!";

  // 1. Register & Login Student
  log(`1. Student kaydediliyor: ${studentEmail}`);
  const regStudentRes = await request("POST", `${SERVER}/auth/register`, {
    email: studentEmail,
    password,
    role: "student",
    full_name: `Öğrenci Ahmet Yılmaz`
  });
  if (regStudentRes.status >= 400) {
    throw new Error(`Student registration failed: ${JSON.stringify(regStudentRes.data)}`);
  }

  const loginStudentRes = await request("POST", `${SERVER}/auth/login`, {
    email: studentEmail,
    password
  });
  const studentToken = loginStudentRes.data.data.token;
  const studentId = loginStudentRes.data.data.user.id;
  log(`Student login başarılı. Kullanıcı ID: ${studentId}`);

  // Satisfy profile requirements for submissions
  await prisma.studentProfile.update({
    where: { user_id: studentId },
    data: {
      is_verified: true, // Auto-verify student for submission
      university: "İstanbul Teknik Üniversitesi",
      major: "Bilgisayar Mühendisliği",
      graduation_year: 2026,
      github_url: "https://github.com/ahmetyilmaz",
      phone: "+905555555555"
    }
  });
  // Add a dummy skill
  let skill = await prisma.skill.findUnique({ where: { name: "Node.js" } });
  if (!skill) {
    skill = await prisma.skill.create({ data: { name: "Node.js" } });
  }

  await prisma.studentSkill.create({
    data: {
      student_user_id: studentId,
      skill_id: skill.id,
      category: "Backend Development",
      level: 4
    }
  });
  log(`Student profili güncellendi, doğrulandı ve yetenek eklendi.`);


  // 2. Register Student Bank Details (Creates Sub-merchant on Iyzico)
  log("2. Student banka detayları tanımlanıyor (Iyzico Sub-Merchant)...");
  const bankSetupRes = await request("POST", `${SERVER}/students/bank-setup`, {
    name: "Ahmet",
    surname: "Yılmaz",
    email: studentEmail,
    gsmNumber: "+905555555555",
    identityNumber: "11111111111",
    iban: "TR020006200035600006294884",
    address: "Kadıköy, İstanbul"
  }, { Authorization: `Bearer ${studentToken}` });

  if (bankSetupRes.status >= 400) {
    throw new Error(`Bank setup failed: ${JSON.stringify(bankSetupRes.data)}`);
  }
  const subMerchantKey = bankSetupRes.data.data.profile.sub_merchant_key;
  log(`Banka hesabı tanımlandı. Iyzico Sub-Merchant Anahtarı: ${subMerchantKey}`);

  // 3. Register & Login Company
  log(`3. Şirket kaydediliyor: ${companyEmail}`);
  const regCompanyRes = await request("POST", `${SERVER}/auth/register`, {
    email: companyEmail,
    password,
    role: "company",
    company_name: `Test Şirket A.Ş.`
  });
  if (regCompanyRes.status >= 400) {
    throw new Error(`Company registration failed: ${JSON.stringify(regCompanyRes.data)}`);
  }

  const loginCompanyRes = await request("POST", `${SERVER}/auth/login`, {
    email: companyEmail,
    password
  });
  const companyToken = loginCompanyRes.data.data.token;
  const companyId = loginCompanyRes.data.data.user.id;
  log(`Şirket login başarılı. Kullanıcı ID: ${companyId}`);

  // Satisfy profile requirements for company
  await prisma.companyProfile.update({
    where: { user_id: companyId },
    data: {
      location: "Beşiktaş, İstanbul"
    }
  });

  // 4. Create Task by Company
  log("4. Görev oluşturuluyor...");
  const createTaskRes = await request("POST", `${SERVER}/tasks`, {
    title: "E-Ticaret Entegrasyonu Projesi",
    description: "Sinerji projesine iyzico ödeme modülü yazılması (en az 10 karakter olmalı).",
    category: "Web Gelistirme",
    subcategory: "Full-Stack",
    reward_type: "money",
    budget: "2000",
    currency: "TRY",
    hardSkills: [{ skill: "Node.js", level: 5, isRequired: true }],
    positions: 1,
    experience_level: "intermediate",
    work_type: "remote",
    status: "open"
  }, { Authorization: `Bearer ${companyToken}` });

  if (createTaskRes.status >= 400) {
    throw new Error(`Task creation failed: ${JSON.stringify(createTaskRes.data)}`);
  }
  const taskId = createTaskRes.data.data.task.id;
  log(`Görev başarıyla oluşturuldu. Görev ID: ${taskId}, Bütçe: 2000 TRY`);

  // 5. Submit Application by Student
  log("5. Öğrenci görev için başvuru (Submission) gönderiyor...");
  const createSubRes = await request("POST", `${SERVER}/submissions/task/${taskId}`, {
    submission_content: "Projeyi 10 gün içinde tamamlayıp iyzico sandbox API ile bağlayabilirim.",
    proposed_budget: "2000",
    estimated_delivery_days: 10
  }, { Authorization: `Bearer ${studentToken}` });

  if (createSubRes.status >= 400) {
    throw new Error(`Submission creation failed: ${JSON.stringify(createSubRes.data)}`);
  }
  const submissionId = createSubRes.data.data.submission.id;
  log(`Başvuru oluşturuldu. Başvuru ID: ${submissionId}`);

  // Verify initial DB state for payment
  let subDb = await prisma.submission.findUnique({ where: { id: submissionId } });
  log(`Veritabanı kontrolü (Başlangıç): payment_status = '${subDb?.payment_status}'`);

  // 6. Secure Budget in Escrow (Company Pays via Mock Credit Card)
  log("6. Şirket bütçeyi Escrow güvencesine alıyor (Checkout Ödemesi)...");
  const checkoutPayRes = await request("POST", `${SERVER}/submissions/${submissionId}/pay`, {
    cardHolderName: "Sinerji Test Company",
    cardNumber: "5890040000000016", // Standard Iyzico Sandbox Successful Test Card
    expireMonth: "12",
    expireYear: "30",
    cvv: "123"
  }, { Authorization: `Bearer ${companyToken}` });

  if (checkoutPayRes.status >= 400) {
    throw new Error(`Payment Checkout failed: ${JSON.stringify(checkoutPayRes.data)}`);
  }
  log(`Ödeme İşlemi Başarılı! Response: ${checkoutPayRes.data.message}`);
  
  // Verify escrow_locked state in DB
  subDb = await prisma.submission.findUnique({ where: { id: submissionId } });
  log(`Veritabanı kontrolü (Ödeme Sonrası):`);
  log(`  - payment_status: '${subDb?.payment_status}' (Beklenen: 'escrow_locked')`);
  log(`  - payment_id: '${subDb?.payment_id}'`);
  log(`  - payment_transaction_id: '${subDb?.payment_transaction_id}'`);

  if (subDb?.payment_status !== "escrow_locked") {
    throw new Error("HATA: Ödeme yapıldı fakat veritabanı escrow_locked olarak güncellenmedi!");
  }

  // 7. Approve Submission & Release Escrow Funds (Company approves deliverable)
  log("7. Şirket işi onaylıyor (Escrow Havuzundan Öğrenciye Transfer)...");
  const approveRes = await request("PATCH", `${SERVER}/submissions/${submissionId}`, {
    status: "approved"
  }, { Authorization: `Bearer ${companyToken}` });

  if (approveRes.status >= 400) {
    throw new Error(`Approval/Release failed: ${JSON.stringify(approveRes.data)}`);
  }
  log(`İş Onaylandı! Response: ${approveRes.data.status}`);

  // Verify released state in DB
  subDb = await prisma.submission.findUnique({ where: { id: submissionId } });
  log(`Veritabanı kontrolü (Onay/Ödeme Dağıtımı Sonrası):`);
  log(`  - status: '${subDb?.status}' (Beklenen: 'approved')`);
  log(`  - payment_status: '${subDb?.payment_status}' (Beklenen: 'released')`);

  if (subDb?.payment_status !== "released") {
    throw new Error("HATA: İş onaylandı fakat ödeme durumu released olarak güncellenmedi!");
  }

  console.log("\n=================================================================");
  console.log("🎉 TEBRİKLER! SINERJI ÖDEME ESCROW ENTEGRASYON TESTİ BAŞARIYLA TAMAMLANDI");
  console.log("=================================================================\n");
  
  // Cleanup test entities from database
  log("Test kayıtları temizleniyor...");
  await prisma.submission.delete({ where: { id: submissionId } });
  await prisma.taskSkill.deleteMany({ where: { task_id: taskId } });
  await prisma.task.delete({ where: { id: taskId } });
  await prisma.studentSkill.deleteMany({ where: { student_user_id: studentId } });
  await prisma.notification.deleteMany({ where: { user_id: { in: [studentId, companyId] } } });
  await prisma.studentProfile.delete({ where: { user_id: studentId } });
  await prisma.companyProfile.delete({ where: { user_id: companyId } });
  await prisma.user.deleteMany({ where: { id: { in: [studentId, companyId] } } });
  log("Temizlik tamamlandı. Test bitti.");
}

runTest().catch((err) => {
  console.error("\n❌ TEST HATA İLE SONUÇLANDI:");
  console.error(err);
  process.exit(1);
});
