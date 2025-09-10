'use client';

import { useAuth } from '../../components/AuthMiddleware';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserReviews } from '../../actions/reviews';
import { getUserFavorites } from '../../actions/favorites';
import Link from 'next/link';
import StarRating from '../../components/StarRating';
import Image from 'next/image';
import { useToast } from '../../components/Toast';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only check authentication status after initial loading is complete
    if (!loading) {
      if (!user) {
        console.log("[ProfilePage] No user found after loading, redirecting to login");
        // Delay the redirect slightly to prevent potential race conditions
        const timeoutId = setTimeout(() => {
          router.push('/login');
        }, 100);
        return () => clearTimeout(timeoutId);
      } else {
        console.log("[ProfilePage] User found:", user.username);
        // User is authenticated, fetch their data
        const fetchUserData = async () => {
          try {
            setIsLoading(true);
            console.log("[ProfilePage] Fetching user data for:", user.id);
            
            // Fetch user reviews and favorites in parallel for better performance
            const [reviewsResult, favoritesResult] = await Promise.allSettled([
              getUserReviews(user.id),
              getUserFavorites(user.id)
            ]);
            
            // Handle reviews result
            if (reviewsResult.status === 'fulfilled') {
              console.log("[ProfilePage] Successfully fetched reviews:", reviewsResult.value.length);
              setReviews(reviewsResult.value);
            } else {
              console.error("[ProfilePage] Error fetching reviews:", reviewsResult.reason);
              setReviews([]);
            }
            
            // Handle favorites result
            if (favoritesResult.status === 'fulfilled') {
              console.log("[ProfilePage] Successfully fetched favorites:", favoritesResult.value.length);
              setFavorites(favoritesResult.value);
            } else {
              console.error("[ProfilePage] Error fetching favorites:", favoritesResult.reason);
              setFavorites([]);
            }
          } catch (error) {
            console.error("[ProfilePage] Error in fetchUserData:", error);
            setReviews([]);
            setFavorites([]);
          } finally {
            setIsLoading(false);
          }
        };

        fetchUserData();
      }
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate average rating from user reviews
  const averageRating = reviews.length 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1) 
    : '0';

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Format date for display
  const formatDate = (dateInput: string | Date | undefined) => {
    if (!dateInput) return 'Unknown date';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {getInitials(user.username)}
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-2">Member since {new Date().toLocaleDateString()}</p>
            </div>
            <button 
              onClick={() => {
                showToast('Successfully logged out', 'success');
                logout();
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{reviews.length}</div>
            <div className="text-gray-600">Books Reviewed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{averageRating}</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{favorites.length}</div>
            <div className="text-gray-600">Favorite Books</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 text-center w-1/2 font-medium ${
                activeTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Reviews
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-3 text-center w-1/2 font-medium ${
                activeTab === 'favorites'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Favorites
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">
                            <Link href={`/book/${review.bookId}`} className="text-blue-600 hover:underline">
                              Book ID: {review.bookId}
                            </Link>
                          </h3>
                          <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                        </div>
                        <div className="mt-2 mb-3">
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <p className="text-gray-700">{review.content}</p>
                        <div className="mt-3 text-sm text-gray-500 flex space-x-4">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {review.upvotes} upvotes
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                            </svg>
                            {review.downvotes} downvotes
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600 mb-4">Start exploring books and sharing your thoughts!</p>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Browse Books
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => (
                      <Link 
                        href={`/book/${favorite.bookId}`} 
                        key={favorite._id} 
                        className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="h-40 relative bg-gray-200">
                          {favorite.thumbnail ? (
                            <Image
                              src={favorite.thumbnail.startsWith('http:') 
                                ? favorite.thumbnail.replace('http:', 'https:') 
                                : favorite.thumbnail}
                              alt={favorite.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{favorite.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {favorite.authors && favorite.authors.length > 0 
                              ? favorite.authors.join(', ')
                              : 'Unknown Author'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Added {formatDate(favorite.addedAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite books yet</h3>
                    <p className="text-gray-600 mb-4">Mark books as favorites to add them to your collection!</p>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Browse Books
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
