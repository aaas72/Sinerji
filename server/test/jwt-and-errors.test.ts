import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { AppError } from '../src/utils/AppError';
import { signToken, verifyToken } from '../src/utils/jwt';

describe('JWT helpers', () => {
  it('signs a token that verifies back to the same id and role', () => {
    const token = signToken(42, 'student');
    const payload = verifyToken(token) as jwt.JwtPayload;
    expect(payload.id).toBe(42);
    expect(payload.role).toBe('student');
    expect(payload.exp).toBeGreaterThan(payload.iat!);
  });

  it('rejects a token signed with another secret', () => {
    const forged = jwt.sign({ id: 1, role: 'company' }, 'wrong-secret');
    expect(() => verifyToken(forged)).toThrow();
  });

  it('rejects an expired token', () => {
    const expired = jwt.sign({ id: 1, role: 'student' }, 'test-secret', { expiresIn: -10 });
    expect(() => verifyToken(expired)).toThrow(jwt.TokenExpiredError);
  });
});

describe('AppError', () => {
  it('marks 4xx errors as "fail"', () => {
    const error = new AppError('Not found', 404);
    expect(error.status).toBe('fail');
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it('marks 5xx errors as "error"', () => {
    expect(new AppError('Boom', 500).status).toBe('error');
  });
});
