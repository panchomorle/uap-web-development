import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { register, login } from '@/actions/auth';
import { getUserFromToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { setupMongooseMock, mockUsers, mockUserModel } from './mocks/mongo';

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

describe('Authentication Functions', () => {
  beforeEach(() => {
    setupMongooseMock();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Setup
      mockUserModel.findOne.mockResolvedValueOnce(null); // No existing user
      mockUserModel.create.mockResolvedValueOnce({
        _id: 'new-user-id',
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'hashedpassword',
        toJSON: () => ({
          _id: 'new-user-id',
          username: 'newuser',
          email: 'newuser@example.com'
        })
      });
      (bcrypt.hash as any).mockResolvedValueOnce('hashedpassword');

      // Execute
      const result = await register({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      });

      // Verify
      expect(mockUserModel.findOne).toHaveBeenCalledTimes(2); // Check username and email
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'hashedpassword',
        createdAt: expect.any(Date)
      });
      expect(result).toEqual({
        id: 'new-user-id',
        username: 'newuser',
        email: 'newuser@example.com'
      });
    });

    it('should throw error if username is already taken', async () => {
      // Setup
      mockUserModel.findOne.mockResolvedValueOnce({
        username: 'testuser1',
        email: 'different@example.com'
      }); // Username exists

      // Execute & Verify
      await expect(register({
        username: 'testuser1',
        email: 'newuser@example.com',
        password: 'password123'
      })).rejects.toThrow('Username already taken');
    });

    it('should throw error if email is already registered', async () => {
      // Setup
      mockUserModel.findOne.mockResolvedValueOnce(null); // Username doesn't exist
      mockUserModel.findOne.mockResolvedValueOnce({
        username: 'different',
        email: 'user1@test.com'
      }); // Email exists

      // Execute & Verify
      await expect(register({
        username: 'newuser',
        email: 'user1@test.com',
        password: 'password123'
      })).rejects.toThrow('Email already registered');
    });

    it('should validate password requirements', async () => {
      await expect(register({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'short'
      })).rejects.toThrow('Password must be at least 8 characters');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      // Setup
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword'
      };
      mockUserModel.findOne.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as any).mockResolvedValueOnce(true);
      (jwt.sign as any).mockReturnValueOnce('test-token');

      // Execute
      const result = await login({
        username: 'testuser',
        password: 'password123'
      });

      // Verify
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-id',
          username: 'testuser'
        }),
        'test_secret',
        expect.any(Object)
      );
      expect(result).toEqual({
        token: 'test-token',
        user: expect.objectContaining({
          id: 'user-id',
          username: 'testuser',
          email: 'test@example.com'
        })
      });
    });

    it('should throw error if user is not found', async () => {
      // Setup
      mockUserModel.findOne.mockResolvedValueOnce(null);

      // Execute & Verify
      await expect(login({
        username: 'nonexistentuser',
        password: 'password123'
      })).rejects.toThrow('Invalid username or password');
    });

    it('should throw error if password is incorrect', async () => {
      // Setup
      mockUserModel.findOne.mockResolvedValueOnce({
        _id: 'user-id',
        username: 'testuser',
        password: 'hashedpassword'
      });
      (bcrypt.compare as any).mockResolvedValueOnce(false);

      // Execute & Verify
      await expect(login({
        username: 'testuser',
        password: 'wrongpassword'
      })).rejects.toThrow('Invalid username or password');
    });
  });

  describe('getUserFromToken', () => {
    it('should return user data from valid token', async () => {
      // Setup
      const userData = {
        id: 'user-id',
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
      // Setup
      (jwt.verify as any).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      // Execute
      const result = await getUserFromToken('invalid-token');

      // Verify
      expect(result).toBeNull();
    });

    it('should return null if payload is not a valid user object', async () => {
      // Setup
      (jwt.verify as any).mockReturnValueOnce('not-an-object');

      // Execute
      const result = await getUserFromToken('strange-token');

      // Verify
      expect(result).toBeNull();
    });

    it('should return null if payload does not have required fields', async () => {
      // Setup
      (jwt.verify as any).mockReturnValueOnce({
        foo: 'bar'
        // missing id and username
      });

      // Execute
      const result = await getUserFromToken('incomplete-token');

      // Verify
      expect(result).toBeNull();
    });
  });
});
