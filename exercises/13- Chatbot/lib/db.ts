// In-memory database for storing reading lists and statistics

export interface Book {
  bookId: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  publishedDate?: string;
  publisher?: string;
  averageRating?: number;
  ratingsCount?: number;
}

export interface ReadingListItem {
  bookId: string;
  book: Book;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  dateAdded: Date;
}

export interface ReadBook {
  bookId: string;
  book: Book;
  rating?: number;
  review?: string;
  dateFinished: Date;
}

// In-memory storage
const readingList: ReadingListItem[] = [];
const booksRead: ReadBook[] = [];

// Reading List operations
export const addToReadingList = (item: Omit<ReadingListItem, 'dateAdded'>): ReadingListItem => {
  // Check if book already exists in reading list
  const existingIndex = readingList.findIndex(i => i.bookId === item.bookId);
  
  if (existingIndex !== -1) {
    // Update existing item
    readingList[existingIndex] = {
      ...item,
      dateAdded: readingList[existingIndex].dateAdded
    };
    return readingList[existingIndex];
  }
  
  // Add new item
  const newItem: ReadingListItem = {
    ...item,
    dateAdded: new Date()
  };
  readingList.push(newItem);
  return newItem;
};

export const getReadingList = (filter?: {
  priority?: 'high' | 'medium' | 'low';
  limit?: number;
}): ReadingListItem[] => {
  let list = [...readingList];
  
  if (filter?.priority) {
    list = list.filter(item => item.priority === filter.priority);
  }
  
  // Sort by date added (newest first)
  list.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
  
  if (filter?.limit) {
    list = list.slice(0, filter.limit);
  }
  
  return list;
};

export const removeFromReadingList = (bookId: string): boolean => {
  const index = readingList.findIndex(item => item.bookId === bookId);
  if (index !== -1) {
    readingList.splice(index, 1);
    return true;
  }
  return false;
};

// Books Read operations
export const markAsRead = (item: Omit<ReadBook, 'dateFinished'> & { dateFinished?: Date }): ReadBook => {
  // Remove from reading list if present
  removeFromReadingList(item.bookId);
  
  // Check if already marked as read
  const existingIndex = booksRead.findIndex(b => b.bookId === item.bookId);
  
  const readBook: ReadBook = {
    ...item,
    dateFinished: item.dateFinished || new Date()
  };
  
  if (existingIndex !== -1) {
    booksRead[existingIndex] = readBook;
  } else {
    booksRead.push(readBook);
  }
  
  return readBook;
};

export const getBooksRead = (filter?: {
  period?: 'all-time' | 'year' | 'month' | 'week';
}): ReadBook[] => {
  let books = [...booksRead];
  
  if (filter?.period && filter.period !== 'all-time') {
    const now = new Date();
    let startDate = new Date();
    
    switch (filter.period) {
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
    }
    
    books = books.filter(book => book.dateFinished >= startDate);
  }
  
  return books.sort((a, b) => b.dateFinished.getTime() - a.dateFinished.getTime());
};

// Statistics
export const getReadingStats = (options?: {
  period?: 'all-time' | 'year' | 'month' | 'week';
  groupBy?: 'genre' | 'author' | 'year';
}) => {
  const books = getBooksRead({ period: options?.period });
  
  const stats = {
    totalBooksRead: books.length,
    totalPages: books.reduce((sum, book) => sum + (book.book.pageCount || 0), 0),
    averageRating: books.filter(b => b.rating).length > 0
      ? books.reduce((sum, book) => sum + (book.rating || 0), 0) / books.filter(b => b.rating).length
      : 0,
    booksInReadingList: readingList.length,
    genreBreakdown: {} as Record<string, number>,
    authorBreakdown: {} as Record<string, number>,
    yearBreakdown: {} as Record<string, number>,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
  };
  
  // Calculate breakdowns
  books.forEach(book => {
    // Genre breakdown
    if (book.book.categories) {
      book.book.categories.forEach(category => {
        stats.genreBreakdown[category] = (stats.genreBreakdown[category] || 0) + 1;
      });
    }
    
    // Author breakdown
    if (book.book.authors) {
      book.book.authors.forEach(author => {
        stats.authorBreakdown[author] = (stats.authorBreakdown[author] || 0) + 1;
      });
    }
    
    // Year breakdown
    if (book.book.publishedDate) {
      const year = book.book.publishedDate.split('-')[0];
      stats.yearBreakdown[year] = (stats.yearBreakdown[year] || 0) + 1;
    }
    
    // Rating distribution
    if (book.rating) {
      stats.ratingDistribution[book.rating]++;
    }
  });
  
  // Find favorites
  const favoriteGenre = Object.entries(stats.genreBreakdown)
    .sort(([, a], [, b]) => b - a)[0];
  const favoriteAuthor = Object.entries(stats.authorBreakdown)
    .sort(([, a], [, b]) => b - a)[0];
  
  return {
    ...stats,
    favoriteGenre: favoriteGenre ? { name: favoriteGenre[0], count: favoriteGenre[1] } : null,
    favoriteAuthor: favoriteAuthor ? { name: favoriteAuthor[0], count: favoriteAuthor[1] } : null,
  };
};
