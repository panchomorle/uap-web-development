import { tool } from 'ai';
import { z } from 'zod';
import {
  addToReadingList,
  getReadingList,
  markAsRead,
  getReadingStats,
  type Book,
} from './db';

const GOOGLE_BOOKS_API = process.env.GOOGLE_BOOKS_API_KEY || 'https://www.googleapis.com/books/v1/volumes';

// Helper function to parse Google Books API response
const parseGoogleBook = (item: any): Book => {
  const volumeInfo = item.volumeInfo || {};
  return {
    bookId: item.id,
    title: volumeInfo.title || 'Unknown Title',
    authors: volumeInfo.authors,
    thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
    description: volumeInfo.description,
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories,
    publishedDate: volumeInfo.publishedDate,
    publisher: volumeInfo.publisher,
    averageRating: volumeInfo.averageRating,
    ratingsCount: volumeInfo.ratingsCount,
  };
};

// Tool 1: Search Books
export const searchBooksTool = tool({
  description: 'Search for books in Google Books API by title, author, subject, or keywords. Returns a list of books with basic information.',
  inputSchema: z.object({
    query: z.string().describe('Search query (title, author, subject, ISBN, etc.)'),
    maxResults: z.number().optional().describe('Maximum number of results to return (default: 10)'),
    orderBy: z.enum(['relevance', 'newest']).optional().describe('Order results by relevance or newest (default: relevance)'),
  }),
  execute: async ({ query, maxResults, orderBy }) => {
    const _maxResults = maxResults ?? 10;
    const _orderBy = orderBy ?? 'relevance';
    try {
      const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${_maxResults}&orderBy=${_orderBy}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return {
          success: true,
          books: [],
          message: 'No books found for your search query.',
        };
      }
      
      const books = data.items.map(parseGoogleBook);
      
      return {
        success: true,
        books,
        totalResults: data.totalItems,
        message: `Found ${books.length} book(s) for "${query}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        books: [],
      };
    }
  },
});

// Tool 2: Get Book Details
export const getBookDetailsTool = tool({
  description: 'Get detailed information about a specific book using its Google Books ID. Returns complete book data including description, page count, categories, ratings, etc.',
  inputSchema: z.object({
    bookId: z.string().describe('The Google Books ID of the book'),
  }),
  execute: async ({ bookId }) => {
    try {
      const url = `${GOOGLE_BOOKS_API}/${bookId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const book = parseGoogleBook(data);
      
      return {
        success: true,
        book,
        message: `Retrieved details for "${book.title}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        book: null,
      };
    }
  },
});

// Tool 3: Add to Reading List
export const addToReadingListTool = tool({
  description: 'Add a book to the user\'s "Want to Read" list. The book will be saved with optional priority and notes.',
  inputSchema: z.object({
    bookId: z.string().describe('The Google Books ID of the book to add'),
    priority: z.enum(['high', 'medium', 'low']).optional().describe('Priority level for reading this book'),
    notes: z.string().optional().describe('Personal notes about why the user wants to read this book'),
  }),
  execute: async ({ bookId, priority, notes }) => {
    try {
      // First, get the book details from Google Books
      const url = `${GOOGLE_BOOKS_API}/${bookId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Could not find book with ID: ${bookId}`);
      }
      
      const data = await response.json();
      const book = parseGoogleBook(data);
      
      // Add to reading list
      const item = addToReadingList({
        bookId,
        book,
        priority,
        notes,
      });
      
      return {
        success: true,
        item,
        message: `Added "${book.title}" to your reading list${priority ? ` with ${priority} priority` : ''}!`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// Tool 4: Get Reading List
export const getReadingListTool = tool({
  description: 'Retrieve the user\'s reading list (books they want to read). Can be filtered by priority and limited in size.',
  inputSchema: z.object({
    priority: z.enum(['high', 'medium', 'low']).optional().describe('Filter by priority level'),
    limit: z.number().optional().describe('Maximum number of books to return'),
  }),
  execute: async ({ priority, limit }) => {
    try {
      const list = getReadingList({ priority, limit });
      
      return {
        success: true,
        list,
        count: list.length,
        message: list.length > 0 
          ? `You have ${list.length} book(s) in your reading list${priority ? ` with ${priority} priority` : ''}`
          : 'Your reading list is empty',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        list: [],
      };
    }
  },
});

// Tool 5: Mark as Read
export const markAsReadTool = tool({
  description: 'Mark a book as read and optionally add a rating (1-5 stars) and review. The book will be removed from the reading list if present.',
  inputSchema: z.object({
    bookId: z.string().describe('The Google Books ID of the book'),
    rating: z.number().min(1).max(5).optional().describe('Rating from 1 to 5 stars'),
    review: z.string().optional().describe('Personal review or thoughts about the book'),
    dateFinished: z.string().optional().describe('Date when the book was finished (ISO format)'),
  }),
  execute: async ({ bookId, rating, review, dateFinished }) => {
    try {
      // Get book details from Google Books
      const url = `${GOOGLE_BOOKS_API}/${bookId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Could not find book with ID: ${bookId}`);
      }
      
      const data = await response.json();
      const book = parseGoogleBook(data);
      
      // Mark as read
      const readBook = markAsRead({
        bookId,
        book,
        rating,
        review,
        dateFinished: dateFinished ? new Date(dateFinished) : undefined,
      });
      
      return {
        success: true,
        readBook,
        message: `Marked "${book.title}" as read${rating ? ` with ${rating} stars` : ''}!`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// Tool 6: Get Reading Stats
export const getReadingStatsTool = tool({
  description: 'Generate statistics and analytics about the user\'s reading habits. Shows books read, pages read, favorite genres, favorite authors, rating averages, etc.',
  inputSchema: z.object({
    period: z.enum(['all-time', 'year', 'month', 'week']).optional().describe('Time period for statistics (default: all-time)'),
    groupBy: z.enum(['genre', 'author', 'year']).optional().describe('How to group the statistics'),
  }),
  execute: async ({ period, groupBy }) => {
    const _period = period ?? 'all-time';
    try {
      const stats = getReadingStats({ period: _period, groupBy });
      
      let breakdown = {};
      if (groupBy === 'genre') {
        breakdown = stats.genreBreakdown;
      } else if (groupBy === 'author') {
        breakdown = stats.authorBreakdown;
      } else if (groupBy === 'year') {
        breakdown = stats.yearBreakdown;
      }
      
      return {
        success: true,
        stats: {
          totalBooksRead: stats.totalBooksRead,
          totalPages: stats.totalPages,
          averageRating: Math.round(stats.averageRating * 10) / 10,
          booksInReadingList: stats.booksInReadingList,
          favoriteGenre: stats.favoriteGenre,
          favoriteAuthor: stats.favoriteAuthor,
          breakdown: groupBy ? breakdown : undefined,
          ratingDistribution: stats.ratingDistribution,
        },
        message: `Statistics for ${_period}: ${stats.totalBooksRead} book(s) read, ${stats.totalPages} pages`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// Export all tools
export const tools = {
  searchBooks: searchBooksTool,
  getBookDetails: getBookDetailsTool,
  addToReadingList: addToReadingListTool,
  getReadingList: getReadingListTool,
  markAsRead: markAsReadTool,
  getReadingStats: getReadingStatsTool,
};
