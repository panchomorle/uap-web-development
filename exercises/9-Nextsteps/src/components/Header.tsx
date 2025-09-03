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
        
        {user ? (
          <SessionButton user={user} logout={() => {
            // TODO: Implement server-side logout (clear cookie, redirect)
            document.cookie = 'authToken=; Max-Age=0; path=/;';
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