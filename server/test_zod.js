const { z } = require('zod');

const schema = z.object({
  industry: z.string().nullable().optional(),
  website_url: z.string().url().nullable().optional().or(z.literal('')),
  linkedin_url: z.string().url().nullable().optional().or(z.literal('')),
});

const reqBody = {
  industry: null,
  website_url: null,
  linkedin_url: null
};

const validation = schema.safeParse(reqBody);

if (!validation.success) {
  console.log(validation.error.issues.map(e => e.message));
} else {
  console.log("Success!");
}
