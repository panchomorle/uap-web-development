'use server';

import { Book, GoogleBooksResponse, Review } from './types';
import { getReviews, addReview, voteOnReview, getAverageRating } from './database';

export async function searchBooks(query: string): Promise<Book[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=20`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data: GoogleBooksResponse = await response.json();
    
    if (!data.items) {
      return [];
    }

    return data.items.map(item => ({
      ...item.volumeInfo,
      id: item.id
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${id}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      ...data.volumeInfo,
      id: data.id
    };
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

export async function getBookReviews(bookId: string): Promise<Review[]> {
  return getReviews(bookId);
}

export async function createReview(
  bookId: string, 
  rating: number, 
  content: string, 
  userName: string
): Promise<Review> {
  return addReview(bookId, rating, content, userName);
}

export async function voteReview(
  bookId: string, 
  reviewId: number, 
  voteType: 'up' | 'down'
): Promise<boolean> {
  return voteOnReview(bookId, reviewId, voteType);
}

export async function getBookAverageRating(bookId: string): Promise<number> {
  return getAverageRating(bookId);
}
