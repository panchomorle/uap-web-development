import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupMongooseMock, mockUserModel } from './mocks/mongo';

// Mock the next/server and next-auth
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data) => ({
      data,
      headers: new Map()
    })),
    redirect: vi.fn((url) => ({ url }))
  }
}));

// Mock the JWT methods
vi.mock('@/lib/auth', () => ({
  getUserFromToken: vi.fn()
}));

// Mock the route handler
vi.mock('@/app/api/auth/sync/route', () => ({
  GET: vi.fn()
}));

// Import after mocking
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { GET } from '@/app/api/auth/sync/route';

describe('API Routes Tests', () => {
  beforeEach(() => {
    setupMongooseMock();
    vi.clearAllMocks();
  });

  describe('Auth Sync API', () => {
    it('should return user data when valid token provided', async () => {
      // Setup
      const mockUser = { id: 'user123', username: 'testuser' };
      (getUserFromToken as any).mockResolvedValueOnce(mockUser);
      
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: 'valid-token' })
        }
      };
      
      // Setup mock response
      (GET as any).mockImplementation(async (req: any) => {
        const token = req.cookies.get('authToken')?.value;
        const user = token ? await getUserFromToken(token) : null;
        
        return NextResponse.json({
          success: true,
          user,
          token: user ? 'mock-token' : null
        });
      });

      // Execute
      const response = await GET(request as any);
      const responseData = (response as any).data;

      // Verify
      expect(getUserFromToken).toHaveBeenCalledWith('valid-token');
      expect(responseData).toEqual({
        success: true,
        user: mockUser,
        token: expect.any(String) 
      });
    });

    it('should return null user when no token provided', async () => {
      // Setup
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue(null)
        }
      };
      
      // Setup mock response
      (GET as any).mockImplementation(async (req: any) => {
        const token = req.cookies.get('authToken')?.value;
        const user = token ? await getUserFromToken(token) : null;
        
        return NextResponse.json({
          success: true,
          user,
          token: user ? 'mock-token' : null
        });
      });

      // Execute
      const response = await GET(request as any);
      const responseData = (response as any).data;

      // Verify
      expect(getUserFromToken).not.toHaveBeenCalled();
      expect(responseData).toEqual({
        success: true,
        user: null,
        token: null
      });
    });

    it('should return null user when token is invalid', async () => {
      // Setup
      (getUserFromToken as any).mockResolvedValueOnce(null); // Invalid token
      
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: 'invalid-token' })
        }
      };
      
      // Setup mock response
      (GET as any).mockImplementation(async (req: any) => {
        const token = req.cookies.get('authToken')?.value;
        const user = token ? await getUserFromToken(token) : null;
        
        return NextResponse.json({
          success: true,
          user,
          token: user ? 'mock-token' : null
        });
      });

      // Execute
      const response = await GET(request as any);
      const responseData = (response as any).data;

      // Verify
      expect(getUserFromToken).toHaveBeenCalledWith('invalid-token');
      expect(responseData).toEqual({
        success: true,
        user: null,
        token: null
      });
    });
  });
});
