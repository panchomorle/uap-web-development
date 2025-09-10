'use client';

import { useState, useTransition } from 'react';
import { createReview } from '../lib/actions';
import StarRating from './StarRating';

interface ReviewFormProps {
  bookId: string;
  user: any;
}

export default function ReviewForm({ bookId, user }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0 || !content.trim()) {
      return;
    }
    startTransition(async () => {
      try {
        await createReview(bookId, rating, content.trim(), user.id);
        setRating(0);
        setContent('');
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
      } catch (error) {
        console.error('Error submitting review:', error);
      }
    });
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review Submitted!</h3>
        <p className="text-gray-600">Thank you for sharing your thoughts on this book.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-600">
        Please <a href="/login" className="text-blue-600 underline">sign in</a> to write a review.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating *
        </label>
        <StarRating 
          rating={rating} 
          onRatingChange={setRating}
          interactive={true}
          size="lg"
        />
        {rating === 0 && (
          <p className="text-xs text-gray-500 mt-1">Click on a star to rate this book</p>
        )}
      </div>

      {/* Review Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Your Review *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Share your thoughts about this book..."
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {content.length}/500 characters
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || rating === 0 || !content.trim() || !user}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
      >
        {isPending ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
}