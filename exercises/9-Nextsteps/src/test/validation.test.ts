import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateUserData, validateReviewData } from '@/lib/validation';
import { setupMongooseMock, mockUserModel, mockReviewModel } from './mocks/mongo';

describe('Data Validation Tests', () => {
  beforeEach(() => {
    setupMongooseMock();
    vi.clearAllMocks();
  });
  
  describe('User data validation', () => {
    it('validates complete and correct user data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };
      
      const result = await validateUserData(userData);
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
    });
    
    it('rejects empty username', async () => {
      const userData = {
        username: '',
        email: 'test@example.com',
        password: 'Password123!'
      };
      
      const result = await validateUserData(userData);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Username is required');
    });
    
    it('rejects invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123!'
      };
      
      const result = await validateUserData(userData);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });
    
    it('rejects weak password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak'
      };
      
      const result = await validateUserData(userData);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });
    
    it('rejects duplicate username when it already exists', async () => {
      // Setup mock
      mockUserModel.findOne.mockResolvedValueOnce({ username: 'existinguser' });
      
      const userData = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'Password123!'
      };
      
      const result = await validateUserData(userData, true);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Username already taken');
    });
    
    it('rejects duplicate email when it already exists', async () => {
      // For the first call (username check), return null (no duplicate)
      mockUserModel.findOne.mockResolvedValueOnce(null);
      // For the second call (email check), return a user (duplicate email)
      mockUserModel.findOne.mockResolvedValueOnce({ email: 'existing@example.com' });
      
      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'Password123!'
      };
      
      const result = await validateUserData(userData, true);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Email already registered');
    });
    
    it('validates all fields together and returns multiple errors', async () => {
      const userData = {
        username: '',
        email: 'not-an-email',
        password: 'short'
      };
      
      const result = await validateUserData(userData);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3); // All three validation errors
      expect(result.errors).toContain('Username is required');
      expect(result.errors).toContain('Invalid email format');
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });
    
    it('handles missing fields gracefully', async () => {
      const userData = {
        // Missing all required fields
      };
      
      const result = await validateUserData(userData);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('Review data validation', () => {
    it('validates complete and correct review data', async () => {
      const reviewData = {
        bookId: 'book123',
        userId: 'user456',
        rating: 4,
        title: 'Great book!',
        content: 'This is an excellent book with engaging characters.'
      };
      
      const result = await validateReviewData(reviewData);
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
    });
    
    it('rejects missing bookId', async () => {
      const reviewData = {
        bookId: '',
        userId: 'user456',
        rating: 4,
        title: 'Great book!',
        content: 'This is an excellent book with engaging characters.'
      };
      
      const result = await validateReviewData(reviewData);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Book ID is required');
    });
    
    it('rejects missing userId', async () => {
      const reviewData = {
        bookId: 'book123',
        userId: '',
        rating: 4,
        title: 'Great book!',
        content: 'This is an excellent book with engaging characters.'
      };
      
      const result = await validateReviewData(reviewData);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('User ID is required');
    });
    
    it('rejects invalid rating (too high)', async () => {
      const reviewData = {
        bookId: 'book123',
        userId: 'user456',
        rating: 6, // Out of range
        title: 'Great book!',
        content: 'This is an excellent book with engaging characters.'
      };
      
      const result = await validateReviewData(reviewData);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Rating must be between 1 and 5');
    });
    
    it('rejects invalid rating (too low)', async () => {
      const reviewData = {
        bookId: 'book123',
        userId: 'user456',
        rating: 0, // Out of range
        title: 'Great book!',
        content: 'This is an excellent book with engaging characters.'
      };
      
      const result = await validateReviewData(reviewData);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Rating must be between 1 and 5');
    });
    
    it('accepts valid ratings at boundaries', async () => {
      // Test minimum valid rating
      const reviewData1 = {
        bookId: 'book123',
        userId: 'user456',
        rating: 1,
        title: 'Not great',
        content: 'Did not enjoy this book.'
      };
      
      const result1 = await validateReviewData(reviewData1);
      expect(result1.success).toBe(true);
      
      // Test maximum valid rating
      const reviewData5 = {
        bookId: 'book123',
        userId: 'user456',
        rating: 5,
        title: 'Excellent!',
        content: 'Best book ever!'
      };
      
      const result5 = await validateReviewData(reviewData5);
      expect(result5.success).toBe(true);
    });
    
    it('rejects missing content', async () => {
      const reviewData = {
        bookId: 'book123',
        userId: 'user456',
        rating: 4,
        title: 'Great book!',
        content: ''
      };
      
      const result = await validateReviewData(reviewData);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Review content is required');
    });
    
    it('rejects duplicate review from same user for same book', async () => {
      // Setup mock
      mockReviewModel.findOne.mockResolvedValueOnce({
        bookId: 'book123',
        userId: 'user456'
      });
      
      const reviewData = {
        bookId: 'book123',
        userId: 'user456',
        rating: 4,
        title: 'Great book!',
        content: 'This is an excellent book with engaging characters.'
      };
      
      const result = await validateReviewData(reviewData, true);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('You have already reviewed this book');
    });
    
    it('allows review if no duplicate exists', async () => {
      // Setup mock to return no duplicate review
      mockReviewModel.findOne.mockResolvedValueOnce(null);
      
      const reviewData = {
        bookId: 'book123',
        userId: 'user456',
        rating: 4,
        title: 'Great book!',
        content: 'This is an excellent book with engaging characters.'
      };
      
      const result = await validateReviewData(reviewData, true);
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
    });
    
    it('validates all fields together and returns multiple errors', async () => {
      const reviewData = {
        bookId: '',
        userId: '',
        rating: 10, // Invalid
        content: ''
      };
      
      const result = await validateReviewData(reviewData);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBe(4); // All four validation errors
      expect(result.errors).toContain('Book ID is required');
      expect(result.errors).toContain('User ID is required');
      expect(result.errors).toContain('Rating must be between 1 and 5');
      expect(result.errors).toContain('Review content is required');
    });
  });
});
