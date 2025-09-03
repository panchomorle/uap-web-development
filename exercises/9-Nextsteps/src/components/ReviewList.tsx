'use client';

import { useState, useTransition } from 'react';
import { Review } from '../lib/types';
import { voteReview } from '../lib/actions';
import StarRating from './StarRating';

interface ReviewListProps {
  reviews: Review[];
  bookId: string;
}

interface ReviewItemProps {
  review: Review;
  bookId: string;
}

function ReviewItem({ review, bookId }: ReviewItemProps) {
  const [isPending, startTransition] = useTransition();
  const [localUpvotes, setLocalUpvotes] = useState(review.upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(review.downvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = (voteType: 'up' | 'down') => {
    if (isPending || userVote) return; // Prevent multiple votes

    startTransition(async () => {
      try {
        const success = await voteReview(bookId, review.id, voteType);
        if (success) {
          if (voteType === 'up') {
            setLocalUpvotes(prev => prev + 1);
          } else {
            setLocalDownvotes(prev => prev + 1);
          }
          setUserVote(voteType);
        }
      } catch (error) {
        console.error('Error voting on review:', error);
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{review.userId}</span> {/* Show userId or fetch username via API */}
            <StarRating rating={review.rating} size="sm" />
          </div>
          <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-3">
        <p className="text-gray-700 text-sm leading-relaxed">{review.content}</p>
      </div>

      {/* Voting */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleVote('up')}
          disabled={isPending || !!userVote}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
            userVote === 'up'
              ? 'bg-green-100 text-green-700'
              : userVote
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <span>{localUpvotes}</span>
        </button>

        <button
          onClick={() => handleVote('down')}
          disabled={isPending || !!userVote}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
            userVote === 'down'
              ? 'bg-red-100 text-red-700'
              : userVote
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>{localDownvotes}</span>
        </button>

        {userVote && (
          <span className="text-xs text-gray-500">
            You voted {userVote === 'up' ? 'helpful' : 'not helpful'}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ReviewList({ reviews, bookId }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date');

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'helpful':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      default:
        return 0;
    }
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No reviews yet</h3>
        <p className="text-xs text-gray-600">Be the first to review this book!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'helpful')}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="date">Most Recent</option>
          <option value="rating">Highest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewItem key={review.id} review={review} bookId={bookId} />
        ))}
      </div>
    </div>
  );
}