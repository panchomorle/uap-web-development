import SearchBooks from '../components/SearchBooks'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📚 LIBROS FACHERARDOS
          </h1>
          <p className="text-gray-600">
            Busca libros, lee detalles y comparte tus reseñas con la comunidad
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <SearchBooks />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500">
          <p>Powered by Google Books API</p>
        </div>
      </footer>
    </div>
  )
}
