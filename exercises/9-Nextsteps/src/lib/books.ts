/**
 * Searches for books using Google Books API
 * 
 * @param query Search query
 * @param maxResults Maximum number of results to return (default: 10)
 * @param startIndex Starting index for pagination (default: 0)
 * @returns Search results object
 */
export async function searchBooks(query: string, maxResults = 10, startIndex = 0) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Error searching books: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Gets detailed information for a specific book
 * 
 * @param bookId Google Books volume ID
 * @returns Book details object
 */
export async function getBookDetails(bookId: string) {
  const url = `https://www.googleapis.com/books/v1/volumes/${bookId}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Error fetching book details: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data) {
    throw new Error('Book not found');
  }
  
  return data;
}

/**
 * Format the authors list for display
 * 
 * @param authors Array of author names
 * @returns Formatted author string
 */
export function formatAuthors(authors?: string[]) {
  if (!authors || authors.length === 0) {
    return 'Unknown Author';
  }
  
  if (authors.length === 1) {
    return authors[0];
  }
  
  return `${authors.slice(0, -1).join(', ')} and ${authors[authors.length - 1]}`;
}

/**
 * Get a safe thumbnail URL from a book's imageLinks
 * 
 * @param imageLinks Book's imageLinks object
 * @returns URL string or placeholder
 */
export function getThumbnail(imageLinks?: { thumbnail?: string; smallThumbnail?: string }) {
  if (!imageLinks) {
    return '/placeholder-book.png';
  }
  
  const thumbnailUrl = imageLinks.thumbnail || imageLinks.smallThumbnail;
  
  if (!thumbnailUrl) {
    return '/placeholder-book.png';
  }
  
  // Ensure HTTPS for image sources
  return thumbnailUrl.replace('http://', 'https://');
}
