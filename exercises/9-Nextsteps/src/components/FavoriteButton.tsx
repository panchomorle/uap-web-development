'use client';

import { useState } from 'react';
import { addFavorite, removeFavorite, checkIsFavorite } from '../actions/favorites';
import { useEffect } from 'react';

interface FavoriteButtonProps {
  userId: string;
  bookId: string;
  bookData: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    }
  };
}

export default function FavoriteButton({ userId, bookId, bookData }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (userId) {
        try {
          console.log("[FavoriteButton] Checking favorite status for userId:", userId, "bookId:", bookId);
          const status = await checkIsFavorite(userId, bookId);
          setIsFavorite(status);
        } catch (err) {
          console.error("[FavoriteButton] Error checking favorite status:", err);
          setError("Error checking favorite status");
        }
      }
    };

    checkFavoriteStatus();
  }, [userId, bookId]);

  const handleToggleFavorite = async () => {
    if (!userId) {
      // Redirect to login or show login modal
      setError("Please login to add favorites");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("[FavoriteButton] Toggling favorite. Current state:", isFavorite);
      console.log("[FavoriteButton] User ID:", userId, "Book ID:", bookId);
      
      if (isFavorite) {
        const result = await removeFavorite(userId, bookId);
        console.log("[FavoriteButton] Remove result:", result);
        
        if (result.success) {
          setIsFavorite(false);
        } else {
          setError(result.message || "Error removing from favorites");
        }
      } else {
        // Extract only the needed data to avoid circular references
        const bookDataToSend = {
          userId,
          bookId,
          title: bookData.title,
          authors: bookData.authors || [],
          thumbnail: bookData.imageLinks?.thumbnail || ""
        };
        
        console.log("[FavoriteButton] Adding with data:", JSON.stringify(bookDataToSend));
        
        const result = await addFavorite(bookDataToSend);
        console.log("[FavoriteButton] Add result:", result);
        
        if (result.success) {
          setIsFavorite(true);
        } else {
          setError(result.message || "Error adding to favorites");
        }
      }
    } catch (error: any) {
      console.error('[FavoriteButton] Error toggling favorite status:', error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading || !userId}
        className={`inline-flex items-center px-4 py-2 rounded-md ${
          isFavorite 
            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } transition-colors ${!userId ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={!userId ? 'Please login to add favorites' : ''}
      >
        <svg
          className={`w-5 h-5 mr-2 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isFavorite 
              ? "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              : "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"}
          />
        </svg>
        {isLoading ? 'Processing...' : isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
}
