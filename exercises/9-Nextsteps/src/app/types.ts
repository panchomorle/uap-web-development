// Types for the Google Books API and our application
export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    publisher?: string;
    language?: string;
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBook[];
  totalItems: number;
}

export interface Review {
  id: string;
  bookId: string;
  userName: string;
  rating: number;
  comment: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface BookWithReviews {
  book: GoogleBook;
  reviews: Review[];
  averageRating: number;
}
