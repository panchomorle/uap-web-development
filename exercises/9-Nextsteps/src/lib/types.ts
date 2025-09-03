export interface Book {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
  previewLink?: string;
  infoLink?: string;
  language?: string;
  publisher?: string;
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: Array<{
    id: string;
    volumeInfo: Book;
  }>;
}

export interface Review {
  id: string; // MongoDB ObjectId as string
  bookId: string;
  rating: number;
  content: string;
  userId: string; // Reference to User
  date: string;
  upvotes: number;
  downvotes: number;
}
