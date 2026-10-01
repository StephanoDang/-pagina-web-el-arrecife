import { Link } from 'react-router'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-content">
        <div>
          <Link className="footer-wordmark" to="/">El Arrecife</Link>
          <p>Carta digital en preparación.</p>
        </div>
        <small>© {new Date().getFullYear()} El Arrecife</small>
      </div>
    </footer>
  )
}

export default Footer
