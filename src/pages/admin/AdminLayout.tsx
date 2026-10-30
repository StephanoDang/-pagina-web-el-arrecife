import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

const sections = [
  { to: '/admin', label: 'Resumen', icon: 'R', end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: 'P' },
  { to: '/admin/reservas', label: 'Reservas', icon: 'A' },
  { to: '/admin/carta', label: 'Carta', icon: 'C' },
]

const sectionNames: Record<string, string> = {
  '/admin': 'Resumen',
  '/admin/pedidos': 'Pedidos',
  '/admin/reservas': 'Reservas',
  '/admin/carta': 'Carta',
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const currentSection = sectionNames[location.pathname] ?? 'Administración'

  function handleSignOut() {
    signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <Link className="admin-skip-link" to="#admin-main">Saltar al contenido</Link>
      <aside className="admin-sidebar" aria-label="Navegación administrativa">
        <Link className="admin-brand" to="/admin" aria-label="El Arrecife, panel administrativo">
          <span className="admin-brand-mark" aria-hidden="true">A</span>
          <span><strong>El Arrecife</strong><small>Panel administrativo</small></span>
        </Link>

        <p className="admin-nav-label">GESTIÓN</p>
        <nav className="admin-nav" aria-label="Secciones">
          {sections.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              end={section.end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
            >
              <span className="admin-nav-icon" aria-hidden="true">{section.icon}</span>
              {section.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <span className="admin-status-dot" aria-hidden="true" />
          <span>Entorno de demostración</span>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <p className="admin-breadcrumb">El Arrecife <span aria-hidden="true">/</span> Administración</p>
            <h1>{currentSection}</h1>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-topbar-badge">Vista previa</span>
            <button className="admin-logout-button" type="button" onClick={handleSignOut}>Cerrar sesión</button>
          </div>
        </header>
        <main className="admin-main" id="admin-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
