import SearchBooks from '../components/SearchBooks'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Descubre y Reseña Libros
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Busca libros, lee detalles y comparte tus reseñas con la comunidad
          </p>
        </div>
        
        <SearchBooks />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500">
          <p>Powered by Google Books API</p>
        </div>
      </footer>
    </div>
  )
}
