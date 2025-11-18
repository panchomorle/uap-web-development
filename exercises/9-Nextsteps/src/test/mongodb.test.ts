import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { connectDB, User, Review, Favorite } from '@/db/mongo';
import { getUserReviews, getReviews, addReview, upvoteReview, downvoteReview } from '@/actions/reviews';
import { getUserFavorites, addFavorite, removeFavorite, checkIsFavorite } from '@/actions/favorites';
import { Types } from 'mongoose';
import { setupMongooseMock, mockReviewModel, mockFavoriteModel, mockMongoose } from '../mocks/mongo';

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

describe('MongoDB CRUD Operations', () => {
  beforeEach(() => {
    setupMongooseMock();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Database Connection', () => {
    it('should connect to MongoDB successfully', async () => {
      await connectDB();
      expect(mockMongoose.connect).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    });

    it('should reuse existing connection if already connected', async () => {
      // First connection
      await connectDB();
      
      // Second connection attempt
      await connectDB();
      
      // Should only connect once
      expect(mockMongoose.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Review Operations', () => {
    it('should get reviews for a book', async () => {
      // Setup
      const bookId = 'book1';
      const mockReviews = [
        { _id: '1', bookId, content: 'Review 1' },
        { _id: '2', bookId, content: 'Review 2' }
      ];
      
      mockReviewModel.find.mockReturnValueOnce({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValueOnce(mockReviews)
      });

      // Execute
      const result = await getReviews(bookId);

      // Verify
      expect(mockReviewModel.find).toHaveBeenCalledWith({ bookId });
      expect(result).toEqual(expect.any(Array));
    });

    it('should get reviews for a user', async () => {
      // Setup
      const userId = '000000000000000000000001';
      const mockReviews = [
        { _id: '1', userId, content: 'Review 1' },
        { _id: '2', userId, content: 'Review 2' }
      ];
      
      mockReviewModel.find.mockReturnValueOnce({
        sort: vi.fn().mockResolvedValueOnce(mockReviews)
      });

      // Execute
      const result = await getUserReviews(userId);

      // Verify
      expect(mockReviewModel.find).toHaveBeenCalledWith({ 
        userId: expect.any(Types.ObjectId) 
      });
      expect(result).toEqual(expect.any(Array));
    });

    it('should add a new review', async () => {
      // Setup
      const reviewData = {
        bookId: 'book1',
        rating: 4,
        content: 'Great book!',
        userId: '000000000000000000000001'
      };
      
      const mockNewReview = {
        _id: new Types.ObjectId(),
        ...reviewData,
        date: new Date(),
        upvotes: 0,
        downvotes: 0,
        toJSON: () => ({
          _id: '1',
          ...reviewData,
          date: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0
        })
      };
      
      mockReviewModel.create.mockResolvedValueOnce(mockNewReview);

      // Execute
      const result = await addReview(reviewData);

      // Verify
      expect(mockReviewModel.create).toHaveBeenCalledWith(expect.objectContaining({
        bookId: reviewData.bookId,
        rating: reviewData.rating,
        content: reviewData.content
      }));
      expect(result).toHaveProperty('_id');
    });

    it('should upvote a review', async () => {
      // Setup
      const reviewId = '000000000000000000000011';
      const userId = '000000000000000000000002';
      
      const mockReview = {
        _id: reviewId,
        upvotes: 1,
        downvotes: 0,
        voters: {
          upvoters: [],
          downvoters: []
        }
      };
      
      mockReviewModel.findById.mockResolvedValueOnce(mockReview);
      mockReviewModel.findByIdAndUpdate.mockResolvedValueOnce({
        ...mockReview,
        upvotes: 2,
        voters: {
          upvoters: [userId],
          downvoters: []
        }
      });

      // Execute
      const result = await upvoteReview(reviewId, userId);

      // Verify
      expect(mockReviewModel.findById).toHaveBeenCalledWith(reviewId);
      expect(mockReviewModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toHaveProperty('upvotes', 2);
    });

    it('should downvote a review', async () => {
      // Setup
      const reviewId = '000000000000000000000011';
      const userId = '000000000000000000000002';
      
      const mockReview = {
        _id: reviewId,
        upvotes: 1,
        downvotes: 0,
        voters: {
          upvoters: [],
          downvoters: []
        }
      };
      
      mockReviewModel.findById.mockResolvedValueOnce(mockReview);
      mockReviewModel.findByIdAndUpdate.mockResolvedValueOnce({
        ...mockReview,
        upvotes: 1,
        downvotes: 1,
        voters: {
          upvoters: [],
          downvoters: [userId]
        }
      });

      // Execute
      const result = await downvoteReview(reviewId, userId);

      // Verify
      expect(mockReviewModel.findById).toHaveBeenCalledWith(reviewId);
      expect(mockReviewModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toHaveProperty('downvotes', 1);
    });
  });

  describe('Favorite Operations', () => {
    it('should get favorites for a user', async () => {
      // Setup
      const userId = '000000000000000000000001';
      const mockFavorites = [
        { _id: '1', userId, bookId: 'book1', title: 'Book 1' },
        { _id: '2', userId, bookId: 'book2', title: 'Book 2' }
      ];
      
      mockFavoriteModel.find.mockReturnValueOnce({
        sort: vi.fn().mockResolvedValueOnce(mockFavorites)
      });

      // Execute
      const result = await getUserFavorites(userId);

      // Verify
      expect(mockFavoriteModel.find).toHaveBeenCalledWith({ 
        userId: expect.any(Types.ObjectId) 
      });
      expect(result).toEqual(expect.any(Array));
    });

    it('should add a book to favorites', async () => {
      // Setup
      const favoriteData = {
        userId: '000000000000000000000001',
        bookId: 'book3',
        title: 'Book 3',
        authors: ['Author 3'],
        thumbnail: 'https://example.com/thumb3.jpg'
      };
      
      mockFavoriteModel.findOne.mockResolvedValueOnce(null); // No existing favorite
      
      const mockNewFavorite = {
        _id: new Types.ObjectId(),
        ...favoriteData,
        userId: new Types.ObjectId(favoriteData.userId),
        addedAt: new Date(),
        toJSON: () => ({
          _id: '3',
          ...favoriteData,
          userId: favoriteData.userId,
          addedAt: new Date().toISOString()
        })
      };
      
      mockFavoriteModel.create.mockResolvedValueOnce(mockNewFavorite);

      // Execute
      const result = await addFavorite(favoriteData);

      // Verify
      expect(mockFavoriteModel.findOne).toHaveBeenCalledWith({ 
        userId: expect.any(Types.ObjectId),
        bookId: favoriteData.bookId 
      });
      expect(mockFavoriteModel.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: expect.any(Types.ObjectId),
        bookId: favoriteData.bookId,
        title: favoriteData.title
      }));
      expect(result.success).toBe(true);
      expect(result.favorite).toBeDefined();
    });

    it('should not add duplicate favorite', async () => {
      // Setup
      const favoriteData = {
        userId: '000000000000000000000001',
        bookId: 'book1',
        title: 'Book 1',
        authors: ['Author 1'],
        thumbnail: 'https://example.com/thumb1.jpg'
      };
      
      const existingFavorite = {
        _id: new Types.ObjectId(),
        ...favoriteData,
        userId: new Types.ObjectId(favoriteData.userId),
        addedAt: new Date()
      };
      
      mockFavoriteModel.findOne.mockResolvedValueOnce(existingFavorite);

      // Execute
      const result = await addFavorite(favoriteData);

      // Verify
      expect(mockFavoriteModel.findOne).toHaveBeenCalledWith({ 
        userId: expect.any(Types.ObjectId),
        bookId: favoriteData.bookId 
      });
      expect(mockFavoriteModel.create).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toContain('already in favorites');
    });

    it('should remove a book from favorites', async () => {
      // Setup
      const userId = '000000000000000000000001';
      const bookId = 'book1';
      
      const existingFavorite = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        bookId,
        title: 'Book 1',
        addedAt: new Date()
      };
      
      mockFavoriteModel.findOneAndDelete.mockResolvedValueOnce(existingFavorite);

      // Execute
      const result = await removeFavorite(userId, bookId);

      // Verify
      expect(mockFavoriteModel.findOneAndDelete).toHaveBeenCalledWith({ 
        userId: expect.any(Types.ObjectId),
        bookId
      });
      expect(result.success).toBe(true);
    });

    it('should return failure when removing non-existent favorite', async () => {
      // Setup
      const userId = '000000000000000000000001';
      const bookId = 'nonexistent';
      
      mockFavoriteModel.findOneAndDelete.mockResolvedValueOnce(null);

      // Execute
      const result = await removeFavorite(userId, bookId);

      // Verify
      expect(mockFavoriteModel.findOneAndDelete).toHaveBeenCalledWith({ 
        userId: expect.any(Types.ObjectId),
        bookId
      });
      expect(result.success).toBe(false);
    });

    it('should check if a book is in favorites', async () => {
      // Setup
      const userId = '000000000000000000000001';
      const bookId = 'book1';
      
      mockFavoriteModel.findOne.mockResolvedValueOnce({
        _id: '1',
        userId,
        bookId
      });

      // Execute
      const result = await checkIsFavorite(userId, bookId);

      // Verify
      expect(mockFavoriteModel.findOne).toHaveBeenCalledWith({ 
        userId: expect.any(Types.ObjectId),
        bookId
      });
      expect(result).toBe(true);
    });

    it('should return false when book is not in favorites', async () => {
      // Setup
      const userId = '000000000000000000000001';
      const bookId = 'nonexistent';
      
      mockFavoriteModel.findOne.mockResolvedValueOnce(null);

      // Execute
      const result = await checkIsFavorite(userId, bookId);

      // Verify
      expect(mockFavoriteModel.findOne).toHaveBeenCalledWith({ 
        userId: expect.any(Types.ObjectId),
        bookId
      });
      expect(result).toBe(false);
    });
  });
});
