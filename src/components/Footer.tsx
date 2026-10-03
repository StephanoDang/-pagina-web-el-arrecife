import { Link } from 'react-router'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-content">
        <div>
          <Link className="footer-wordmark" to="/">El Arrecife</Link>
          <p>Sabores del mar y de la cocina peruana.</p>
          <Link className="footer-menu-link" to="/carta">Explorar la carta →</Link>
        </div>
        <div className="footer-locations" aria-label="Nuestras sedes">
          <p><strong>Maestro</strong><span>Av. El Maestro Peruano 570, Comas</span></p>
          <p><strong>Retablo</strong><span>Pasaje Garcilaso de la Vega 314, El Retablo, Comas</span></p>
        </div>
        <small>© {new Date().getFullYear()} El Arrecife</small>
      </div>
    </footer>
  )
}

export default Footer
