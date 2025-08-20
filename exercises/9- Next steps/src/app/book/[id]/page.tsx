import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBookById, getBookReviews, getBookAverageRating } from '../../../lib/actions';
import StarRating from '../../../components/StarRating';
import ReviewForm from '../../../components/ReviewForm';
import ReviewList from '../../../components/ReviewList';

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const bookParams = await params;
  const bookId = bookParams.id;
  if (!bookId) {
    notFound();
  }
  const book = await getBookById(bookId);

  if (!book) {
    notFound();
  }

  const reviews = await getBookReviews(bookId);
  const averageRating = await getBookAverageRating(bookId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Search
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                  {book.imageLinks?.thumbnail ? (
                    <Image
                      src={book.imageLinks.thumbnail.replace('http:', 'https:')}
                      alt={book.title}
                      width={200}
                      height={300}
                      className="rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-[200px] h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {book.title}
                  </h1>
                  
                  {book.authors && (
                    <p className="text-lg text-gray-700 mb-4">
                      by {book.authors.join(', ')}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-4">
                    <StarRating rating={averageRating} />
                    <span className="text-sm text-gray-600">
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>

                  {/* Book Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {book.publishedDate && (
                      <div>
                        <span className="font-medium text-gray-700">Published:</span>
                        <span className="ml-2 text-gray-600">{book.publishedDate}</span>
                      </div>
                    )}
                    
                    {book.pageCount && (
                      <div>
                        <span className="font-medium text-gray-700">Pages:</span>
                        <span className="ml-2 text-gray-600">{book.pageCount}</span>
                      </div>
                    )}
                    
                    {book.publisher && (
                      <div>
                        <span className="font-medium text-gray-700">Publisher:</span>
                        <span className="ml-2 text-gray-600">{book.publisher}</span>
                      </div>
                    )}
                    
                    {book.language && (
                      <div>
                        <span className="font-medium text-gray-700">Language:</span>
                        <span className="ml-2 text-gray-600">{book.language}</span>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  {book.categories && book.categories.length > 0 && (
                    <div className="mb-6">
                      <span className="font-medium text-gray-700">Categories:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {book.categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {book.description && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                      <div 
                        className="text-gray-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: book.description }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Add Review Form */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Write a Review
                </h3>
                <ReviewForm bookId={bookId} />
              </div>

              {/* Reviews List */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Reviews ({reviews.length})
                </h3>
                <ReviewList reviews={reviews} bookId={bookId} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
