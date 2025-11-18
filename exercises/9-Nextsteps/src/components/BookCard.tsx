import Image from 'next/image';
import Link from 'next/link';
import { Book } from '../lib/types';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const thumbnail = book.imageLinks?.thumbnail || book.imageLinks?.small;
  const authors = book.authors?.join(', ') || 'Unknown Author';
  
  return (
    <Link href={`/book/${book.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 h-full border">
        <div className="flex flex-col h-full">
          {/* Book cover */}
          <div className="flex-shrink-0 mb-4">
            {thumbnail ? (
              <div className="relative w-full h-48 mx-auto">
                <Image
                  src={thumbnail.replace('http:', 'https:')}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-contain rounded"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">No Image</span>
              </div>
            )}
          </div>
          
          {/* Book info */}
          <div className="flex-1 flex flex-col">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {book.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              by {authors}
            </p>
            
            {book.description && (
              <p className="text-xs text-gray-500 line-clamp-3 flex-1">
                {book.description.replace(/<[^>]*>/g, '')}
              </p>
            )}
            
            {/* Additional info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs text-gray-500">
                {book.publishedDate && (
                  <span>{new Date(book.publishedDate).getFullYear()}</span>
                )}
                {book.pageCount && (
                  <span>{book.pageCount} pages</span>
                )}
              </div>
              
              {book.categories && book.categories.length > 0 && (
                <div className="mt-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {book.categories[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
