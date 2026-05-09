/**
 * =============================================================================
 * Sinerji Tam Senaryo Testi (TypeScript)
 * =============================================================================
 * Calistirma:
 *   cd d:\UN\4\1\BP\Sinerji_Project\tests
 *   npx ts-node full_scenario_test.ts
 * =============================================================================
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

// ── Config ────────────────────────────────────────────────────────────────────
const SERVER      = "http://localhost:5000/api";
const AI_SVC      = "http://localhost:8001";
const RESULTS_DIR = path.join(__dirname, "results");
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

// ── Types ─────────────────────────────────────────────────────────────────────
interface Skill       { name: string; level: number; category: string; }
interface TaskSkill   { name: string; level: number; is_required: boolean; }
interface Student {
  name: string; username: string; email: string; password: string;
  tier: string; tier_label: string; bio: string; skills: Skill[];
  major: string; university: string; categories: string;
}
interface Candidate {
  student_user_id: number; score: number;
  hard_score: number; semantic_score: number;
  missing_skills: string[];
}
interface AiResult {
  candidates: Candidate[]; filtered_out: number; alpha: number;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
function request(
  method: string, url: string,
  body?: object, headers?: Record<string, string>
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const parsed   = new URL(url);
    const isHttps  = parsed.protocol === "https:";
    const payload  = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: parsed.hostname,
      port:     parsed.port || (isHttps ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        ...(headers || {}),
      },
    };
    const lib = isHttps ? https : http;
    const req = lib.request(opts, (res) => {
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

function log(msg: string) { console.log(`  ${msg}`); }
function ok(label: string, res: { status: number; data: any }) {
  if (res.status >= 400) {
    console.log(`  [HATA] ${label} [${res.status}] -> ${JSON.stringify(res.data)}`);
    return null;
  }
  console.log(`  [OK] ${label} [${res.status}]`);
  return res.data;
}

async function registerLogin(email: string, password: string, role: string, name: string) {
  const payload: any = { email, password, role };
  if (role === "company") payload.company_name = name;
  else payload.full_name = name;

  const reg = await request("POST", `${SERVER}/auth/register`, payload);
  if (reg.status >= 400) {
    log(`[UYARI] Kayit: ${email} -> ${JSON.stringify(reg.data)}`);
  }
  const r = await request("POST", `${SERVER}/auth/login`, { email, password });
  if (r.status >= 400) {
    log(`[HATA] Giris: ${email} -> ${JSON.stringify(r.data)}`);
  }
  const token: string =
    r.data?.data?.token || r.data?.token || "";
  return token;
}

function authH(token: string) { return { Authorization: `Bearer ${token}` }; }

// ── Skill sets ────────────────────────────────────────────────────────────────
const SKILLS_VERY_STRONG: Skill[] = [
  { name: "React",      level: 5, category: "On Yuz"          },
  { name: "Node.js",    level: 5, category: "Arka Yuz"        },
  { name: "PostgreSQL", level: 5, category: "Veritabani"      },
  { name: "TypeScript", level: 5, category: "Programlama Dili"},
  { name: "CSS",        level: 5, category: "On Yuz"          },
  { name: "Docker",     level: 4, category: "DevOps"          },
  { name: "AWS",        level: 4, category: "Bulut"           },
  { name: "Git",        level: 5, category: "Araclar"         },
  { name: "GraphQL",    level: 4, category: "Arka Yuz"        },
  { name: "Redis",      level: 3, category: "Veritabani"      },
  { name: "Jest",       level: 4, category: "Test"            },
];
const SKILLS_STRONG: Skill[] = [
  { name: "React",      level: 4, category: "On Yuz"          },
  { name: "Node.js",    level: 4, category: "Arka Yuz"        },
  { name: "PostgreSQL", level: 4, category: "Veritabani"      },
  { name: "TypeScript", level: 4, category: "Programlama Dili"},
  { name: "CSS",        level: 4, category: "On Yuz"          },
  { name: "Docker",     level: 3, category: "DevOps"          },
  { name: "AWS",        level: 2, category: "Bulut"           },
  { name: "Git",        level: 4, category: "Araclar"         },
];
const SKILLS_MEDIUM: Skill[] = [
  { name: "React",      level: 3, category: "On Yuz"          },
  { name: "Node.js",    level: 3, category: "Arka Yuz"        },
  { name: "PostgreSQL", level: 2, category: "Veritabani"      },
  { name: "TypeScript", level: 2, category: "Programlama Dili"},
  { name: "CSS",        level: 3, category: "On Yuz"          },
  { name: "Git",        level: 3, category: "Araclar"         },
];
const SKILLS_WEAK: Skill[] = [
  { name: "React",      level: 2, category: "On Yuz"          },
  { name: "CSS",        level: 2, category: "On Yuz"          },
  { name: "Git",        level: 2, category: "Araclar"         },
  { name: "JavaScript", level: 2, category: "Programlama Dili"},
];

// ── Student data ──────────────────────────────────────────────────────────────
type TierDef = [string, string, Skill[], [string, string, string][]];
const TIERS: TierDef[] = [
  ["cok_guclu", "Cok Guclu", SKILLS_VERY_STRONG, [
    ["Ahmet Yilmaz",   "ahmet.yilmaz",  "3+ yil React/Node.js/TypeScript deneyimli full-stack gelistirici. 5 e-ticaret platformu gelistirdi, AWS sertifikali, PostgreSQL optimizasyonunda uzman."],
    ["Elif Kaya",      "elif.kaya",     "React, Node.js ve TypeScript uzman full-stack gelistirici. B2B SaaS liderligini yapti. PostgreSQL DBA. Docker ve AWS gunluk kullaniyor."],
    ["Burak Demir",    "burak.demir",   "Bilgisayar Muhendisligi mezunu. React, Node.js mikro servisleri, PostgreSQL, TypeScript ve CI/CD boru hatlarinda uzman."],
    ["Selin Arslan",   "selin.arslan",  "Derin React ve Node.js deneyimine sahip. Olceklenebilir e-ticaret uygulamalari gelistirdi. PostgreSQL, TypeScript, Docker ve AWS."],
    ["Mert Celik",     "mert.celik",    "React/Next.js on yuz, Node.js/Express arka yuz, PostgreSQL, TypeScript. AWS'ye uretim uygulamalari dagitti. Acik kaynak katilimcisi."],
  ]],
  ["guclu", "Guclu", SKILLS_STRONG, [
    ["Zeynep Sahin",   "zeynep.sahin",  "On yuze odakli full-stack gelistirici. Guclu React ve CSS. Node.js arka yuz deneyimi. PostgreSQL ve TypeScript bilgisi."],
    ["Can Ozturk",     "can.ozturk",    "Guclu React ve Node.js deneyimli web gelistirici. TypeScript ve PostgreSQL konusunda rahat. 2 ticari projede deneyim."],
    ["Ayse Yildiz",    "ayse.yildiz",   "Full-stack gelistirici. React, Node.js, Express ve PostgreSQL. Docker ve temel AWS dagitimina asina."],
    ["Emre Koc",       "emre.koc",      "Guclu React ve Node.js becerilerine sahip muhendislik ogrencisi. TypeScript ve PostgreSQL kullaniyor."],
    ["Deniz Acar",     "deniz.acar",    "React, Node.js ve PostgreSQL yetkin web gelistirici. TypeScript kullanicisi. Bir projeyi AWS'ye dagitti."],
  ]],
  ["orta", "Orta", SKILLS_MEDIUM, [
    ["Fatih Yildirim", "fatih.yildirim","React ve Node.js ogrenen web gelistirici. Temel PostgreSQL bilgisi. TypeScript becerilerini gelistiriyor."],
    ["Merve Polat",    "merve.polat",   "Full-stack'e gecis yapan on yuz gelistirici. React ve CSS konusunda iyi. Node.js ve PostgreSQL'i yakin zamanda basladi."],
    ["Oguz Kaplan",    "oguz.kaplan",   "React ve CSS deneyimli ogrenci. Temel Node.js bilgisi. PostgreSQL ve TypeScript ogreniyor."],
    ["Ceren Dogan",    "ceren.dogan",   "Junior web gelistirici. React temellerini ve biraz Node.js biliyor. PostgreSQL'e yeni basladi."],
    ["Baris Aktas",    "baris.aktas",   "Kendi kendine yetisen gelistirici. React ve CSS konusunda rahat. Node.js ogrenmeye basladi."],
  ]],
  ["zayif", "Zayif", SKILLS_WEAK, [
    ["Tuba Guler",     "tuba.guler",    "Web gelistirme ogrenen ogrenci. Temel HTML, CSS ve biraz React. Hic arka yuz veya veritabani deneyimi yok."],
    ["Onur Bulut",     "onur.bulut",    "Baslangic seviyesi web gelistirici. Biraz React ve CSS. Hic Node.js veya veritabani becerisi yok."],
    ["Pinar Erdogan",  "pinar.erdogan", "Web gelistirme yolculuguna yeni basladi. CSS ve temel JavaScript. React ogreniyor."],
    ["Arda Kaya",      "arda.kaya",     "Birinci sinif ogrenci. Temel CSS ve HTML. React'i yakin baslatti. Veritabani bilgisi yok."],
    ["Sibel Ozkan",    "sibel.ozkan",   "Baslangic seviyesi. CSS ve temel JavaScript. React'i kesfediyor. Ogrenmeye istekli."],
  ]],
];

const STUDENTS: Student[] = [];
for (const [tierKey, tierLabel, skills, members] of TIERS) {
  for (const [name, username, bio] of members) {
    STUDENTS.push({
      name, username, bio, skills,
      email:      `${username}@sinerji-test.com`,
      password:   "Test@1234",
      tier:       tierKey,
      tier_label: tierLabel,
      major:      "Bilgisayar Muhendisligi",
      university: "Istanbul Teknik Universitesi",
      categories: "Web Gelistirme, Full-Stack, Bulut",
    });
  }
}

const TASK_SKILLS: TaskSkill[] = [
  { name: "React",      level: 4, is_required: true  },
  { name: "Node.js",    level: 4, is_required: true  },
  { name: "PostgreSQL", level: 3, is_required: true  },
  { name: "TypeScript", level: 3, is_required: true  },
  { name: "CSS",        level: 3, is_required: false },
  { name: "Docker",     level: 2, is_required: false },
  { name: "AWS",        level: 2, is_required: false },
  { name: "Git",        level: 3, is_required: true  },
];

const SUBMISSION_TEXTS: Record<string, string> = {
  cok_guclu: "Bu proje icin 3+ yil React/Node.js/TypeScript deneyimle tam guvenle basvuruyorum. 5 tam kapsamli e-ticaret platformu gelistirdim ve AWS'ye dagittim. PostgreSQL ve sorgu optimizasyonunda derin deneyimim var. Docker ve CI/CD'yi gunluk kullaniyorum.",
  guclu:     "React, Node.js, TypeScript ve PostgreSQL konusunda guclu becerilerim var. Iki tam ticari projede calistim. Docker'i ve AWS temellerini biliyorum. Git'i gunluk kullaniyorum.",
  orta:      "React, Node.js, CSS ve Git konusunda deneyimim var. TypeScript ve PostgreSQL becerilerimi gelistiriyorum. Yeni teknolojiler ogrenmeye heyecanliyim.",
  zayif:     "HTML, CSS ve temel React biliyorum. Becerilerimi gelistirmek istiyorum ve bu proje harika bir ogrenme firsati.",
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const COMPANY_EMAIL    = "techcorp@sinerji-test.com";
  const COMPANY_PASSWORD = "Test@1234";

  // 1. Sirket ─────────────────────────────────────────────────────────────────
  console.log("\n=== 1. Sirket Hesabi Olusturuluyor ===");
  const companyToken = await registerLogin(COMPANY_EMAIL, COMPANY_PASSWORD, "company", "TechCorp Cozumleri");

  let companyUserId: number | null = null;
  if (companyToken) {
    const r = await request("PATCH", `${SERVER}/companies/me`, {
      company_name: "TechCorp Cozumleri",
      description:  "Web ve bulut uygulama cozumleri gelistirme alaninda uzmanlasmis bir teknoloji sirketi.",
      industry:     "Yazilim ve Teknoloji",
      location:     "Istanbul, Turkiye",
      website_url:  "https://techcorp-cozumleri.example.com",
    }, authH(companyToken));
    const d = ok("Sirket profili guncellendi", r);
    if (d) {
        companyUserId = d?.data?.profile?.user_id ?? d?.data?.user_id ?? d?.profile?.user_id ?? d?.user_id ?? null;
        log(`Sirket Kullanici ID = ${companyUserId}`);
    }
  }

  // 2. Gorev ──────────────────────────────────────────────────────────────────
  console.log("\n=== 2. Web Gelistirme Gorevi Olusturuluyor ===");
  let taskId: number | null = null;

  if (companyToken) {
    const r = await request("POST", `${SERVER}/tasks`, {
      title:            "Full-Stack Web Gelistirici - E-Ticaret Platformu",
      description:      "Sifirdan bir e-ticaret platformu gelistirecek deneyimli Full-Stack gelistirici ariyoruz. React.js on yuz, Node.js/Express arka yuz, PostgreSQL veritabani ve bulut dagitimi gereklidir.",
      category:         "Web Gelistirme",
      subcategory:      "Full-Stack",
      reward_type:      "money",
      reward_amount:    "5000",
      budget:           "5000",
      currency:         "TRY",
      positions:        1,
      experience_level: "intermediate",
      preferred_major:  "Bilgisayar Muhendisligi",
      work_type:        "remote",
      employment_type:  "contract",
      status:           "open",
      detail_title:     "Kapsamli E-Ticaret Platformu Projesi",
      detail_body:      "## Teknik Gereksinimler\n- TypeScript destekli React.js arayuzu\n- Node.js ve Express.js REST API\n- Prisma ORM ile PostgreSQL veritabani\n- Odeme altyapisi entegrasyonu (Stripe)\n- AWS veya Vercel uzerinde dagitim\n- Jest ile birim testleri\n- Redux ile durum yonetimi\n- JWT kimlik dogrulama\n\n## Proje Suresi\n3 ay\n\n## Beklenen Ciktilar\n- GitHub'da kaynak kodu\n- Eksiksiz API dokumantasyonu\n- Yayinda uygulama",
      hardSkills: TASK_SKILLS.map(s => ({ skill: s.name, level: s.level, isRequired: s.is_required })),
    }, authH(companyToken));
    const d = ok("Gorev olusturuldu", r);
    if (d) {
      taskId = d?.data?.task?.id ?? d?.data?.id ?? d?.task?.id ?? d?.id ?? null;
      log(`Gorev ID = ${taskId}`);
    }
  }

  if (!taskId && companyToken) {
    log("Gorev ID alinamadi, liste kontrol ediliyor...");
    const r = await request("GET", `${SERVER}/tasks/company/my-tasks`, undefined, authH(companyToken));
    const tasks: any[] = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
    if (tasks.length) { taskId = tasks[tasks.length - 1].id; log(`Bulunan gorev ID = ${taskId}`); }
  }

  // 3. Ogrenciler ─────────────────────────────────────────────────────────────
  console.log(`\n=== 3. ${STUDENTS.length} Ogrenci Olusturuluyor ===`);
  const studentTokens: Record<string, string> = {};

  for (const s of STUDENTS) {
    console.log(`\n  -> [${s.tier_label}] ${s.name}`);
    const token = await registerLogin(s.email, s.password, "student", s.name);
    if (!token) { log(`ATLANDI - ${s.email}`); continue; }
    studentTokens[s.email] = token;

    const pr = await request("PATCH", `${SERVER}/students/me`, {
      full_name:               s.name,
      bio:                     s.bio,
      major:                   s.major,
      graduation_year:         2026,
      university:              s.university,
      categories_of_interest:  s.categories,
      availability_status:     "musait",
      github_url:              `https://github.com/${s.username}`,
    }, authH(token));
    ok("  Profil", pr);

    for (const sk of s.skills) {
      const sr = await request("POST", `${SERVER}/students/skills`,
        { skillName: sk.name, level: sk.level, category: sk.category }, authH(token));
      if (sr.status < 400) log(`  [OK] Beceri: ${sk.name} Seviye ${sk.level}`);
      else log(`  [HATA] Beceri ${sk.name}: ${sr.status}`);
    }
  }

  // 4. Basvurular ─────────────────────────────────────────────────────────────
  console.log(`\n=== 4. Tum Ogrenciler Gorev ${taskId} icin Basvuruyor ===`);
  for (const s of STUDENTS) {
    const token = studentTokens[s.email];
    if (!token || !taskId) continue;
    const r = await request("POST", `${SERVER}/submissions/task/${taskId}`, {
      submission_content:      SUBMISSION_TEXTS[s.tier],
      proposed_budget:         "4500",
      estimated_delivery_days: 75,
    }, authH(token));
    ok(`  Basvuru [${s.tier_label}] ${s.name}`, r);
  }

  await new Promise((r) => setTimeout(r, 2000));

  // company_user_id yoksa al
  if (!companyUserId && companyToken) {
    const r = await request("GET", `${SERVER}/companies/me`, undefined, authH(companyToken));
    companyUserId = r.data?.data?.profile?.user_id ?? r.data?.profile?.user_id ?? r.data?.data?.user_id ?? r.data?.user_id ?? null;
    log(`Sirket kullanici ID = ${companyUserId}`);
  }

  // 5. AI Puanlama ─────────────────────────────────────────────────────────────
  console.log("\n=== 5. AI Eslestirme – Aday Siralama ===");
  let aiResults: AiResult | null = null;
  if (taskId && companyUserId) {
    const r = await request("POST", `${AI_SVC}/api/v1/match/rank-task-candidates`, {
      task_id: taskId, company_user_id: companyUserId, alpha: 0.7, top_k: 25, min_score: 0,
    });
    const d = ok("rank-task-candidates", r);
    if (d) aiResults = d as AiResult;
  }

  // 6. Rapor ───────────────────────────────────────────────────────────────────
  console.log("\n=== 6. Rapor Olusturuluyor ===");
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  const report = {
    olusturulma_tarihi: new Date().toISOString(),
    sirket: { email: COMPANY_EMAIL, sifre: COMPANY_PASSWORD, kullanici_id: companyUserId },
    gorev:  { id: taskId, baslik: "Full-Stack Web Gelistirici - E-Ticaret Platformu" },
    ogrenciler: STUDENTS.map((s) => ({
      ad: s.name, email: s.email, sifre: s.password,
      seviye: s.tier, seviye_adi: s.tier_label, biyografi: s.bio,
      beceriler: s.skills.map((sk) => `${sk.name} Sv${sk.level}`),
    })),
    ai_siralama: aiResults,
  };

  const jsonPath = path.join(RESULTS_DIR, `senaryo_sonuclari_${ts}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf-8");
  log(`JSON kaydedildi -> ${jsonPath}`);

  // Metin raporu
  const lines: string[] = [];
  const w = (l = "") => lines.push(l);
  const sep = "=".repeat(70);
  const sep2 = "+" + "-".repeat(70) + "+";

  w(sep); w("       SINERJI AI ESLESTIRME - TAM SENARYO RAPORU");
  w(`       Olusturulma: ${new Date().toLocaleString("tr-TR")}`); w(sep);

  w("\n" + sep2);
  w(`  SIRKET HESABI`); w(sep2);
  w(`  E-posta      : ${COMPANY_EMAIL}`);
  w(`  Sifre        : ${COMPANY_PASSWORD}`);
  w(`  Kullanici ID : ${companyUserId}`);
  w(sep2);

  w("\n" + sep2); w("  GOREV"); w(sep2);
  w(`  ID     : ${taskId}`);
  w(`  Baslik : Full-Stack Web Gelistirici - E-Ticaret Platformu`);
  w(`  Butce  : 5000 TRY`);
  w("  Gerekli Beceriler:");
  for (const sk of TASK_SKILLS)
    w(`    [${sk.is_required ? "Zorunlu " : "Opsiyonel"}] ${sk.name} – Seviye ${sk.level}`);
  w(sep2);

  w("\n" + sep2); w("  OGRENCI HESAPLARI"); w(sep2);
  for (const s of STUDENTS) {
    w(`\n  [${s.tier_label}] ${s.name}`);
    w(`    E-posta  : ${s.email}`);
    w(`    Sifre    : ${s.password}`);
    w(`    Beceriler: ${s.skills.map((sk) => `${sk.name}(Sv${sk.level})`).join(", ")}`);
  }
  w("\n" + sep2);

  w("\n" + sep2); w("  AI ESLESTIRME SONUCLARI – SIRALI ADAYLAR"); w(sep2);
  if (aiResults?.candidates?.length) {
    const cands = aiResults.candidates;
    w(`  Toplam Siralanan : ${cands.length}`);
    w(`  Elenen           : ${aiResults.filtered_out ?? 0}`);
    w(`  Alpha            : ${aiResults.alpha ?? 0.7}`);
    w("");
    w(`  ${"Siralama".padEnd(9)} ${"Puan".padEnd(7)} ${"Sert".padEnd(8)} ${"Semantik".padEnd(11)} ${"OgrenciID".padEnd(12)} Eksik Beceriler`);
    w("  " + "-".repeat(62));
    cands.forEach((c, i) => {
      const missing = c.missing_skills?.join(", ") || "—";
      w(`  #${String(i + 1).padEnd(8)} ${String(c.score).padEnd(7)} ${c.hard_score.toFixed(1).padEnd(8)} ${c.semantic_score.toFixed(2).padEnd(11)} ${String(c.student_user_id).padEnd(12)} Eksik: ${missing}`);
    });
  } else {
    w("  AI sonucu alinamadi (servis calismiyor olabilir)");
  }
  w(sep2);

  w("\n" + sep2); w("  SEVIYE ANALIZI"); w(sep2);
  w("  Beklenen siralama dugeni:");
  w("  Cok Guclu > Guclu > Orta > Zayif");
  if (aiResults?.candidates) {
    w(`\n  Siralanan: ${aiResults.candidates.length} / ${STUDENTS.length} basvuran`);
    if (aiResults.filtered_out) w(`  Elendi   : ${aiResults.filtered_out}`);
  }
  w(sep2);

  const txtPath = path.join(RESULTS_DIR, `senaryo_raporu_${ts}.txt`);
  fs.writeFileSync(txtPath, lines.join("\n"), "utf-8");
  log(`TXT kaydedildi -> ${txtPath}`);

  // Konsol ozeti
  console.log("\n" + sep);
  console.log("  OZET");
  console.log(sep);
  console.log(`  Sirket     : ${COMPANY_EMAIL} / ${COMPANY_PASSWORD}`);
  console.log(`  Gorev ID   : ${taskId}`);
  console.log(`  Ogrenciler : ${Object.keys(studentTokens).length} olusturuldu ve basvurdu`);
  if (aiResults?.candidates?.length) {
    console.log("\n  EN IYI 5 AI SIRALAMA:");
    aiResults.candidates.slice(0, 5).forEach((c, i) => {
      console.log(`    #${i + 1}  Puan=${c.score}  Sert=${c.hard_score.toFixed(1)}  Semantik=${c.semantic_score.toFixed(2)}  OgrenciID=${c.student_user_id}`);
    });
  }
  console.log(`\n  Raporlar: ${RESULTS_DIR}`);
  console.log(sep);
}

main().catch(console.error);