import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { setupMongooseMock, mockUserModel, mockReviewModel } from './mocks/mongo';
import { validateUserData, validateReviewData } from '@/lib/validation';
import { searchBooks, getBookDetails, formatAuthors, getThumbnail } from '@/lib/books';

// Mock fetch for book API tests
global.fetch = vi.fn();

// Mock middleware
vi.mock('@/middleware', () => ({
  middleware: vi.fn((req: NextRequest) => {
    // Simulate middleware logic
    const { pathname } = req.nextUrl;
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isProtectedRoute = pathname.startsWith('/profile') || pathname.startsWith('/favorites');
    const token = req.cookies.get('authToken');
    
    if (isAuthRoute && token) {
      return NextResponse.redirect(new URL('/', 'http://localhost'));
    }
    
    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL('/login', 'http://localhost'));
    }
    
    return NextResponse.next();
  })
}));

// Import mocked middleware
import { middleware } from '@/middleware';

describe('Auth and Books Integration Tests', () => {
  beforeEach(() => {
    setupMongooseMock();
    vi.clearAllMocks();
  });
  
  describe('Authentication Flow', () => {
    // Helper function for testing middleware
    function createMockRequest(path: string, hasToken = false): NextRequest {
      return {
        nextUrl: { 
          pathname: path,
          clone: () => ({ pathname: path })
        },
        cookies: {
          get: vi.fn((name: string) => hasToken ? { value: 'mock-token' } : null)
        },
        // Add required properties to satisfy TypeScript
        url: new URL(`http://localhost${path}`),
        method: 'GET',
        headers: new Headers(),
        cache: 'default',
        credentials: 'same-origin',
        destination: 'document',
        integrity: '',
        keepalive: false,
        mode: 'cors',
        redirect: 'follow',
        referrer: '',
        referrerPolicy: 'no-referrer',
        clone: () => ({ } as NextRequest),
        body: null,
        bodyUsed: false,
        formData: async () => new FormData(),
        json: async () => ({}),
        text: async () => '',
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
        signal: new AbortController().signal,
        page: {},
        ua: {}
      } as unknown as NextRequest;
    }
    
    it('allows registration with valid user data', async () => {
      // Setup
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'SecurePass123!'
      };
      
      mockUserModel.findOne.mockResolvedValue(null); // No duplicate username or email
      
      // Test middleware allows access to register page
      const req = createMockRequest('/register');
      const middlewareResult = middleware(req);
      expect(middlewareResult.status).toBe(200);
      
      // Test validation accepts valid data
      const validationResult = await validateUserData(userData, true);
      expect(validationResult.success).toBe(true);
      expect(validationResult.errors).toEqual([]);
    });
    
    it('prevents authenticated users from accessing login', async () => {
      const req = createMockRequest('/login', true);
      const result = middleware(req);
      expect(result.status).toBe(307); // Redirect status
      expect(result.headers.get('location')).toContain('/');
    });
    
    it('redirects unauthenticated users from profile', async () => {
      const req = createMockRequest('/profile', false);
      const result = middleware(req);
      expect(result.status).toBe(307); // Redirect status
      expect(result.headers.get('location')).toContain('/login');
    });
  });
  
  describe('Book Search Flow', () => {
    // Mock search results
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
            }
          }
        }
      ],
      totalItems: 1
    };
    
    it('searches for books and formats results correctly', async () => {
      // Setup fetch mock
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults
      });
      
      // Search for books
      const results = await searchBooks('test book');
      
      // Verify search works
      expect(results.items).toHaveLength(1);
      expect(results.items[0].id).toBe('book1');
      
      // Verify formatting functions work correctly
      const book = results.items[0];
      const formattedAuthors = formatAuthors(book.volumeInfo.authors);
      const thumbnailUrl = getThumbnail(book.volumeInfo.imageLinks);
      
      expect(formattedAuthors).toBe('Author 1');
      expect(thumbnailUrl).toBe('https://example.com/thumb1.jpg');
    });
  });
  
  describe('Review Validation Flow', () => {
    it('validates review data and checks for duplicates', async () => {
      // Setup
      mockReviewModel.findOne.mockResolvedValue(null); // No duplicate review
      
      const reviewData = {
        bookId: 'book123',
        userId: 'user456',
        rating: 4,
        title: 'Great book!',
        content: 'This is an excellent book with engaging characters.'
      };
      
      // Validate review
      const validationResult = await validateReviewData(reviewData, true);
      
      // Verify validation works
      expect(validationResult.success).toBe(true);
      expect(validationResult.errors).toEqual([]);
      
      // Setup for duplicate check
      mockReviewModel.findOne.mockResolvedValue({ 
        bookId: 'book123',
        userId: 'user456'
      });
      
      // Validate review again
      const duplicateResult = await validateReviewData(reviewData, true);
      
      // Verify duplicate check works
      expect(duplicateResult.success).toBe(false);
      expect(duplicateResult.errors).toContain('You have already reviewed this book');
    });
  });
  
  describe('Combined Authentication and Book Review Flow', () => {
    // Helper function for testing middleware
    function createMockRequest(path: string, hasToken = false): NextRequest {
      return {
        nextUrl: { 
          pathname: path,
          clone: () => ({ pathname: path })
        },
        cookies: {
          get: vi.fn((name: string) => hasToken ? { value: 'mock-token' } : null)
        },
        // Add required properties to satisfy TypeScript
        url: new URL(`http://localhost${path}`),
        method: 'GET',
        headers: new Headers(),
        cache: 'default',
        credentials: 'same-origin',
        destination: 'document',
        integrity: '',
        keepalive: false,
        mode: 'cors',
        redirect: 'follow',
        referrer: '',
        referrerPolicy: 'no-referrer',
        clone: () => ({ } as NextRequest),
        body: null,
        bodyUsed: false,
        formData: async () => new FormData(),
        json: async () => ({}),
        text: async () => '',
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
        signal: new AbortController().signal,
        page: {},
        ua: {}
      } as unknown as NextRequest;
    }
    
    it('enforces authentication for adding reviews', async () => {
      // Check middleware blocks unauthenticated user
      const req = createMockRequest('/favorites', false);
      const result = middleware(req);
      expect(result.status).toBe(307); // Redirect status
      expect(result.headers.get('location')).toContain('/login');
      
      // Setup for book search and review
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          id: 'book123',
          volumeInfo: {
            title: 'Test Book',
            authors: ['Test Author']
          }
        })
      });
      
      mockReviewModel.findOne.mockResolvedValue(null); // No duplicate review
      
      // Get book details
      const book = await getBookDetails('book123');
      expect(book.id).toBe('book123');
      
      // Validate review data
      const reviewData = {
        bookId: 'book123',
        userId: 'user456',
        rating: 5,
        title: 'Amazing!',
        content: 'One of the best books I have ever read.'
      };
      
      const validationResult = await validateReviewData(reviewData, true);
      expect(validationResult.success).toBe(true);
    });
  });
});
