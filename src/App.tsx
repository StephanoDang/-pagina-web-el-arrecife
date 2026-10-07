import { Link, Route, Routes } from 'react-router'
import { useState } from 'react'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import Header from './components/Header'
import MenuPage from './pages/MenuPage'
import MenuIcon from './components/MenuIcon'
import './App.css'

const mainContentId = 'contenido'

function PlaceholderPage({ title, description, home = false }: { title: string; description?: string; home?: boolean }) {
  return (
    <section className="placeholder">
      <div className="placeholder-symbol" aria-hidden="true"><MenuIcon name="bowl" /></div>
      <p className="placeholder-eyebrow">{home ? 'Cocina peruana · Maestro & Retablo' : 'El Arrecife de Mamafé'}</p>
      <h1>{title}</h1>
      <p className="placeholder-description">{description ?? 'Esta sección estará disponible pronto. Mientras tanto, descubre todo lo que tenemos en nuestra carta.'}</p>
      <Link className="site-primary-link" to="/carta">Explorar la carta<MenuIcon name="arrow" /></Link>
    </section>
  )
}

function App() {
  const [cartOpen, setCartOpen] = useState(false)
  return (
    <div className="site-shell">
      <a className="skip-link" href={`#${mainContentId}`}>Ir al contenido</a>
      <Header onOpenCart={() => setCartOpen(true)} cartOpen={cartOpen} />
      <main id={mainContentId} className="site-main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<PlaceholderPage title="El Arrecife" home description="Sabores del mar, tradición peruana y algo para cada antojo. Encuentra tu próximo favorito en nuestra carta." />} />
          <Route path="/carta" element={<MenuPage />} />
          <Route path="/pedidos" element={<PlaceholderPage title="Pedidos" />} />
          <Route path="/reservas" element={<PlaceholderPage title="Reservas" />} />
          <Route path="*" element={<PlaceholderPage title="Página no encontrada" description="No encontramos esta página. Revisa el enlace o vuelve a explorar nuestra carta." />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

export default App
