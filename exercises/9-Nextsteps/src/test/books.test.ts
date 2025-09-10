import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch function
global.fetch = vi.fn();

// Mock response data
const mockSearchResults = {
  items: [
    {
      id: 'book1',
      volumeInfo: {
        title: 'Test Book 1',
        authors: ['Author 1'],
        description: 'Description 1',
        imageLinks: {
          thumbnail: 'http://example.com/thumb1.jpg'
        },
        publishedDate: '2020',
        publisher: 'Publisher 1'
      }
    },
    {
      id: 'book2',
      volumeInfo: {
        title: 'Test Book 2',
        authors: ['Author 2A', 'Author 2B'],
        description: 'Description 2',
        imageLinks: {
          thumbnail: 'http://example.com/thumb2.jpg'
        },
        publishedDate: '2021',
        publisher: 'Publisher 2'
      }
    }
  ],
  totalItems: 2
};

// Import book functions after mocking
import { searchBooks, getBookDetails, formatAuthors, getThumbnail } from '@/lib/books';

describe('Book API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchBooks', () => {
    it('should fetch books based on search query', async () => {
      // Setup
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults
      });

      // Execute
      const result = await searchBooks('test query');

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.googleapis.com/books/v1/volumes'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=test+query'),
        expect.any(Object)
      );
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle search errors gracefully', async () => {
      // Setup
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      });

      // Execute & Verify
      await expect(searchBooks('test query')).rejects.toThrow('Error searching books: 500 Server Error');
    });

    it('should work with pagination parameters', async () => {
      // Setup
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults
      });

      // Execute
      await searchBooks('test query', 20, 10);

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('maxResults=20'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('startIndex=10'),
        expect.any(Object)
      );
    });
  });

  describe('getBookDetails', () => {
    it('should fetch details for a specific book ID', async () => {
      // Setup
      const mockBookDetails = mockSearchResults.items[0];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookDetails
      });

      // Execute
      const result = await getBookDetails('book1');

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.googleapis.com/books/v1/volumes/book1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockBookDetails);
    });

    it('should handle errors when fetching book details', async () => {
      // Setup
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      // Execute & Verify
      await expect(getBookDetails('nonexistent')).rejects.toThrow('Error fetching book details: 404 Not Found');
    });

    it('should handle missing book data', async () => {
      // Setup - returning null from API
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => null
      });

      // Execute & Verify
      await expect(getBookDetails('invalid')).rejects.toThrow('Book not found');
    });
  });
  
  describe('formatAuthors', () => {
    it('should format a single author correctly', () => {
      expect(formatAuthors(['Jane Doe'])).toBe('Jane Doe');
    });
    
    it('should format multiple authors correctly', () => {
      expect(formatAuthors(['Jane Doe', 'John Smith'])).toBe('Jane Doe and John Smith');
      expect(formatAuthors(['One', 'Two', 'Three'])).toBe('One, Two and Three');
    });
    
    it('should handle missing or empty authors array', () => {
      expect(formatAuthors(undefined)).toBe('Unknown Author');
      expect(formatAuthors([])).toBe('Unknown Author');
    });
  });
  
  describe('getThumbnail', () => {
    it('should return thumbnail URL when available', () => {
      const imageLinks = { thumbnail: 'http://example.com/thumb.jpg' };
      expect(getThumbnail(imageLinks)).toBe('https://example.com/thumb.jpg');
    });
    
    it('should fall back to smallThumbnail if thumbnail is not available', () => {
      const imageLinks = { smallThumbnail: 'http://example.com/small.jpg' };
      expect(getThumbnail(imageLinks)).toBe('https://example.com/small.jpg');
    });
    
    it('should return placeholder for missing imageLinks', () => {
      expect(getThumbnail(undefined)).toBe('/placeholder-book.png');
    });
    
    it('should return placeholder for empty imageLinks object', () => {
      expect(getThumbnail({})).toBe('/placeholder-book.png');
    });
    
    it('should convert http URLs to https', () => {
      const imageLinks = { thumbnail: 'http://unsafe-url.com/image.jpg' };
      expect(getThumbnail(imageLinks)).toBe('https://unsafe-url.com/image.jpg');
    });
    
    it('should leave https URLs unchanged', () => {
      const imageLinks = { thumbnail: 'https://already-secure.com/image.jpg' };
      expect(getThumbnail(imageLinks)).toBe('https://already-secure.com/image.jpg');
    });
  });
});
