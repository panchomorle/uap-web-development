import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupMongooseMock } from './mocks/mongo';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn()
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
  verify: vi.fn()
}));

// Mock JWT_SECRET
vi.mock('@/lib/jwtSecret', () => ({
  JWT_SECRET: 'test_secret'
}));

// Import after mocking
import { getUserFromToken } from '@/lib/auth';

describe('Authentication Utility Tests', () => {
  beforeEach(() => {
    setupMongooseMock();
    vi.clearAllMocks();
  });

  describe('getUserFromToken', () => {
    it('should return user data from valid token', async () => {
      // Setup
      const userData = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com'
      };
      (jwt.verify as any).mockReturnValueOnce(userData);

      // Execute
      const result = await getUserFromToken('valid-token');

      // Verify
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test_secret');
      expect(result).toEqual(userData);
    });

    it('should return null for invalid token', async () => {
      // Setup - jwt.verify throws an error
      (jwt.verify as any).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      // Execute
      const result = await getUserFromToken('invalid-token');

      // Verify
      expect(result).toBeNull();
    });

    it('should return null for non-object payload', async () => {
      // Setup - jwt.verify returns a string
      (jwt.verify as any).mockReturnValueOnce('not-an-object');

      // Execute
      const result = await getUserFromToken('strange-token');

      // Verify
      expect(result).toBeNull();
    });

    it('should return null if payload is missing required fields', async () => {
      // Setup - jwt.verify returns an incomplete object
      (jwt.verify as any).mockReturnValueOnce({
        foo: 'bar' // Missing id and username
      });

      // Execute
      const result = await getUserFromToken('incomplete-token');

      // Verify
      expect(result).toBeNull();
    });
    
    it('should return valid user object with all required fields', async () => {
      // Setup - jwt.verify returns complete user data
      const completeUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: '2023-01-01',
        role: 'user'
      };
      (jwt.verify as any).mockReturnValueOnce(completeUser);

      // Execute
      const result = await getUserFromToken('complete-token');

      // Verify
      expect(result).toEqual(completeUser);
    });
  });
});
