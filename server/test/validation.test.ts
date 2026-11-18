import { describe, expect, it } from 'vitest';
import {
  addSkillSchema,
  createReviewSchema,
  createTaskSchema,
  loginSchema,
  registerSchema,
  updateStudentProfileSchema,
} from '../src/utils/validation';

describe('registerSchema', () => {
  const base = { email: 'ali@example.com', password: 'secret123' };

  it('accepts a student with a full name', () => {
    const result = registerSchema.safeParse({ ...base, role: 'student', full_name: 'Ali Kaya' });
    expect(result.success).toBe(true);
  });

  it('accepts a company with a company name', () => {
    const result = registerSchema.safeParse({ ...base, role: 'company', company_name: 'Acme' });
    expect(result.success).toBe(true);
  });

  it('rejects a student without a full name', () => {
    const result = registerSchema.safeParse({ ...base, role: 'student' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['role']);
  });

  it('rejects a company without a company name', () => {
    const result = registerSchema.safeParse({ ...base, role: 'company' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown role', () => {
    const result = registerSchema.safeParse({ ...base, role: 'admin', full_name: 'X' });
    expect(result.success).toBe(false);
  });

  it('rejects passwords shorter than 6 characters', () => {
    const result = registerSchema.safeParse({ ...base, password: '123', role: 'student', full_name: 'Ali' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...base, email: 'not-an-email', role: 'student', full_name: 'Ali' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('requires a valid email and a password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'a@b.co' }).success).toBe(false);
  });
});

describe('updateStudentProfileSchema', () => {
  it('allows clearing a URL with an empty string', () => {
    expect(updateStudentProfileSchema.safeParse({ github_url: '' }).success).toBe(true);
  });

  it('rejects malformed URLs', () => {
    expect(updateStudentProfileSchema.safeParse({ github_url: 'github.com/me' }).success).toBe(false);
  });

  it('rejects a bio longer than 2000 characters', () => {
    expect(updateStudentProfileSchema.safeParse({ bio: 'a'.repeat(2001) }).success).toBe(false);
  });
});

describe('addSkillSchema', () => {
  it('defaults the category to General', () => {
    const result = addSkillSchema.parse({ skillName: 'React', level: 5 });
    expect(result.category).toBe('General');
  });

  it.each([0, 11, 2.5])('rejects level %s', (level) => {
    expect(addSkillSchema.safeParse({ skillName: 'React', level }).success).toBe(false);
  });
});

describe('createTaskSchema', () => {
  const validTask = {
    title: 'Build a landing page',
    description: 'Responsive landing page in Next.js',
    category: 'Web',
    subcategory: 'Frontend',
    hardSkills: [{ skill: 'React', level: 6, isRequired: true }],
    positions: 1,
    experience_level: 'beginner',
    work_type: 'remote',
  };

  it('accepts a minimal valid task', () => {
    expect(createTaskSchema.safeParse(validTask).success).toBe(true);
  });

  it('requires at least one hard skill', () => {
    expect(createTaskSchema.safeParse({ ...validTask, hardSkills: [] }).success).toBe(false);
  });

  it('accepts an empty deadline but rejects a non-ISO one', () => {
    expect(createTaskSchema.safeParse({ ...validTask, deadline: '' }).success).toBe(true);
    expect(createTaskSchema.safeParse({ ...validTask, deadline: '2026-12-01T12:00:00Z' }).success).toBe(true);
    expect(createTaskSchema.safeParse({ ...validTask, deadline: 'next week' }).success).toBe(false);
  });

  it('rejects unsupported currencies', () => {
    expect(createTaskSchema.safeParse({ ...validTask, currency: 'GBP' }).success).toBe(false);
  });
});

describe('createReviewSchema', () => {
  it('requires a rating or feedback', () => {
    expect(createReviewSchema.safeParse({}).success).toBe(false);
    expect(createReviewSchema.safeParse({ rating: 5 }).success).toBe(true);
    expect(createReviewSchema.safeParse({ feedback: 'Great work' }).success).toBe(true);
  });

  it('keeps ratings between 1 and 5', () => {
    expect(createReviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });
});
