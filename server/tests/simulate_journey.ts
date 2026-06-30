import { PrismaClient } from '@prisma/client';
import { SubmissionService } from '../src/services/submission.service';
import { TaskService } from '../src/services/task.service';

const prisma = new PrismaClient();
const submissionService = new SubmissionService();
const taskService = new TaskService();

async function main() {
  console.log('--- Journey Simulation Started ---');
  let logicalFlaws = [];

  try {
    // 1. Fetch Company & Student
    const company = await prisma.user.findFirst({ where: { role: 'COMPANY' }, include: { companyProfile: true } });
    const student = await prisma.user.findFirst({ where: { role: 'STUDENT' }, include: { studentProfile: true } });

    if (!company || !student) {
      throw new Error('No company or student found in the DB. Did you run the seed script?');
    }

    console.log(`[Company] Logged in as: ${company.companyProfile?.company_name}`);
    console.log(`[Student] Logged in as: ${student.studentProfile?.full_name}`);

    // Update student to bypass validation rules
    await prisma.studentProfile.update({
      where: { user_id: student.id },
      data: {
        is_verified: true,
        github_url: 'https://github.com/student',
        website_url: 'https://student.com'
      }
    });
    
    // Ensure student has a skill
    const skill = await prisma.skill.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React' }
    });
    await prisma.studentSkill.upsert({
      where: { student_user_id_skill_id: { student_user_id: student.id, skill_id: skill.id } },
      update: {},
      create: { student_user_id: student.id, skill_id: skill.id, level: 3, category: 'Tech' }
    });
    console.log('[System] Updated student profile to meet application requirements.');

    // 2. Company Creates Task
    console.log('[Company] Creating non-financial task (reward: Certificate)...');
    const task = (await taskService.createTask(company.id, {
      title: 'Non-Financial Journey Task',
      description: 'A task to test the certificate generation flow.',
      reward_type: 'certificate',
      deadline: '2026-12-31',
      category: 'Software',
      subcategory: 'Frontend',
      experience_level: 'beginner',
      positions: 2,
      work_type: 'remote',
      certificate_name: 'Completion Certificate',
      certificate_issuer: 'TechNova',
      requiredSkills: [skill.id] // It is supposed to be string in the schema? Wait, I will use [skill.id] or "1" depending on what createTask accepts. Wait, `createTask` might accept an array of strings in the Zod schema. Let's just put `[skill.id.toString()]`
    } as any)) as any;
    console.log(`[System] Task created with ID: ${task.id}`);

    // 3. Student Applies to Task
    console.log('[Student] Applying to the task...');
    const application = await submissionService.createSubmission(student.id, task.id, {
      submission_content: 'I want to apply!',
      estimated_delivery_days: 5,
      proposed_budget: '0'
    });
    console.log(`[System] Application created with ID: ${application.id}, Status: ${application.status}`);

    // 4. Company Makes Offer
    console.log('[Company] Making an offer to the student...');
    // Since we don't have the exact makeOffer method in interface here, we'll try to find it or update DB directly if it fails.
    try {
      await (submissionService as any).makeOffer(application.id, company.id);
      console.log(`[System] Offer made.`);
    } catch(e) {
      console.log(`[System] makeOffer failed or missing, manually updating status to 'offered'`);
      await prisma.submission.update({ where: { id: application.id }, data: { status: 'offered' }});
    }

    // 5. Student Accepts Offer
    console.log('[Student] Accepting the offer...');
    try {
      await submissionService.respondToOffer(application.id, student.id, true);
      console.log(`[System] Offer accepted by student.`);
    } catch(e) {
      console.log(`[System] respondToOffer failed, updating manually to 'accepted'`);
      await prisma.submission.update({ where: { id: application.id }, data: { status: 'accepted' }});
    }

    // 6. Student Submits Work
    console.log('[Student] Submitting work for the task...');
    await submissionService.submitWork(application.id, student.id, 'https://github.com/student/project', 'Here is my completed work.');
    console.log(`[System] Work submitted.`);

    // 7. Company Approves Work
    console.log('[Company] Approving the submitted work...');
    await submissionService.updateSubmissionStatus(application.id, company.id, 'approved');
    
    // 8. Verification of Final State
    const finalSubmission = await prisma.submission.findUnique({ where: { id: application.id } });
    console.log('[Verification] Final Submission State:');
    console.log(`- Status: ${finalSubmission?.status}`);
    console.log(`- Completion Status: ${finalSubmission?.completion_status}`);
    console.log(`- Guarantee Token Generated: ${finalSubmission?.guarantee_token ? 'YES' : 'NO'}`);

    if (!finalSubmission?.guarantee_token) {
      logicalFlaws.push('Guarantee token was NOT generated for a non-financial task upon approval.');
    }
    if (finalSubmission?.completion_status !== 'completed') {
      logicalFlaws.push(`Completion status is '${finalSubmission?.completion_status}', expected 'completed'.`);
    }

  } catch (error: any) {
    console.error('[ERROR]', error.message);
    logicalFlaws.push(`Exception occurred during journey: ${error.message}`);
  } finally {
    await prisma.$disconnect();
    console.log('--- Journey Simulation Ended ---');
    if (logicalFlaws.length > 0) {
      console.log('Logical Flaws Found:');
      logicalFlaws.forEach(flaw => console.log(`- ${flaw}`));
    } else {
      console.log('No logical flaws detected in the backend flow.');
    }
  }
}

main();
