// In-memory database for book management
// In a production app, this would be a real database like PostgreSQL, MongoDB, etc.

export interface Book {
  bookId: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  publisher?: string;
  publishedDate?: string;
  averageRating?: number;
}

export interface ReadingListItem {
  bookId: string;
  book: Book;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  addedAt: Date;
}

export interface ReadBookItem {
  bookId: string;
  book: Book;
  rating?: number; // 1-5 stars
  review?: string;
  dateFinished: Date;
}

export interface ReadingStats {
  totalBooksRead: number;
  totalPages: number;
  averageRating: number;
  favoriteGenres: { genre: string; count: number }[];
  favoriteAuthors: { author: string; count: number }[];
  booksPerMonth: { month: string; count: number }[];
  currentStreak: number; // días consecutivos leyendo
}

// In-memory storage (se pierde al reiniciar el servidor)
class InMemoryDatabase {
  private readingList: Map<string, ReadingListItem> = new Map();
  private readBooks: Map<string, ReadBookItem> = new Map();

  // Reading List Operations
  addToReadingList(bookId: string, book: Book, priority?: 'high' | 'medium' | 'low', notes?: string): ReadingListItem {
    // Check if already in reading list
    if (this.readingList.has(bookId)) {
      throw new Error('Este libro ya está en tu lista de lectura');
    }

    // Check if already read
    if (this.readBooks.has(bookId)) {
      throw new Error('Ya has leído este libro. Está en tu lista de libros leídos.');
    }

    const item: ReadingListItem = {
      bookId,
      book,
      priority: priority || 'medium',
      notes,
      addedAt: new Date(),
    };

    this.readingList.set(bookId, item);
    return item;
  }

  getReadingList(filter?: { priority?: 'high' | 'medium' | 'low' }, limit?: number): ReadingListItem[] {
    let items = Array.from(this.readingList.values());

    // Apply filter
    if (filter?.priority) {
      items = items.filter(item => item.priority === filter.priority);
    }

    // Sort by priority (high > medium > low) and then by date
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    items.sort((a, b) => {
      const priorityA = priorityOrder[a.priority || 'medium'];
      const priorityB = priorityOrder[b.priority || 'medium'];
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      return b.addedAt.getTime() - a.addedAt.getTime();
    });

    // Apply limit
    if (limit && limit > 0) {
      items = items.slice(0, limit);
    }

    return items;
  }

  removeFromReadingList(bookId: string): boolean {
    return this.readingList.delete(bookId);
  }

  // Read Books Operations
  markAsRead(
    bookId: string,
    book: Book,
    rating?: number,
    review?: string,
    dateFinished?: Date
  ): ReadBookItem {
    // Validate rating
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new Error('El rating debe estar entre 1 y 5 estrellas');
    }

    // Remove from reading list if present
    this.readingList.delete(bookId);

    // Check if already marked as read
    if (this.readBooks.has(bookId)) {
      // Update existing entry
      const existing = this.readBooks.get(bookId)!;
      existing.rating = rating;
      existing.review = review;
      existing.dateFinished = dateFinished || new Date();
      return existing;
    }

    const item: ReadBookItem = {
      bookId,
      book,
      rating,
      review,
      dateFinished: dateFinished || new Date(),
    };

    this.readBooks.set(bookId, item);
    return item;
  }

  getReadBooks(limit?: number): ReadBookItem[] {
    let items = Array.from(this.readBooks.values());
    
    // Sort by date finished (most recent first)
    items.sort((a, b) => b.dateFinished.getTime() - a.dateFinished.getTime());

    if (limit && limit > 0) {
      items = items.slice(0, limit);
    }

    return items;
  }

  // Statistics Operations
  getReadingStats(period: 'all-time' | 'year' | 'month' | 'week' = 'all-time'): ReadingStats {
    const now = new Date();
    let startDate = new Date(0); // Beginning of time

    // Calculate start date based on period
    if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    }

    // Filter books by period
    const booksInPeriod = Array.from(this.readBooks.values())
      .filter(item => item.dateFinished >= startDate);

    // Total books read
    const totalBooksRead = booksInPeriod.length;

    // Total pages
    const totalPages = booksInPeriod.reduce((sum, item) => {
      return sum + (item.book.pageCount || 0);
    }, 0);

    // Average rating
    const ratingsSum = booksInPeriod.reduce((sum, item) => {
      return sum + (item.rating || 0);
    }, 0);
    const ratedBooksCount = booksInPeriod.filter(item => item.rating).length;
    const averageRating = ratedBooksCount > 0 ? ratingsSum / ratedBooksCount : 0;

    // Favorite genres
    const genreCounts = new Map<string, number>();
    booksInPeriod.forEach(item => {
      item.book.categories?.forEach(category => {
        genreCounts.set(category, (genreCounts.get(category) || 0) + 1);
      });
    });
    const favoriteGenres = Array.from(genreCounts.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Favorite authors
    const authorCounts = new Map<string, number>();
    booksInPeriod.forEach(item => {
      item.book.authors?.forEach(author => {
        authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
      });
    });
    const favoriteAuthors = Array.from(authorCounts.entries())
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Books per month (last 12 months)
    const monthCounts = new Map<string, number>();
    const last12Months = new Date(now);
    last12Months.setMonth(now.getMonth() - 11);
    
    booksInPeriod
      .filter(item => item.dateFinished >= last12Months)
      .forEach(item => {
        const monthKey = item.dateFinished.toISOString().slice(0, 7); // YYYY-MM
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
      });
    
    const booksPerMonth = Array.from(monthCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Current streak (consecutive days reading)
    let currentStreak = 0;
    const allReadBooks = Array.from(this.readBooks.values())
      .sort((a, b) => b.dateFinished.getTime() - a.dateFinished.getTime());
    
    if (allReadBooks.length > 0) {
      const dates = allReadBooks.map(item => {
        const date = new Date(item.dateFinished);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });
      
      const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a);
      
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      let streak = 0;
      
      for (const timestamp of uniqueDates) {
        const dateToCheck = checkDate.getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        if (timestamp === dateToCheck || timestamp === dateToCheck - oneDayMs) {
          streak++;
          checkDate = new Date(timestamp - oneDayMs);
        } else {
          break;
        }
      }
      
      currentStreak = streak;
    }

    return {
      totalBooksRead,
      totalPages,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      favoriteGenres,
      favoriteAuthors,
      booksPerMonth,
      currentStreak,
    };
  }

  // Utility methods for debugging
  clear() {
    this.readingList.clear();
    this.readBooks.clear();
  }

  getAllData() {
    return {
      readingList: Array.from(this.readingList.values()),
      readBooks: Array.from(this.readBooks.values()),
    };
  }
}

// Export singleton instance
export const db = new InMemoryDatabase();
