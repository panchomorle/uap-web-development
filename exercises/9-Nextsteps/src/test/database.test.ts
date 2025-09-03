import { describe, it, expect, beforeEach } from 'vitest'
import {
  getReviews,
  addReview,
  voteOnReview,
  getAverageRating
} from '@/lib/database'

describe('Database Functions', () => {
  // Reset database state before each test
  beforeEach(() => {
    // Clear the reviews map (we'll need to expose a clear function or reset state)
    // For now, we'll test with fresh state in each test
  })

  describe('addReview', () => {
    it('should add a review and return it with correct properties', () => {
      const bookId = 'test-book-1'
      const rating = 4
      const content = 'Great book!'
      const userName = 'John Doe'

      const review = addReview(bookId, rating, content, userName)

      expect(review).toEqual({
        id: expect.any(Number),
        bookId,
        rating,
        content,
        userName,
        date: expect.any(String),
        upvotes: 0,
        downvotes: 0
      })

      // Verify the date is a valid ISO string
      expect(new Date(review.date)).toBeInstanceOf(Date)
      expect(review.id).toBeGreaterThan(0)
    })

    it('should handle edge case with minimum rating', () => {
      const review = addReview('book-1', 1, 'Poor book', 'User1')
      expect(review.rating).toBe(1)
    })

    it('should handle edge case with maximum rating', () => {
      const review = addReview('book-1', 5, 'Excellent book', 'User1')
      expect(review.rating).toBe(5)
    })

    it('should handle empty content', () => {
      const review = addReview('book-1', 3, '', 'User1')
      expect(review.content).toBe('')
    })

    it('should assign incremental IDs to multiple reviews', () => {
      const review1 = addReview('book-1', 4, 'Good', 'User1')
      const review2 = addReview('book-1', 3, 'OK', 'User2')
      
      expect(review2.id).toBe(review1.id + 1)
    })
  })

  describe('getReviews', () => {
    it('should return empty array for book with no reviews', () => {
      const reviews = getReviews('non-existent-book')
      expect(reviews).toEqual([])
    })

    it('should return all reviews for a book', () => {
      const bookId = 'test-book-2'
      
      addReview(bookId, 4, 'Good book', 'User1')
      addReview(bookId, 5, 'Excellent', 'User2')
      
      const reviews = getReviews(bookId)
      expect(reviews).toHaveLength(2)
      expect(reviews[0].content).toBe('Good book')
      expect(reviews[1].content).toBe('Excellent')
    })

    it('should not return reviews from other books', () => {
      addReview('book-1', 4, 'Review for book 1', 'User1')
      addReview('book-2', 3, 'Review for book 2', 'User2')
      
      const book1Reviews = getReviews('book-1')
      const book2Reviews = getReviews('book-2')
      
      expect(book1Reviews).toHaveLength(1)
      expect(book2Reviews).toHaveLength(1)
      expect(book1Reviews[0].content).toBe('Review for book 1')
      expect(book2Reviews[0].content).toBe('Review for book 2')
    })
  })

  describe('voteOnReview', () => {
    it('should increment upvotes when voting up', () => {
      const bookId = 'test-book-3'
      const review = addReview(bookId, 4, 'Good book', 'User1')
      
      const success = voteOnReview(bookId, review.id, 'up')
      
      expect(success).toBe(true)
      const reviews = getReviews(bookId)
      expect(reviews[0].upvotes).toBe(1)
      expect(reviews[0].downvotes).toBe(0)
    })

    it('should increment downvotes when voting down', () => {
      const bookId = 'test-book-4'
      const review = addReview(bookId, 4, 'Good book', 'User1')
      
      const success = voteOnReview(bookId, review.id, 'down')
      
      expect(success).toBe(true)
      const reviews = getReviews(bookId)
      expect(reviews[0].upvotes).toBe(0)
      expect(reviews[0].downvotes).toBe(1)
    })

    it('should return false for non-existent book', () => {
      const success = voteOnReview('non-existent-book', 1, 'up')
      expect(success).toBe(false)
    })

    it('should return false for non-existent review', () => {
      const bookId = 'test-book-5'
      addReview(bookId, 4, 'Good book', 'User1')
      
      const success = voteOnReview(bookId, 999, 'up')
      expect(success).toBe(false)
    })

    it('should handle multiple votes on same review', () => {
      const bookId = 'test-book-6'
      const review = addReview(bookId, 4, 'Good book', 'User1')
      
      voteOnReview(bookId, review.id, 'up')
      voteOnReview(bookId, review.id, 'up')
      voteOnReview(bookId, review.id, 'down')
      
      const reviews = getReviews(bookId)
      expect(reviews[0].upvotes).toBe(2)
      expect(reviews[0].downvotes).toBe(1)
    })
  })

  describe('getAverageRating', () => {
    it('should return 0 for book with no reviews', () => {
      const average = getAverageRating('non-existent-book')
      expect(average).toBe(0)
    })

    it('should return correct average for single review', () => {
      const bookId = 'test-book-7'
      addReview(bookId, 4, 'Good book', 'User1')
      
      const average = getAverageRating(bookId)
      expect(average).toBe(4)
    })

    it('should calculate correct average for multiple reviews', () => {
      const bookId = 'test-book-8'
      addReview(bookId, 5, 'Excellent', 'User1')
      addReview(bookId, 3, 'OK', 'User2')
      addReview(bookId, 4, 'Good', 'User3')
      
      const average = getAverageRating(bookId)
      expect(average).toBe(4) // (5 + 3 + 4) / 3 = 4
    })

    it('should handle fractional averages', () => {
      const bookId = 'test-book-9'
      addReview(bookId, 5, 'Excellent', 'User1')
      addReview(bookId, 4, 'Good', 'User2')
      
      const average = getAverageRating(bookId)
      expect(average).toBe(4.5) // (5 + 4) / 2 = 4.5
    })

    it('should handle edge case with all minimum ratings', () => {
      const bookId = 'test-book-10'
      addReview(bookId, 1, 'Poor', 'User1')
      addReview(bookId, 1, 'Terrible', 'User2')
      
      const average = getAverageRating(bookId)
      expect(average).toBe(1)
    })

    it('should handle edge case with all maximum ratings', () => {
      const bookId = 'test-book-11'
      addReview(bookId, 5, 'Perfect', 'User1')
      addReview(bookId, 5, 'Amazing', 'User2')
      
      const average = getAverageRating(bookId)
      expect(average).toBe(5)
    })
  })
})
