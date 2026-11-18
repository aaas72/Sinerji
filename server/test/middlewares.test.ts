import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma', () => ({
  default: { user: { findUnique: vi.fn() } },
}));

vi.mock('../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import prisma from '../src/lib/prisma';
import { protect, restrictTo } from '../src/middlewares/auth.middleware';
import { errorHandler } from '../src/middlewares/error.middleware';
import { AppError } from '../src/utils/AppError';
import { signToken } from '../src/utils/jwt';

const findUnique = prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>;

const mockRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const errorFrom = (next: ReturnType<typeof vi.fn>) => next.mock.calls[0][0] as AppError | undefined;

describe('protect', () => {
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    next = vi.fn();
  });

  it('rejects requests without a token', async () => {
    await protect({ headers: {} } as Request, mockRes(), next as NextFunction);
    expect(errorFrom(next)?.statusCode).toBe(401);
  });

  it('rejects an invalid token', async () => {
    const req = { headers: { authorization: 'Bearer not-a-jwt' } } as Request;
    await protect(req, mockRes(), next as NextFunction);
    expect(errorFrom(next)?.statusCode).toBe(401);
  });

  it('rejects a valid token whose user no longer exists', async () => {
    findUnique.mockResolvedValue(null);
    const req = { headers: { authorization: `Bearer ${signToken(7, 'student')}` } } as Request;
    await protect(req, mockRes(), next as NextFunction);
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 7 } }));
    expect(errorFrom(next)?.statusCode).toBe(401);
  });

  it('attaches the user for a valid bearer token', async () => {
    const user = { id: 7, role: 'student' };
    findUnique.mockResolvedValue(user);
    const req = { headers: { authorization: `Bearer ${signToken(7, 'student')}` } } as Request;
    await protect(req, mockRes(), next as NextFunction);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBe(user);
  });

  it('prefers the cookie token over the Authorization header', async () => {
    findUnique.mockResolvedValue({ id: 3, role: 'company' });
    const req = {
      cookies: { token: signToken(3, 'company') },
      headers: { authorization: 'Bearer garbage' },
    } as unknown as Request;
    await protect(req, mockRes(), next as NextFunction);
    expect(next).toHaveBeenCalledWith();
    expect(req.user.id).toBe(3);
  });
});

describe('restrictTo', () => {
  it('allows listed roles', () => {
    const next = vi.fn();
    restrictTo('company')({ user: { role: 'company' } } as Request, mockRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  it('blocks other roles with 403', () => {
    const next = vi.fn();
    restrictTo('company')({ user: { role: 'student' } } as Request, mockRes(), next);
    expect(errorFrom(next)?.statusCode).toBe(403);
  });
});

describe('errorHandler', () => {
  const req = { originalUrl: '/api/test', method: 'GET', ip: '127.0.0.1' } as Request;

  it('returns operational errors with their real status and message', () => {
    const res = mockRes();
    errorHandler(new AppError('Task not found', 404), req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ status: 'fail', message: 'Task not found' });
  });

  it('hides programming errors outside development', () => {
    const res = mockRes();
    errorHandler(new TypeError('cannot read x of undefined'), req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Something went very wrong!' });
  });
});
