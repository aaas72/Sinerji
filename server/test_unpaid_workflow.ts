import { PrismaClient } from "@prisma/client";
import { SubmissionService } from "./src/services/submission.service";
import { TaskService } from "./src/services/task.service";
import bcrypt from "bcryptjs";

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
                    company_name: "Lifecycle Test Company Inc",
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
        title: "Full Lifecycle Test Task",
        description: "Need help refactoring legacy Node.js code.",
        category: "Web Gelistirme",
        reward_type: "internship",
        reward_amount: "0",
        budget: "0",
        positions: 1,
        hardSkills: [
            { skill: "Node.js", level: 4, isRequired: true }
        ],
    } as any);
    console.log(`-> Created Task ID: ${task.id}`);

    let submissionId: number;
    console.log("\n=== 4. Ahmet Yilmaz Applying for the Task ===");
    try {
        const submission = await submissionService.createSubmission(ahmet.user_id, task.id, {
            submission_content: "Ben hazirim, Node.js refactoring konusunda deneyimliyim.",
            proposed_budget: "0",
            estimated_delivery_days: 10
        });
        submissionId = submission.id;
        console.log("✅ Application successful! Status:", submission.status);
    } catch (e: any) {
        console.log("❌ Workflow Error Encountered During Application!");
        console.log("Message:", e.message || e);
        return;
    }

    console.log("\n=== 5. Company Offers Task (Unpaid) ===");
    try {
        const offerResult = await submissionService.offerUnpaidSubmission(
            submissionId,
            companyUser.id
        );
        console.log("✅ Offer successful! Status:", offerResult.status);
    } catch (e: any) {
        console.log("❌ Workflow Error Encountered During Offer!");
        console.log("Message:", e.message || e);
        return;
    }

    console.log("\n=== 5.5 Ahmet Yilmaz Accepts the Offer ===");
    try {
        const acceptResult = await submissionService.respondToOffer(submissionId, ahmet.user_id, true);
        console.log("✅ Offer accepted! Status:", acceptResult.status);
    } catch (e: any) {
        console.log("❌ Workflow Error Encountered During Offer Acceptance!");
        console.log("Message:", e.message || e);
        return;
    }

    console.log("\n=== 6. Ahmet Yilmaz Submits Work ===");
    try {
        const workResult = await submissionService.submitWork(submissionId, ahmet.user_id, "https://github.com/ahmet/refactored-code");
        console.log("✅ Work submitted! Status:", workResult.status);
    } catch (e: any) {
        console.log("❌ Workflow Error Encountered During Work Submission!");
        console.log("Message:", e.message || e);
        return;
    }

    console.log("\n=== 7. Company Approves Work (Releases Escrow) ===");
    try {
        const approveResult = await submissionService.updateSubmissionStatus(submissionId, companyUser.id, 'approved');
        console.log("✅ Work approved! Escrow released. Status:", approveResult.status);
    } catch (e: any) {
        console.log("❌ Workflow Error Encountered During Approval!");
        console.log("Message:", e.message || e);
        return;
    }

    console.log("\n=== 8. Checking Final Task Status ===");
    const finalTask = await prisma.task.findUnique({ where: { id: task.id } });
    console.log("✅ Final Task Status:", finalTask?.status);
    if (finalTask?.status === "Completed") {
        console.log("🎉 Workflow completed perfectly!");
    } else {
        console.log("⚠️ Task status is not 'Completed'. It is:", finalTask?.status);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
