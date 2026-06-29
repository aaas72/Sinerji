const { z } = require('zod');

const updateCompanyProfileSchema = z.object({
  linkedin_url: z.string().url().optional().or(z.literal('')),
});

const reqBody = { linkedin_url: "invalid" };
const validation = updateCompanyProfileSchema.safeParse(reqBody);

console.log('errors:', validation.error.errors);
console.log('issues:', validation.error.issues);
console.log('flatten:', validation.error.flatten());
