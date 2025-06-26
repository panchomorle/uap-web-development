import { createFileRoute, Link } from '@tanstack/react-router'
import { useBoards } from '../hooks/useBoards'
import { useAuth } from '../hooks/useAuth';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { data: boards, isLoading } = useBoards();
  const firstBoardId = boards && boards.length > 0 ? boards[0].id : null;
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2efe8] to-white">
      <div className="w-full max-w-[900px] mx-auto px-4 py-12 flex flex-col items-center">
        {/* Encabezado */}
        <header className="text-center mb-12">
          <h1 className="text-[52px] font-bold text-[#333] mb-4">
            <span className="text-[#6b6b6b]">ToDo</span>
            <span className="text-[#e8994a]">List</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-[600px]">
            Organiza tus tareas de forma sencilla y efectiva con nuestra aplicación de gestión de tableros.
          </p>
        </header>

        {/* Características principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16">
          <FeatureCard 
            icon="📋" 
            title="Múltiples Tableros" 
            description="Organiza tus tareas en diferentes tableros según proyectos o áreas de tu vida."
          />
          <FeatureCard 
            icon="🔍" 
            title="Filtros Inteligentes" 
            description="Filtra tus tareas por estado: activas, completadas o todas."
          />
          <FeatureCard 
            icon="🔄" 
            title="Actualizaciones en Tiempo Real" 
            description="Tus cambios se sincronizan automáticamente para una experiencia fluida."
          />
        </div>

        {/* Sección CTA */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg p-8 w-full max-w-[800px] shadow-md mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl font-bold text-[#333] mb-3">¿Listo para organizarte?</h2>
              <p className="text-gray-700">
                Comienza a gestionar tus tareas hoy mismo y aumenta tu productividad.
              </p>
            </div>
            <div>
              {isLoading ? (
                <div className="w-8 h-8 border-t-2 border-e-2 border-[#e8994a] rounded-full animate-spin"></div>
              ) : (
                <Link
                  to={!isAuthenticated ? "/login" : firstBoardId ? `/board/$boardId` : '/'}
                  params={firstBoardId ? { boardId: firstBoardId } : {}}
                  className="bg-[#e8994a] text-white py-3 px-8 rounded-lg font-medium hover:bg-[#d78a45] transition duration-300 inline-block"
                >
                  {!isAuthenticated ? "Ingresar" : firstBoardId ? 'Ir a Mi Tablero' : 'Crear Tablero'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} TodoList - Una aplicación de gestión de tareas</p>
        </footer>
      </div>
    </div>
  )
}

// Componente de tarjeta de características
function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-[#333] mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}