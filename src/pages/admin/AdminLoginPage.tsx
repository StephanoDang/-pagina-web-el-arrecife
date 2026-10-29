import { Link } from 'react-router'
import './AdminLayout.css'

export default function AdminLoginPage() {
  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <span className="admin-brand-mark" aria-hidden="true">A</span>
        <p className="admin-eyebrow">EL ARRECIFE · ADMINISTRACIÓN</p>
        <h1 id="admin-login-title">Acceso al panel</h1>
        <p>El panel está protegido. El inicio de sesión de demostración se implementará en el siguiente paso.</p>
        <Link className="admin-login-back" to="/">Volver a la web pública</Link>
      </section>
    </main>
  )
}
