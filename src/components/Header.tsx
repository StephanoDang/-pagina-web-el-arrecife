import { Link, NavLink } from 'react-router'
import { useCart } from '../hooks/useCart'
import MenuIcon from './MenuIcon'

const navigation = [
  { to: '/', label: 'Inicio' },
  { to: '/carta', label: 'Carta' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/reservas', label: 'Reservas' },
]

function Header({ onOpenCart, cartOpen }: { onOpenCart: () => void; cartOpen: boolean }) {
  const { items } = useCart()
  const quantity = items.reduce((count, item) => count + item.quantity, 0)
  return (
    <header className="site-header">
      <div className="site-container header-content">
        <Link className="wordmark" to="/" aria-label="El Arrecife, ir al inicio">
          <span className="wordmark-name">El Arrecife</span>
          <span className="wordmark-description">de Mamafé</span>
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
        <button type="button" className="cart-trigger" onClick={onOpenCart}
          aria-haspopup="dialog" aria-controls="cart-drawer" aria-expanded={cartOpen}>
          <MenuIcon name="bag" />Carrito
          {quantity > 0 && <span className="cart-trigger-count" aria-label={`${quantity} unidades`}>{quantity}</span>}
        </button>
      </div>
    </header>
  )
}

export default Header
