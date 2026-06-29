import { PrismaClient } from "@prisma/client";
import { SubmissionService } from "./src/services/submission.service";
import { TaskService } from "./src/services/task.service";
import bcrypt from "bcryptjs"; // assuming bcrypt or bcryptjs is installed

const prisma = new PrismaClient();
const submissionService = new SubmissionService();
const taskService = new TaskService();

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
    const password_hash = await bcrypt.hash("Test@1234", 10);
    
    const companyUser = await prisma.user.create({
        data: {
            email: companyEmail,
            password_hash,
            role: "company",
            companyProfile: {
                create: {
                    company_name: "Workflow Test Company Inc",
                    description: "Company created for workflow test",
                    industry: "Tech",
                    location: "Istanbul"
                }
            }
        },
        include: { companyProfile: true }
    });
    console.log(`Created Company: ${companyUser.companyProfile?.company_name} (User ID: ${companyUser.id})`);

    console.log("\n=== 3. Creating New Task ===");
    const task = await taskService.createTask(companyUser.id, {
        title: "Backend Refactoring Task",
        description: "Need help refactoring legacy Node.js code.",
        category: "Web Gelistirme",
        reward_type: "money",
        reward_amount: "2000",
        budget: "2000",
        positions: 1,
        hardSkills: [
            { skill: "Node.js", level: 4, isRequired: true }
        ],
    } as any);
    console.log(`-> Created Task ID: ${task.id}`);

    console.log("\n=== 4. Ahmet Yilmaz Applying for the Task ===");
    try {
        const submission = await submissionService.createSubmission(ahmet.user_id, task.id, {
            submission_content: "Ben hazirim, Node.js refactoring konusunda deneyimliyim.",
            proposed_budget: "2000",
            estimated_delivery_days: 10
        });
        console.log("✅ Application successful! Submission created.");
        console.log("Status:", submission.status);
    } catch (e: any) {
        console.log("❌ Workflow Error Encountered During Application!");
        console.log("Message:", e.message || e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
