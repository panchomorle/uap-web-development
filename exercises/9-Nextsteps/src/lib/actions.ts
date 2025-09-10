'use server';

import { revalidatePath } from 'next/cache';
import { Book, GoogleBooksResponse, Review } from './types';
import { getReviews, addReview, upvoteReview, downvoteReview } from '../actions/reviews';
import { getAverageRating } from './database';
import { Types } from 'mongoose';

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

export async function getBookReviews(bookId: string) {
  // Returns reviews from MongoDB, normalized to flat Review type
  const rawReviews = await getReviews(bookId);
  // Normalize reviews to avoid circular references and match expected type
  return rawReviews.map((r: any) => ({
    id: r._id?.toString?.() || r.id?.toString?.() || r.id,
    bookId: r.bookId,
    rating: r.rating,
    content: r.content,
    userId: typeof r.userId === 'object' && r.userId !== null ? (r.userId.username || r.userId._id?.toString?.() || r.userId.toString?.() || '') : (r.userId?.toString?.() || ''),
    date: r.date ? (typeof r.date === 'string' ? r.date : new Date(r.date).toISOString()) : '',
    upvotes: r.upvotes ?? 0,
    downvotes: r.downvotes ?? 0,
  }));
}

export async function createReview(
  bookId: string,
  rating: number,
  content: string,
  userId: string // Now expects userId from authentication
): Promise<any> {
  // Validate input (optional: use reviewUtils)
  // ...existing code...
  const review = await addReview({ bookId, rating, content, userId: new Types.ObjectId(userId) });
  revalidatePath(`/book/${bookId}`);
  return review;
}

export async function voteReview(
  bookId: string,
  reviewId: string,
  voteType: 'up' | 'down',
  userId: string
): Promise<boolean> {
  let result;
  if (voteType === 'up') {
    result = await upvoteReview(reviewId, userId);
  } else {
    result = await downvoteReview(reviewId, userId);
  }
  if (result) {
    revalidatePath(`/book/${bookId}`);
    return true;
  }
  return false;
}

export async function getBookAverageRating(bookId: string): Promise<number> {
  return getAverageRating(bookId);
}
