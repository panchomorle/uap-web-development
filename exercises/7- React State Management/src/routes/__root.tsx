import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import BoardNav from '../components/BoardNav'
import NotificationsContainer from '../components/NotificationsContainer'
import Spinner from '../components/Spinner'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

// Componente que maneja la autenticación y renderiza el layout
function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificar si necesitamos redirigir a login
    const currentPath = router.state.location.pathname;
    const publicRoutes = ['/login', '/register', '/'];
    
    if (!isLoading && !isAuthenticated && !publicRoutes.includes(currentPath)) {
      router.navigate({
        to: '/login',
        search: {
          redirect: currentPath,
        },
      });
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar spinner mientras carga la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <BoardNav />
      <NotificationsContainer />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
})