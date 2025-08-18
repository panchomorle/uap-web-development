'use server'

import { GoogleBooksResponse, GoogleBook, Review } from './types'

export async function searchBooks(query: string): Promise<GoogleBooksResponse> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch books')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error searching books:', error)
    return { totalItems: 0, items: [] }
  }
}

export async function getBookById(id: string): Promise<GoogleBook | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${id}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch book')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching book:', error)
    return null
  }
}