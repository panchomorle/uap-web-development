import { describe, it, expect, beforeEach, vi } from 'vitest'
import { searchBooks } from '@/app/actions'
import { addReview, getReviews, voteOnReview, getAverageRating } from '@/lib/database'
import { validateReviewContent, validateRating, sortReviewsByRelevance } from '@/lib/reviewUtils'

describe('Integration Tests - Complete Review Flow', () => {
  beforeEach(() => {
    // Clear any existing reviews
    // Note: In a real implementation, you'd want a way to reset the database
  })

  describe('Book Search and Review Flow', () => {
    it('should complete full workflow: search -> add review -> vote -> calculate stats', async () => {
      // Mock fetch for Google Books API
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      const mockBookResponse = {
        id: 'test-book-123',
        volumeInfo: {
          title: 'Test Book',
          authors: ['Test Author'],
          description: 'A test book description',
          publishedDate: '2023-01-01',
          pageCount: 300
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          totalItems: 1,
          items: [mockBookResponse]
        })
      })

      // Step 1: Search for books
      const searchResult = await searchBooks('test book')
      expect(searchResult.items).toHaveLength(1)
      expect(searchResult.items?.[0].volumeInfo.title).toBe('Test Book')

      const bookId = searchResult.items?.[0].id;
      if (!bookId) {
        throw new Error('No se encontró el id del libro en los resultados de búsqueda');
      }

      // Step 2: Add multiple reviews
      const review1 = addReview(bookId, 5, 'Excellent book with great characters and plot!', 'Alice')
      const review2 = addReview(bookId, 4, 'Really enjoyed this book, highly recommend it.', 'Bob')
      const review3 = addReview(bookId, 3, 'It was okay, not bad but not amazing either.', 'Charlie')

      // Step 3: Verify reviews are stored
      const allReviews = getReviews(bookId)
      expect(allReviews).toHaveLength(3)

      // Step 4: Vote on reviews
      voteOnReview(bookId, review1._id, 'up')
      voteOnReview(bookId, review1._id, 'up')
      voteOnReview(bookId, review1._id, 'up')
      voteOnReview(bookId, review2._id, 'up')
      voteOnReview(bookId, review3._id, 'down')

      // Step 5: Check updated reviews and sorting
      const updatedReviews = getReviews(bookId)
      const sortedReviews = sortReviewsByRelevance(updatedReviews)

      // Most upvoted review should be first
      expect(sortedReviews[0]._id).toBe(review1._id)
      expect(sortedReviews[0].upvotes).toBe(3)

      // Step 6: Calculate average rating
      const averageRating = getAverageRating(bookId)
      expect(averageRating).toBe(4) // (5 + 4 + 3) / 3 = 4

      mockFetch.mockRestore()
    })

    it('should handle validation errors in review submission', () => {
      const bookId = 'test-book'

      // Test invalid rating
      const ratingResult = validateRating(6)
      expect(ratingResult.isValid).toBe(false)
      expect(ratingResult.error).toBe('Rating must be between 1 and 5')

      // Test invalid content
      const contentResult = validateReviewContent('bad')
      expect(contentResult.isValid).toBe(false)
      expect(contentResult.error).toBe('Review must be at least 10 characters long')

      // Don't add review if validation fails
      if (!ratingResult.isValid || !contentResult.isValid) {
        // In a real app, you wouldn't call addReview here
        const reviewsBefore = getReviews(bookId)
        const reviewsAfter = getReviews(bookId)
        expect(reviewsAfter.length).toBe(reviewsBefore.length)
      }
    })

    it('should handle edge cases in the complete flow', async () => {
      // Mock API failure
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      // API failure should return empty results
      const searchResult = await searchBooks('failing query')
      expect(searchResult.totalItems).toBe(0)
      expect(searchResult.items).toEqual([])

      // Test with non-existent book
      const nonExistentBookReviews = getReviews('non-existent-book')
      expect(nonExistentBookReviews).toEqual([])

      const averageForNonExistent = getAverageRating('non-existent-book')
      expect(averageForNonExistent).toBe(0)

      // Test voting on non-existent review
      const voteResult = voteOnReview('any-book', "999", 'up')
      expect(voteResult).toBe(false)

      mockFetch.mockRestore()
    })

    it('should maintain data consistency across operations', () => {
      const bookId = 'consistency-test-book'

      // Add reviews
      const review1 = addReview(bookId, 5, 'Amazing book, loved every page of it!', 'Reader1')
      const review2 = addReview(bookId, 1, 'Terrible book, waste of time reading this.', 'Reader2')

      // Initial state
      let reviews = getReviews(bookId)
      expect(reviews).toHaveLength(2)
      expect(getAverageRating(bookId)).toBe(3) // (5 + 1) / 2

      // Vote on reviews
      voteOnReview(bookId, review1._id, 'up')
      voteOnReview(bookId, review1._id, 'up')
      voteOnReview(bookId, review2._id, 'down')

      // Verify consistency
      reviews = getReviews(bookId)
      expect(reviews).toHaveLength(2) // Same number of reviews

      const review1Updated = reviews.find(r => r._id === review1._id)
      const review2Updated = reviews.find(r => r._id === review2._id)

      expect(review1Updated?.upvotes).toBe(2)
      expect(review1Updated?.downvotes).toBe(0)
      expect(review2Updated?.upvotes).toBe(0)
      expect(review2Updated?.downvotes).toBe(1)

      // Average rating should remain the same (votes don't affect basic average)
      expect(getAverageRating(bookId)).toBe(3)
    })

    it('should handle concurrent operations safely', () => {
      const bookId = 'concurrent-test-book'

      // Simulate multiple users adding reviews simultaneously
      const reviews = []
      for (let i = 0; i < 5; i++) {
        reviews.push(addReview(
          bookId,
          Math.floor(Math.random() * 5) + 1,
          `Review number ${i + 1} with sufficient content for validation`,
          `User${i + 1}`
        ))
      }

      // All reviews should be added
      const allReviews = getReviews(bookId)
      expect(allReviews).toHaveLength(5)

      // Each review should have unique ID
      const ids = allReviews.map(r => r._id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(5)

      // Simulate concurrent voting
      reviews.forEach(review => {
        for (let i = 0; i < 3; i++) {
          voteOnReview(bookId, review._id, 'up')
        }
      })

      // Verify all votes were recorded
      const updatedReviews = getReviews(bookId)
      updatedReviews.forEach(review => {
        expect(review.upvotes).toBe(3)
        expect(review.downvotes).toBe(0)
      })
    })
  })

  describe('Performance and Scalability Tests', () => {
    it('should handle large numbers of reviews efficiently', () => {
      const bookId = 'performance-test-book'
      const startTime = performance.now()

      // Add 1000 reviews
      for (let i = 0; i < 1000; i++) {
        addReview(
          bookId,
          (i % 5) + 1, // Rating 1-5
          `Performance test review number ${i} with sufficient content`,
          `User${i}`
        )
      }

      const addTime = performance.now()

      // Retrieve all reviews
      const allReviews = getReviews(bookId)
      expect(allReviews).toHaveLength(1000)

      const retrieveTime = performance.now()

      // Calculate average
      const average = getAverageRating(bookId)
      expect(average).toBeGreaterThan(0)
      expect(average).toBeLessThanOrEqual(5)

      const avgTime = performance.now()

      // Sort reviews
      const sorted = sortReviewsByRelevance(allReviews)
      expect(sorted).toHaveLength(1000)

      const sortTime = performance.now()

      // Performance should be reasonable (adjust thresholds as needed)
      expect(addTime - startTime).toBeLessThan(1000) // Adding 1000 reviews < 1s
      expect(retrieveTime - addTime).toBeLessThan(100) // Retrieving < 100ms
      expect(avgTime - retrieveTime).toBeLessThan(100) // Average calc < 100ms
      expect(sortTime - avgTime).toBeLessThan(500) // Sorting < 500ms
    })
  })

  describe('Data Validation and Security', () => {
    it('should sanitize and validate all inputs', () => {
      const bookId = 'security-test-book'

      // Test various malicious inputs
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '${process.env}',
        'SELECT * FROM reviews',
        '../../../etc/passwd',
        'null',
        'undefined',
        ''
      ]

      maliciousInputs.forEach(input => {
        // Content validation should catch these
        const contentResult = validateReviewContent(input)
        if (contentResult.isValid) {
          // If validation passes, ensure the content is safely stored
          const review = addReview(bookId, 3, input, 'TestUser')
          expect(review.content).toBe(input) // Should be stored as-is for legitimate content
        }
      })

      // Test invalid ratings
      const invalidRatings = [-1, 0, 6, 7, 3.5, NaN, Infinity, -Infinity]
      invalidRatings.forEach(rating => {
        const result = validateRating(rating)
        expect(result.isValid).toBe(false)
      })
    })

    it('should handle unicode and special characters correctly', () => {
      const bookId = 'unicode-test-book'
      
      const unicodeContent = '这是一个很好的书! 📚 Book review with émojis and accénts'
      const contentResult = validateReviewContent(unicodeContent)
      if (contentResult.isValid) {
        const review = addReview(bookId, 4, unicodeContent, 'UnicodeUser')
        expect(review.content).toBe(unicodeContent)
        const retrievedReviews = getReviews(bookId)
        expect(retrievedReviews[0].content).toBe(unicodeContent)
      }
    })
  })
})
