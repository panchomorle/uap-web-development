import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getBookById, getReviewsForBook } from '../../actions'
import ReviewsList from '../../components/ReviewsList'
import AddReviewForm from '../../components/AddReviewForm'

interface BookPageProps {
  params: {
    id: string
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const book = await getBookById(params.id)
  
  if (!book) {
    notFound()
  }
  
  const reviews = await getReviewsForBook(params.id)
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  const { volumeInfo } = book
  const thumbnail = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail
  const authors = volumeInfo.authors?.join(', ') || 'Autor desconocido'
  const publishedDate = volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).toLocaleDateString('es-ES') : null
  const isbn = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Volver a la búsqueda
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Book cover */}
            <div className="lg:col-span-1">
              {thumbnail ? (
                <div className="relative w-full h-96 mx-auto">
                  <Image
                    src={thumbnail.replace('http:', 'https:')}
                    alt={volumeInfo.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Sin imagen disponible</span>
                </div>
              )}
            </div>

            {/* Book details */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {volumeInfo.title}
              </h1>
              
              <p className="text-xl text-gray-700 mb-4">
                Por {authors}
              </p>

              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= averageRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-gray-600">
                      {averageRating.toFixed(1)} ({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
              )}

              {/* Book info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {publishedDate && (
                  <div>
                    <span className="font-semibold text-gray-700">Fecha de publicación:</span>
                    <p className="text-gray-600">{publishedDate}</p>
                  </div>
                )}
                
                {volumeInfo.publisher && (
                  <div>
                    <span className="font-semibold text-gray-700">Editorial:</span>
                    <p className="text-gray-600">{volumeInfo.publisher}</p>
                  </div>
                )}
                
                {volumeInfo.pageCount && (
                  <div>
                    <span className="font-semibold text-gray-700">Páginas:</span>
                    <p className="text-gray-600">{volumeInfo.pageCount}</p>
                  </div>
                )}
                
                {isbn && (
                  <div>
                    <span className="font-semibold text-gray-700">ISBN:</span>
                    <p className="text-gray-600">{isbn}</p>
                  </div>
                )}
              </div>

              {/* Categories */}
              {volumeInfo.categories && volumeInfo.categories.length > 0 && (
                <div className="mb-6">
                  <span className="font-semibold text-gray-700">Categorías:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {volumeInfo.categories.map((category, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {volumeInfo.description && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Descripción:</h3>
                  <div 
                    className="text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: volumeInfo.description }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add review form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Escribir una reseña</h2>
            <AddReviewForm bookId={params.id} />
          </div>

          {/* Reviews list */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Reseñas ({reviews.length})
            </h2>
            <ReviewsList bookId={params.id} initialReviews={reviews} />
          </div>
        </div>
      </div>
    </div>
  )
}
