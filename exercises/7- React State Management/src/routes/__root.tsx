import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import BoardNav from '../components/BoardNav'

export const Route = createRootRoute({
  component: () => (
    <>
      <BoardNav />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})