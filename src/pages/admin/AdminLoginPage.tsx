import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

export default function AdminLoginPage() {
  const { isAuthenticated, signIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const from = (location.state as { from?: string } | null)?.from
  const destination = from?.startsWith('/admin') && from !== '/admin/login' ? from : '/admin'

  if (isAuthenticated) return <Navigate to={destination} replace />

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (signIn(username.trim(), password)) {
      navigate(destination, { replace: true })
      return
    }
    setError('Usuario o contraseña incorrectos. Revisa las credenciales de demostración.')
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <span className="admin-brand-mark" aria-hidden="true">A</span>
        <p className="admin-eyebrow">EL ARRECIFE · ADMINISTRACIÓN</p>
        <h1 id="admin-login-title">Acceso al panel</h1>
        <p>Acceso local de demostración para revisar el panel administrativo.</p>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-username">Usuario</label>
          <input id="admin-username" name="username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} />
          <label htmlFor="admin-password">Contraseña</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="admin-login-error" role="alert">{error}</p>}
          <button className="admin-login-submit" type="submit">Entrar al panel</button>
        </form>
        <p className="admin-demo-hint">Credenciales de prueba: <strong>admin</strong> / <strong>arrecife2026</strong></p>
        <Link className="admin-login-back" to="/">Volver a la web pública</Link>
      </section>
    </main>
  )
}
