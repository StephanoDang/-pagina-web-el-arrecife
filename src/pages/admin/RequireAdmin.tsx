import { Navigate, Outlet, useLocation } from 'react-router'
import { hasAdminSession } from './adminSession'

export default function RequireAdmin() {
  const location = useLocation()

  if (!hasAdminSession()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
