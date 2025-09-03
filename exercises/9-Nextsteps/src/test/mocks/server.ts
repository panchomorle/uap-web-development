import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { GoogleBooksResponse, GoogleBook } from '@/app/types'

// Mock data
export const mockBook: GoogleBook = {
  id: 'test-book-id',
  volumeInfo: {
    title: 'Test Book',
    authors: ['Test Author'],
    description: 'A test book description',
    imageLinks: {
      thumbnail: 'https://example.com/thumbnail.jpg',
      smallThumbnail: 'https://example.com/small-thumbnail.jpg',
    },
    publishedDate: '2023-01-01',
    pageCount: 300,
    categories: ['Fiction'],
    industryIdentifiers: [
      {
        type: 'ISBN_13',
        identifier: '9781234567890',
      },
    ],
    publisher: 'Test Publisher',
    language: 'en',
  },
}

export const mockBooksResponse: GoogleBooksResponse = {
  totalItems: 1,
  items: [mockBook],
}

export const handlers = [
  // Mock Google Books API search
  http.get('https://www.googleapis.com/books/v1/volumes', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    
    if (query === 'error') {
      return new HttpResponse(null, { status: 500 })
    }
    
    if (query === 'empty') {
      return HttpResponse.json({ totalItems: 0, items: [] })
    }
    
    return HttpResponse.json(mockBooksResponse)
  }),

  // Mock Google Books API get by ID
  http.get('https://www.googleapis.com/books/v1/volumes/:id', ({ params }) => {
    const { id } = params
    
    if (id === 'error') {
      return new HttpResponse(null, { status: 500 })
    }
    
    if (id === 'not-found') {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json({ ...mockBook, id: id as string })
  }),
]

export const server = setupServer(...handlers)
