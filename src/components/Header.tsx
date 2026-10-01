import { Link, NavLink } from 'react-router'

const navigation = [
  { to: '/', label: 'Inicio' },
  { to: '/carta', label: 'Carta' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/reservas', label: 'Reservas' },
]

function Header() {
  return (
    <header className="site-header">
      <div className="site-container header-content">
        <Link className="wordmark" to="/" aria-label="El Arrecife, ir al inicio">
          El Arrecife
        </Link>
        <nav aria-label="Navegación principal">
          <ul className="nav-list">
            {navigation.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
