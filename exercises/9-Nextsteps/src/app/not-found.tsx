import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h2>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn&apos;t find the book you&apos;re looking for.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Back to Search
        </Link>
      </div>
    </div>
  );
}
