import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchBooks, getBookById } from '@/lib/actions'
import { mockBook, mockBooksResponse } from '@/test/mocks/server'

// Mock fetch globally for these tests
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Actions', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('searchBooks', () => {
    it('should return books when API call is successful', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBooksResponse)
      })

      const result = await searchBooks('harry potter')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=harry%20potter&maxResults=20'
      )
      expect(result).toEqual(mockBooksResponse)
    })

    it('should handle special characters in search query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBooksResponse)
      })

      await searchBooks('C++ programming & algorithms')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=C%2B%2B%20programming%20%26%20algorithms&maxResults=20'
      )
    })

    it('should return empty result when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const result = await searchBooks('error query')

      expect(result).toEqual({ totalItems: 0, items: [] })
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await searchBooks('network error')

      expect(result).toEqual({ totalItems: 0, items: [] })
    })

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await searchBooks('malformed json')

      expect(result).toEqual({ totalItems: 0, items: [] })
    })

    it('should handle empty search query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ totalItems: 0, items: [] })
      })

      const result = await searchBooks('')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=&maxResults=20'
      )
      expect(result).toEqual({ totalItems: 0, items: [] })
    })

    it('should handle search with only spaces', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ totalItems: 0, items: [] })
      })

      const result = await searchBooks('   ')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=%20%20%20&maxResults=20'
      )
    })

    it('should handle very long search queries', async () => {
      const longQuery = 'a'.repeat(1000)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ totalItems: 0, items: [] })
      })

      const result = await searchBooks(longQuery)

      expect(mockFetch).toHaveBeenCalledWith(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(longQuery)}&maxResults=20`
      )
    })
  })

  describe('getBookById', () => {
    it('should return book when API call is successful', async () => {
      const bookId = 'test-book-id'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBook)
      })

      const result = await getBookById(bookId)

      expect(mockFetch).toHaveBeenCalledWith(
        `https://www.googleapis.com/books/v1/volumes/${bookId}`
      )
      expect(result).toEqual(mockBook)
    })

    it('should return null when book is not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await getBookById('non-existent-id')

      expect(result).toBeNull()
    })

    it('should return null when API returns server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const result = await getBookById('server-error-id')

      expect(result).toBeNull()
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await getBookById('network-error-id')

      expect(result).toBeNull()
    })

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await getBookById('malformed-json-id')

      expect(result).toBeNull()
    })

    it('should handle empty book ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      const result = await getBookById('')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes/'
      )
      expect(result).toBeNull()
    })

    it('should handle book ID with special characters', async () => {
      const specialId = 'book-id-with-&-symbols'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockBook, id: specialId })
      })

      const result = await getBookById(specialId)

      expect(mockFetch).toHaveBeenCalledWith(
        `https://www.googleapis.com/books/v1/volumes/${specialId}`
      )
      expect(result?.id).toBe(specialId)
    })
  })
})
