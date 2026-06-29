import fs from "fs";
import path from "path";
import http from "http";
import { PrismaClient } from "@prisma/client";

const SERVER = "http://127.0.0.1:5000/api";
const prisma = new PrismaClient();

function request(
  method: string, url: string,
  body?: object, headers?: Record<string, string>
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const parsed   = new URL(url);
    const payload  = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: parsed.hostname,
      port:     parsed.port || 80,
      path:     parsed.pathname + parsed.search,
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

function authH(token: string) { return { Authorization: `Bearer ${token}` }; }

async function main() {
    console.log("=== 1. Ensuring Ahmet Yilmaz is Verified ===");
    const ahmet = await prisma.studentProfile.findFirst({
        where: { full_name: { contains: "Yilmaz", mode: "insensitive" } },
        include: { user: true }
    });

    if (!ahmet) {
        console.error("Ahmet Yilmaz not found in database.");
        return;
    }

    if (!ahmet.is_verified) {
        await prisma.studentProfile.update({
            where: { user_id: ahmet.user_id },
            data: { is_verified: true, sub_merchant_key: "mock_sub_merchant_key_flhs3d" }
        });
        console.log("-> Set Ahmet Yilmaz as VERIFIED.");
    } else {
        console.log("-> Ahmet Yilmaz is already VERIFIED.");
    }

    console.log("\n=== 2. Creating New Company ===");
    const ts = Date.now();
    const companyEmail = `company_${ts}@test.com`;
    const companyPass = "Test@1234";

    const regRes = await request("POST", `${SERVER}/auth/register`, {
        email: companyEmail,
        password: companyPass,
        role: "company",
        company_name: "Workflow Test Company Inc"
    });
    console.log("Register Company Status:", regRes.status, regRes.status < 400 ? "OK" : regRes.data);

    const loginRes = await request("POST", `${SERVER}/auth/login`, {
        email: companyEmail,
        password: companyPass
    });
    const companyToken = loginRes.data?.data?.token || loginRes.data?.token;
    if (!companyToken) {
        console.error("Failed to login as company");
        return;
    }
    console.log("-> Logged in as Company.");

    console.log("\n=== 3. Creating New Task ===");
    const taskRes = await request("POST", `${SERVER}/tasks`, {
      title: "Backend Refactoring Task",
      description: "Need help refactoring legacy Node.js code.",
      category: "Web Gelistirme",
      reward_type: "money",
      reward_amount: "2000",
      budget: "2000",
      positions: 1,
      status: "open",
      hardSkills: [
          { skill: "Node.js", level: 4, isRequired: true }
      ],
    }, authH(companyToken));

    console.log("Create Task Status:", taskRes.status);
    if (taskRes.status >= 400) {
        console.error("Failed to create task:", taskRes.data);
        return;
    }
    const taskId = taskRes.data?.data?.task?.id || taskRes.data?.task?.id || taskRes.data?.id;
    console.log(`-> Created Task ID: ${taskId}`);

    console.log("\n=== 4. Ahmet Yilmaz Applying for the Task ===");
    const ahmetLoginRes = await request("POST", `${SERVER}/auth/login`, {
        email: ahmet.user.email,
        password: "Test@1234" // Default test password used in seed
    });
    const ahmetToken = ahmetLoginRes.data?.data?.token || ahmetLoginRes.data?.token;
    if (!ahmetToken) {
        console.error("Failed to login as Ahmet Yilmaz. Did his password change? Data:", ahmetLoginRes.data);
        return;
    }

    const applyRes = await request("POST", `${SERVER}/submissions/task/${taskId}`, {
        submission_content: "Ben hazirim, Node.js refactoring konusunda deneyimliyim.",
        proposed_budget: "2000",
        estimated_delivery_days: 10
    }, authH(ahmetToken));

    console.log("Apply Status:", applyRes.status);
    console.log("Apply Response:", applyRes.data);

    if (applyRes.status >= 400) {
        console.log("\n❌ Workflow Error Encountered During Application!");
    } else {
        console.log("\n✅ Application successful! No errors in the application process.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
