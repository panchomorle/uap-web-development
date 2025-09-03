import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  calculateReviewScore,
  sortReviewsByRelevance,
  validateReviewContent,
  validateRating,
  formatReviewDate,
  calculateAverageRatingWithWeights,
  getReviewStatistics
} from '@/lib/reviewUtils'
import { Review } from '@/lib/types'

describe('Review Utils', () => {
  const mockReviews: Review[] = [
    {
      id: 1,
      bookId: 'book1',
      rating: 4,
      content: 'Great book with excellent storytelling',
      userName: 'User1',
      date: '2023-01-01T00:00:00.000Z',
      upvotes: 10,
      downvotes: 2
    },
    {
      id: 2,
      bookId: 'book1',
      rating: 2,
      content: 'Not my cup of tea, found it boring',
      userName: 'User2',
      date: '2023-01-02T00:00:00.000Z',
      upvotes: 1,
      downvotes: 8
    },
    {
      id: 3,
      bookId: 'book1',
      rating: 5,
      content: 'Absolutely brilliant masterpiece!',
      userName: 'User3',
      date: '2023-01-03T00:00:00.000Z',
      upvotes: 15,
      downvotes: 0
    }
  ]

  describe('calculateReviewScore', () => {
    it('should return base rating when no votes', () => {
      const review: Review = {
        id: 1,
        bookId: 'book1',
        rating: 4,
        content: 'Good book',
        userName: 'User1',
        date: '2023-01-01T00:00:00.000Z',
        upvotes: 0,
        downvotes: 0
      }

      const score = calculateReviewScore(review)
      expect(score).toBe(4)
    })

    it('should boost score for highly upvoted reviews', () => {
      const review: Review = {
        id: 1,
        bookId: 'book1',
        rating: 4,
        content: 'Good book',
        userName: 'User1',
        date: '2023-01-01T00:00:00.000Z',
        upvotes: 20,
        downvotes: 0
      }

      const score = calculateReviewScore(review)
      expect(score).toBeGreaterThan(4)
      expect(score).toBeLessThanOrEqual(5)
    })

    it('should penalize score for heavily downvoted reviews', () => {
      const review: Review = {
        id: 1,
        bookId: 'book1',
        rating: 4,
        content: 'Good book',
        userName: 'User1',
        date: '2023-01-01T00:00:00.000Z',
        upvotes: 2,
        downvotes: 10
      }

      const score = calculateReviewScore(review)
      expect(score).toBeLessThan(4)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should cap scores at 5', () => {
      const review: Review = {
        id: 1,
        bookId: 'book1',
        rating: 5,
        content: 'Perfect book',
        userName: 'User1',
        date: '2023-01-01T00:00:00.000Z',
        upvotes: 100,
        downvotes: 0
      }

      const score = calculateReviewScore(review)
      expect(score).toBe(5)
    })

    it('should floor scores at 0', () => {
      const review: Review = {
        id: 1,
        bookId: 'book1',
        rating: 1,
        content: 'Terrible book',
        userName: 'User1',
        date: '2023-01-01T00:00:00.000Z',
        upvotes: 0,
        downvotes: 100
      }

      const score = calculateReviewScore(review)
      expect(score).toBe(0)
    })
  })

  describe('sortReviewsByRelevance', () => {
    it('should sort reviews by calculated score', () => {
      const sorted = sortReviewsByRelevance(mockReviews)
      
      // Review with highest score should be first
      expect(sorted[0].id).toBe(3) // 5-star with 15 upvotes
      expect(sorted[1].id).toBe(1) // 4-star with net positive votes
      expect(sorted[2].id).toBe(2) // 2-star with net negative votes
    })

    it('should use engagement as tiebreaker', () => {
      const reviewsWithSameScore: Review[] = [
        {
          id: 1,
          bookId: 'book1',
          rating: 3,
          content: 'Average book',
          userName: 'User1',
          date: '2023-01-01T00:00:00.000Z',
          upvotes: 5,
          downvotes: 5 // 10 total engagement
        },
        {
          id: 2,
          bookId: 'book1',
          rating: 3,
          content: 'Average book too',
          userName: 'User2',
          date: '2023-01-01T00:00:00.000Z',
          upvotes: 3,
          downvotes: 3 // 6 total engagement
        }
      ]

      const sorted = sortReviewsByRelevance(reviewsWithSameScore)
      expect(sorted[0].id).toBe(1) // Higher engagement
    })

    it('should use date as final tiebreaker', () => {
      const reviewsWithSameScoreAndEngagement: Review[] = [
        {
          id: 1,
          bookId: 'book1',
          rating: 3,
          content: 'Average book',
          userName: 'User1',
          date: '2023-01-01T00:00:00.000Z',
          upvotes: 5,
          downvotes: 5
        },
        {
          id: 2,
          bookId: 'book1',
          rating: 3,
          content: 'Average book too',
          userName: 'User2',
          date: '2023-01-02T00:00:00.000Z', // Newer date
          upvotes: 5,
          downvotes: 5
        }
      ]

      const sorted = sortReviewsByRelevance(reviewsWithSameScoreAndEngagement)
      expect(sorted[0].id).toBe(2) // Newer review
    })

    it('should not mutate original array', () => {
      const original = [...mockReviews]
      sortReviewsByRelevance(mockReviews)
      expect(mockReviews).toEqual(original)
    })

    it('should handle empty array', () => {
      const sorted = sortReviewsByRelevance([])
      expect(sorted).toEqual([])
    })
  })

  describe('validateReviewContent', () => {
    it('should pass valid content', () => {
      const result = validateReviewContent('This is a good book with great characters.')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty content', () => {
      const result = validateReviewContent('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Review content cannot be empty')
    })

    it('should reject whitespace-only content', () => {
      const result = validateReviewContent('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Review content cannot be empty')
    })

    it('should reject content that is too short', () => {
      const result = validateReviewContent('Good')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Review must be at least 10 characters long')
    })

    it('should reject content that is too long', () => {
      const longContent = 'a'.repeat(1001)
      const result = validateReviewContent(longContent)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Review cannot exceed 1000 characters')
    })

    it('should detect repeated character spam', () => {
      const result = validateReviewContent('This book is goooooood')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Review content appears to be spam')
    })

    it('should detect all caps spam', () => {
      const result = validateReviewContent('THIS BOOK IS AMAZING!!!')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Review content appears to be spam')
    })

    it('should detect promotional spam phrases', () => {
      const result = validateReviewContent('Great book! Buy now for discount!')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Review content appears to be spam')
    })

    it('should return error for multiple issues', () => {
      const result = validateReviewContent('bad')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle edge cases', () => {
      // Exactly 10 characters
      const result1 = validateReviewContent('Good book!')
      expect(result1.isValid).toBe(true)
      expect(result1.error).toBeUndefined()
      
      // Exactly 1000 characters
      const maxContent = 'a'.repeat(1000)
      const result2 = validateReviewContent(maxContent)
      expect(result2.isValid).toBe(true)
      expect(result2.error).toBeUndefined()
    })
  })

  describe('validateRating', () => {
    it('should pass valid integer ratings', () => {
      for (let i = 1; i <= 5; i++) {
        expect(validateRating(i)).toEqual([])
      }
    })

    it('should reject non-integer ratings', () => {
      const errors = validateRating(3.5)
      expect(errors).toContain('Rating must be a whole number')
    })

    it('should reject ratings below 1', () => {
      const errors = validateRating(0)
      expect(errors).toContain('Rating must be between 1 and 5')
    })

    it('should reject ratings above 5', () => {
      const errors = validateRating(6)
      expect(errors).toContain('Rating must be between 1 and 5')
    })

    it('should reject negative ratings', () => {
      const errors = validateRating(-1)
      expect(errors).toContain('Rating must be between 1 and 5')
    })

    it('should return multiple errors for invalid non-integer out-of-range', () => {
      const errors = validateRating(6.5)
      expect(errors).toHaveLength(2)
    })
  })

  describe('formatReviewDate', () => {
    beforeEach(() => {
      // Mock current date for consistent testing
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-10T12:00:00.000Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return "Just now" for very recent dates', () => {
      const result = formatReviewDate('2023-01-10T11:59:30.000Z')
      expect(result).toBe('Just now')
    })

    it('should return minutes ago for recent dates', () => {
      const result = formatReviewDate('2023-01-10T11:45:00.000Z')
      expect(result).toBe('15 minutes ago')
    })

    it('should return hours ago for same day', () => {
      const result = formatReviewDate('2023-01-10T09:00:00.000Z')
      expect(result).toBe('3 hours ago')
    })

    it('should return "Yesterday" for previous day', () => {
      const result = formatReviewDate('2023-01-09T12:00:00.000Z')
      expect(result).toBe('Yesterday')
    })

    it('should return days ago for recent days', () => {
      const result = formatReviewDate('2023-01-07T12:00:00.000Z')
      expect(result).toBe('3 days ago')
    })

    it('should return weeks ago for recent weeks', () => {
      const result = formatReviewDate('2022-12-27T12:00:00.000Z')
      expect(result).toBe('2 weeks ago')
    })

    it('should return months ago for recent months', () => {
      const result = formatReviewDate('2022-11-10T12:00:00.000Z')
      expect(result).toBe('2 months ago')
    })

    it('should return years ago for old dates', () => {
      const result = formatReviewDate('2021-01-10T12:00:00.000Z')
      expect(result).toBe('2 years ago')
    })

    it('should handle invalid dates', () => {
      const result = formatReviewDate('invalid-date')
      expect(result).toBe('Unknown date')
    })

    it('should use singular forms correctly', () => {
      expect(formatReviewDate('2023-01-10T11:00:00.000Z')).toBe('1 hour ago')
      expect(formatReviewDate('2023-01-03T12:00:00.000Z')).toBe('1 week ago')
      expect(formatReviewDate('2022-12-10T12:00:00.000Z')).toBe('1 month ago')
      expect(formatReviewDate('2022-01-10T12:00:00.000Z')).toBe('1 year ago')
    })
  })

  describe('calculateAverageRatingWithWeights', () => {
    it('should return 0 for empty reviews', () => {
      const average = calculateAverageRatingWithWeights([])
      expect(average).toBe(0)
    })

    it('should weight reviews based on engagement', () => {
      const reviews: Review[] = [
        {
          id: 1,
          bookId: 'book1',
          rating: 5,
          content: 'Amazing',
          userName: 'User1',
          date: '2023-01-01T00:00:00.000Z',
          upvotes: 100, // High engagement
          downvotes: 0
        },
        {
          id: 2,
          bookId: 'book1',
          rating: 1,
          content: 'Terrible',
          userName: 'User2',
          date: '2023-01-01T00:00:00.000Z',
          upvotes: 0, // Low engagement
          downvotes: 0
        }
      ]

      const weightedAverage = calculateAverageRatingWithWeights(reviews)
      const simpleAverage = (5 + 1) / 2

      // Weighted average should be closer to 5 than simple average
      expect(weightedAverage).toBeGreaterThan(simpleAverage)
    })

    it('should handle reviews with no engagement', () => {
      const reviews: Review[] = [
        {
          id: 1,
          bookId: 'book1',
          rating: 3,
          content: 'OK',
          userName: 'User1',
          date: '2023-01-01T00:00:00.000Z',
          upvotes: 0,
          downvotes: 0
        },
        {
          id: 2,
          bookId: 'book1',
          rating: 4,
          content: 'Good',
          userName: 'User2',
          date: '2023-01-01T00:00:00.000Z',
          upvotes: 0,
          downvotes: 0
        }
      ]

      const average = calculateAverageRatingWithWeights(reviews)
      expect(average).toBe(3.5) // Should equal simple average
    })
  })

  describe('getReviewStatistics', () => {
    it('should return correct statistics for empty reviews', () => {
      const stats = getReviewStatistics([])
      
      expect(stats).toEqual({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        totalUpvotes: 0,
        totalDownvotes: 0,
        engagementRate: 0
      })
    })

    it('should calculate correct statistics for reviews', () => {
      const stats = getReviewStatistics(mockReviews)
      
      expect(stats.totalReviews).toBe(3)
      expect(stats.ratingDistribution).toEqual({ 1: 0, 2: 1, 3: 0, 4: 1, 5: 1 })
      expect(stats.totalUpvotes).toBe(26) // 10 + 1 + 15
      expect(stats.totalDownvotes).toBe(10) // 2 + 8 + 0
      expect(stats.engagementRate).toBe(12) // 36 total votes / 3 reviews
      expect(stats.averageRating).toBeGreaterThan(0)
    })

    it('should handle single review', () => {
      const singleReview = [mockReviews[0]]
      const stats = getReviewStatistics(singleReview)
      
      expect(stats.totalReviews).toBe(1)
      expect(stats.ratingDistribution[4]).toBe(1)
      expect(stats.totalUpvotes).toBe(10)
      expect(stats.totalDownvotes).toBe(2)
    })
  })
})
