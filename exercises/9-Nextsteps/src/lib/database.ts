import { Review } from './types';

// Simple in-memory storage for reviews (in a real app, this would be a database)
const reviews: Map<string, Review[]> = new Map();
let reviewIdCounter = 1;

export function getReviews(bookId: string): Review[] {
  return reviews.get(bookId) || [];
}

export function addReview(bookId: string, rating: number, content: string, userName: string): Review {
  const review: Review = {
    id: reviewIdCounter++,
    bookId,
    rating,
    content,
    userName,
    date: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0
  };

  const bookReviews = reviews.get(bookId) || [];
  bookReviews.push(review);
  reviews.set(bookId, bookReviews);

  return review;
}

export function voteOnReview(bookId: string, reviewId: number, voteType: 'up' | 'down'): boolean {
  const bookReviews = reviews.get(bookId);
  if (!bookReviews) return false;

  const review = bookReviews.find(r => r.id === reviewId);
  if (!review) return false;

  if (voteType === 'up') {
    review.upvotes++;
  } else {
    review.downvotes++;
  }

  return true;
}

export function getAverageRating(bookId: string): number {
  const bookReviews = getReviews(bookId);
  if (bookReviews.length === 0) return 0;
  
  const sum = bookReviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / bookReviews.length;
}
