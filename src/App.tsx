import { Route, Routes } from 'react-router'
import Footer from './components/Footer'
import Header from './components/Header'
import MenuPage from './pages/MenuPage'
import './App.css'

const mainContentId = 'contenido'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="placeholder">
      <h1>{title}</h1>
      <p>Sitio web en construcción.</p>
    </section>
  )
}

function App() {
  return (
    <div className="site-shell">
      <a className="skip-link" href={`#${mainContentId}`}>Ir al contenido</a>
      <Header />
      <main id={mainContentId} className="site-main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<PlaceholderPage title="El Arrecife" />} />
          <Route path="/carta" element={<MenuPage />} />
          <Route path="/pedidos" element={<PlaceholderPage title="Pedidos" />} />
          <Route path="/reservas" element={<PlaceholderPage title="Reservas" />} />
          <Route path="*" element={<PlaceholderPage title="Página no encontrada" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
