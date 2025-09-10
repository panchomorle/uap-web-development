'use client';

import React from "react";
import Link from "next/link";
import SessionButton from "../components/SessionButton";

export default function Header({ user }: { user: any }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md border-b">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          📚 Book Reviews
        </Link>
      </div>
      
      <nav className="flex items-center space-x-6">
        <Link 
          href="/" 
          className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          Home
        </Link>
        
        {user && (
          <Link 
            href="/profile" 
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            My Profile
          </Link>
        )}
        
        {user ? (
          <SessionButton user={user} logout={async () => {
            // Clear localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            
            // Call API to clear server-side cookie
            await fetch('/api/auth', {
              method: 'DELETE',
            });
            
            // Redirect to login page
            window.location.href = '/login';
          }} />
        ) : (
          <div className="flex items-center space-x-3">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}