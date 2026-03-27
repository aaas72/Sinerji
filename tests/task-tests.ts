

// ─── إعدادات الخادم ───────────────────────────────────────────────────────────
const API = "http://localhost:4000/api";

// ─── ألوان الطرفية ────────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold:  "\x1b[1m",
  green: "\x1b[32m",
  red:   "\x1b[31m",
  yellow:"\x1b[33m",
  cyan:  "\x1b[36m",
  gray:  "\x1b[90m",
};

const ok  = (msg: string) => console.log(`${c.green}✔${c.reset} ${msg}`);
const err = (msg: string) => console.log(`${c.red}✘${c.reset} ${msg}`);
const info= (msg: string) => console.log(`${c.cyan}ℹ${c.reset} ${msg}`);
const sep = ()            => console.log(`${c.gray}${"─".repeat(60)}${c.reset}`);
const hdr = (msg: string) => {
  sep();
  console.log(`${c.bold}${c.yellow}▶ ${msg}${c.reset}`);
};

// ─── مساعد HTTP ───────────────────────────────────────────────────────────────
async function http(
  method: string,
  path: string,
  body?: object,
  token?: string
): Promise<{ status: number; ok: boolean; json: any }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, json };
}

// ─── بيانات الاختبار ──────────────────────────────────────────────────────────
const stamp        = Date.now();
const companyEmail = `test_company_${stamp}@test.com`;
const companyPass  = "Test@123456";

const taskPayload = {
  title:           "مطور Full-Stack (اختبار)",
  description:     "هذه مهمة اختبار تلقائي للتحقق من صحة نظام المهام.",
  category:        "technology",
  subcategory:     "web-development",
  hardSkills: [
    { skill: "React",      level: 8,  isRequired: true,  yearsOfExperience: 2 },
    { skill: "Node.js",    level: 7,  isRequired: true,  yearsOfExperience: 1 },
    { skill: "PostgreSQL", level: 6,  isRequired: false, yearsOfExperience: 0 },
  ],
  softSkills:       ["التواصل", "العمل الجماعي"],
  reward_type:      "money",
  budget:           "5000",
  currency:         "TRY",
  positions:        2,
  experience_level: "intermediate",
  work_type:        "remote",
  deadline:         new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  requiredSkills:   ["React", "Node.js", "PostgreSQL"],
};

const updatePayload = {
  title:            "مطور Full-Stack (محدَّث)",
  positions:        3,
  work_type:        "hybrid",
  experience_level: "advanced",
  hardSkills: [
    { skill: "React",      level: 9,  isRequired: true, yearsOfExperience: 3 },
    { skill: "TypeScript", level: 8,  isRequired: true, yearsOfExperience: 2 },
  ],
};

// ─── دوال التحقق التفصيلية ────────────────────────────────────────────────────
function assertField(label: string, value: unknown, expected: unknown) {
  if (value == expected) {
    ok(`  ${label}: ${c.gray}${JSON.stringify(value)}${c.reset}`);
  } else {
    err(`  ${label}: توقعنا ${c.yellow}${JSON.stringify(expected)}${c.reset} وجدنا ${c.red}${JSON.stringify(value)}${c.reset}`);
  }
}

// ─── البرنامج الرئيسي ─────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${c.bold}${c.cyan}╔════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}║       فحص شامل لعمليات المهام              ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╚════════════════════════════════════════════╝${c.reset}\n`);

  let token = "";
  let taskId = 0;
  let passed = 0;
  let failed = 0;

  // ──────────────────────────────────────────────────────────────────────────
  hdr("0. فحص صحة الخادم");
  try {
    const r = await fetch("http://localhost:4000/health");
    if (r.ok || r.status === 200) { ok("الخادم يعمل"); passed++; }
    else { err(`الخادم أرجع ${r.status}`); failed++; }
  } catch {
    err("الخادم غير متاح — تأكد أن npm run dev يعمل في مجلد server");
    process.exit(1);
  }

  // ──────────────────────────────────────────────────────────────────────────
  hdr("1. تسجيل حساب شركة جديد");
  {
    const r = await http("POST", "/auth/register", {
      email:        companyEmail,
      password:     companyPass,
      role:         "company",
      company_name: `Test Company ${stamp}`,
    });
    if (r.ok) {
      ok(`تم التسجيل بنجاح — ${companyEmail}`);
      passed++;
    } else {
      err(`فشل التسجيل: ${r.status} — ${JSON.stringify(r.json)}`);
      failed++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  hdr("2. تسجيل الدخول");
  {
    const r = await http("POST", "/auth/login", {
      email:    companyEmail,
      password: companyPass,
    });
    if (r.ok && (r.json?.data?.token || r.json?.token)) {
      token = r.json.data?.token ?? r.json.token;
      ok(`تسجيل الدخول ناجح — token: ${token.slice(0, 20)}...`);
      passed++;
    } else {
      err(`فشل تسجيل الدخول: ${r.status} — ${JSON.stringify(r.json)}`);
      failed++;
      process.exit(1);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  hdr("3. إنشاء مهمة جديدة (POST /api/tasks)");
  {
    const r = await http("POST", "/tasks", taskPayload, token);
    if (r.ok && r.json?.data?.task?.id) {
      taskId = r.json.data.task.id;
      ok(`تم إنشاء المهمة — ID: ${c.bold}${taskId}${c.reset}`);
      const task = r.json.data.task;
      assertField("العنوان",          task.title,           taskPayload.title);
      assertField("الفئة",            task.category,        taskPayload.category);
      assertField("الفئة الفرعية",    task.subcategory,     taskPayload.subcategory);
      assertField("نوع الأجر",        task.reward_type,     taskPayload.reward_type);
      assertField("الميزانية",        task.budget,          taskPayload.budget);
      assertField("العملة",           task.currency,        taskPayload.currency);
      assertField("الوظائف المتاحة",  task.positions,       taskPayload.positions);
      assertField("مستوى الخبرة",     task.experience_level,taskPayload.experience_level);
      assertField("نمط العمل",        task.work_type,       taskPayload.work_type);
      info(`عدد المهارات المحفوظة: ${task.requiredSkills?.length ?? 0}`);
      passed++;
    } else {
      err(`فشل إنشاء المهمة: ${r.status}\n${JSON.stringify(r.json, null, 2)}`);
      failed++;
      process.exit(1);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  hdr("4. عرض قائمة المهام (GET /api/tasks)");
  {
    const r = await http("GET", "/tasks", undefined, token);
    if (r.ok && Array.isArray(r.json?.data?.tasks)) {
      const found = r.json.data.tasks.find((t: any) => t.id === taskId);
      if (found) {
        ok(`المهمة موجودة في القائمة العامة (${r.json.data.tasks.length} مهمة)`);
        passed++;
      } else {
        err("المهمة المُنشأة غير موجودة في قائمة المهام");
        failed++;
      }
    } else {
      err(`فشل جلب القائمة: ${r.status}`);
      failed++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  hdr("5. عرض المهام الخاصة بالشركة (GET /api/tasks/company/my-tasks)");
  {
    const r = await http("GET", "/tasks/company/my-tasks", undefined, token);
    if (r.ok && Array.isArray(r.json?.data?.tasks)) {
      const found = r.json.data.tasks.find((t: any) => t.id === taskId);
      if (found) {
        ok(`المهمة موجودة في قائمة مهام الشركة (${r.json.data.tasks.length} مهمة)`);
        passed++;
      } else {
        err("المهمة غير موجودة في مهام الشركة");
        failed++;
      }
    } else {
      err(`فشل جلب مهام الشركة: ${r.status} — ${JSON.stringify(r.json)}`);
      failed++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  hdr(`6. عرض تفاصيل المهمة (GET /api/tasks/${taskId})`);
  {
    const r = await http("GET", `/tasks/${taskId}`, undefined, token);
    if (r.ok && r.json?.data?.task) {
      ok("تم جلب تفاصيل المهمة");
      const task = r.json.data.task;
      assertField("ID",               task.id,               taskId);
      assertField("العنوان",          task.title,            taskPayload.title);
      assertField("الوظائف المتاحة", task.positions,         taskPayload.positions);
      assertField("نمط العمل",       task.work_type,         taskPayload.work_type);
      const skills = task.requiredSkills ?? [];
      info(`المهارات: ${skills.map((s: any) => `${s.skill.name}(${s.level}/${s.is_required ? "إلزامي" : "مفضل"})`).join(", ")}`);
      passed++;
    } else {
      err(`فشل جلب التفاصيل: ${r.status} — ${JSON.stringify(r.json)}`);
      failed++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  hdr(`7. تعديل المهمة (PATCH /api/tasks/${taskId})`);
  {
    const r = await http("PATCH", `/tasks/${taskId}`, updatePayload, token);
    if (r.ok && r.json?.data?.task) {
      ok("تم تعديل المهمة بنجاح");
      const task = r.json.data.task;
      assertField("العنوان الجديد",            task.title,            updatePayload.title);
      assertField("الوظائف الجديدة",           task.positions,        updatePayload.positions);
      assertField("نمط العمل الجديد",          task.work_type,        updatePayload.work_type);
      assertField("مستوى الخبرة الجديد",       task.experience_level, updatePayload.experience_level);
      const skills = task.requiredSkills ?? [];
      info(`المهارات بعد التعديل: ${skills.map((s: any) => `${s.skill.name}(${s.level})`).join(", ")}`);
      passed++;
    } else {
      err(`فشل تعديل المهمة: ${r.status}\n${JSON.stringify(r.json, null, 2)}`);
      failed++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  hdr("8. التحقق من صحة التحقق (إرسال بيانات خاطئة)");
  {
    const badPayload = {
      title:            "",           // خطأ: فارغ
      description:      "قصير",       // خطأ: أقل من 10 أحرف
      category:         "technology",
      subcategory:      "web",
      hardSkills:       [],           // خطأ: يجب على الأقل مهارة واحدة (للـ create)
      positions:        0,            // خطأ: يجب >= 1
      experience_level: "expert",     // خطأ: قيمة غير مسموح بها
      work_type:        "office",     // خطأ: قيمة غير مسموح بها
    };
    const r = await http("POST", "/tasks", badPayload, token);
    if (!r.ok && r.status >= 400) {
      ok(`رفض الخادم البيانات الخاطئة بـ ${r.status} — التحقق يعمل صحيحاً`);
      info(`رسالة الخطأ: ${r.json?.message ?? JSON.stringify(r.json)}`);
      passed++;
    } else {
      err(`الخادم قَبِل بيانات خاطئة! هذا خطأ أمني — status: ${r.status}`);
      failed++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  hdr(`9. حذف المهمة (DELETE /api/tasks/${taskId})`);
  {
    const r = await http("DELETE", `/tasks/${taskId}`, undefined, token);
    if (r.ok || r.status === 204) {
      ok("تم حذف المهمة بنجاح");
      passed++;
    } else {
      err(`فشل حذف المهمة: ${r.status} — ${JSON.stringify(r.json)}`);
      failed++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  hdr("10. التحقق من الحذف (يجب أن تُرجع 404)");
  {
    const r = await http("GET", `/tasks/${taskId}`, undefined, token);
    if (!r.ok && r.status === 404) {
      ok("المهمة محذوفة بالفعل — الخادم أرجع 404 كما هو متوقع");
      passed++;
    } else {
      err(`المهمة لا تزال موجودة بعد الحذف! status: ${r.status}`);
      failed++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  sep();
  const total = passed + failed;
  console.log(`\n${c.bold}النتيجة النهائية: ${passed}/${total} فحص ناجح${c.reset}`);
  if (failed === 0) {
    console.log(`${c.green}${c.bold}✔ جميع الفحوصات نجحت!${c.reset}\n`);
  } else {
    console.log(`${c.red}${c.bold}✘ ${failed} فحص فشل — راجع الأخطاء أعلاه${c.reset}\n`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`${c.red}خطأ غير متوقع:${c.reset}`, e);
  process.exit(1);
});
