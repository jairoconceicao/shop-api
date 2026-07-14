import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { isAuthSessionExpired, useAuthStore } from '../store/authStore'

export function ProtectedRoute() {
  const session = useAuthStore((state) => state.session)
  const location = useLocation()

  if (!session || isAuthSessionExpired(session)) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`

    return <Navigate replace state={{ returnTo }} to="/entrar" />
  }

  return <Outlet />
}
