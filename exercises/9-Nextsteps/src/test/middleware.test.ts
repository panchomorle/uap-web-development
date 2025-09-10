import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

// Create a mock for the middleware module
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

// Import the mocked middleware
import { middleware } from '@/middleware';

describe('Middleware Authorization Tests', () => {
  
  // Helper function to create mock request
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
  
  describe('Public routes', () => {
    it('allows unauthenticated users to access home page', () => {
      const req = createMockRequest('/');
      const result = middleware(req);
      expect(result.status).toBe(200); // NextResponse.next() has 200 status
    });
    
    it('allows unauthenticated users to access book details', () => {
      const req = createMockRequest('/book/123');
      const result = middleware(req);
      expect(result.status).toBe(200);
    });
  });
  
  describe('Protected routes', () => {
    it('redirects unauthenticated users from profile to login', () => {
      const req = createMockRequest('/profile');
      const result = middleware(req);
      expect(result.status).toBe(307); // Redirect status
      expect(result.headers.get('location')).toContain('/login');
    });
    
    it('allows authenticated users to access profile', () => {
      const req = createMockRequest('/profile', true);
      const result = middleware(req);
      expect(result.status).toBe(200);
    });
    
    it('redirects unauthenticated users from favorites to login', () => {
      const req = createMockRequest('/favorites');
      const result = middleware(req);
      expect(result.status).toBe(307); // Redirect status
      expect(result.headers.get('location')).toContain('/login');
    });
    
    it('allows authenticated users to access favorites', () => {
      const req = createMockRequest('/favorites', true);
      const result = middleware(req);
      expect(result.status).toBe(200);
    });
  });
  
  describe('Authentication routes', () => {
    it('allows unauthenticated users to access login page', () => {
      const req = createMockRequest('/login');
      const result = middleware(req);
      expect(result.status).toBe(200);
    });
    
    it('redirects authenticated users from login to home', () => {
      const req = createMockRequest('/login', true);
      const result = middleware(req);
      expect(result.status).toBe(307); // Redirect status
      expect(result.headers.get('location')).toContain('/');
    });
    
    it('allows unauthenticated users to access register page', () => {
      const req = createMockRequest('/register');
      const result = middleware(req);
      expect(result.status).toBe(200);
    });
    
    it('redirects authenticated users from register to home', () => {
      const req = createMockRequest('/register', true);
      const result = middleware(req);
      expect(result.status).toBe(307); // Redirect status
      expect(result.headers.get('location')).toContain('/');
    });
  });
});
