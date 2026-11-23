import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthContext'

export default function RequireAdmin() {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <main className="admin-login-page" aria-busy="true">Comprobando sesión…</main>

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
