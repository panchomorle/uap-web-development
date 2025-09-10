'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("[AuthMiddleware] Checking authentication status");
        // Check for stored auth data on mount
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        
        // Always verify with server to ensure sync between client and server
        const response = await fetch('/api/auth/sync', {
          method: 'GET',
          credentials: 'same-origin', // Include cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("[AuthMiddleware] Auth sync response:", data.authenticated ? "authenticated" : "not authenticated");
          
          if (data.authenticated && data.user) {
            // Update local state with server data
            setToken(data.token);
            setUser(data.user);
            
            // Update localStorage with fresh data from server
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify(data.user));
            console.log("[AuthMiddleware] Updated auth state with server data for:", data.user.username);
          } else {
            // If server says not authenticated, clear local storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setToken(null);
            setUser(null);
            console.log("[AuthMiddleware] Cleared auth state based on server response");
          }
        } else {
          // If API call fails but we have local storage data, use that temporarily
          if (storedToken && storedUser) {
            console.log("[AuthMiddleware] API call failed, using stored credentials temporarily");
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('[AuthMiddleware] Auth check error:', error);
      } finally {
        console.log("[AuthMiddleware] Auth check complete, setting loading=false");
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    router.push('/');
  };

  const logout = async () => {
    console.log("[AuthMiddleware] Starting logout process");
    // Clear client-side state first for immediate feedback
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Also clear the cookie via API call
    try {
      const response = await fetch('/api/auth', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        console.log("[AuthMiddleware] Server-side logout successful");
      } else {
        console.error("[AuthMiddleware] Server-side logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("[AuthMiddleware] Error during server-side logout:", error);
      // Even if server logout fails, we continue with client-side logout
    }
    
    // Navigate to login page
    console.log("[AuthMiddleware] Redirecting to login page");
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
