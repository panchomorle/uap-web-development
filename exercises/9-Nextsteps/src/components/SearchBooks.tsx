'use client';
/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { searchBooks } from '../lib/actions';
import { Book } from '../lib/types';
import SearchForm from './SearchForm';
import BookCard from './BookCard';
import LoadingSpinner from './LoadingSpinner';

export default function SearchBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    setHasSearched(true);
    
    try {
      const results = await searchBooks(query);
      setBooks(results);
    } catch (error) {
      console.error('Search failed:', error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SearchForm onSearch={handleSearch} defaultValue={searchQuery} />
      
      {isLoading && <LoadingSpinner message="Searching for books..." />}
      
      {!isLoading && hasSearched && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {books.length > 0 
                ? `Found ${books.length} book${books.length !== 1 ? 's' : ''} for "${searchQuery}"`
                : `No books found for "${searchQuery}"`
              }
            </h2>
          </div>
          
          {books.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
          
          {books.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                Try searching with different keywords or check your spelling.
              </p>
              <p className="text-sm text-gray-500">
                Example searches: "Harry Potter", "Stephen King", "programming"
              </p>
            </div>
          )}
        </div>
      )}
      
      {!hasSearched && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Discover Amazing Books
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search for books by title, author, or ISBN using the Google Books API. 
            Find detailed information, read descriptions, and share your reviews with the community.
          </p>
        </div>
      )}
    </div>
  );
}
