import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

export default function AdminLoginPage() {
  const { isAuthenticated, isLoading, signIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const from = (location.state as { from?: string } | null)?.from
  const destination = from?.startsWith('/admin') && from !== '/admin/login' ? from : '/admin'

  if (isAuthenticated) return <Navigate to={destination} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const result = await signIn(email.trim(), password)
    if (result === 'signed-in') {
      navigate(destination, { replace: true })
      return
    }
    if (result === 'unconfigured') setError('El acceso administrativo no está configurado. Contacta al responsable del sistema.')
    else if (result === 'not-admin') setError('Esta cuenta no tiene permisos de administración.')
    else if (result === 'invalid') setError('Correo o contraseña incorrectos.')
    else setError('No fue posible iniciar sesión. Inténtalo de nuevo.')
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <span className="admin-brand-mark" aria-hidden="true">A</span>
        <p className="admin-eyebrow">EL ARRECIFE · ADMINISTRACIÓN</p>
        <h1 id="admin-login-title">Acceso al panel</h1>
        <p>Ingresa con la cuenta autorizada por el administrador del sistema.</p>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Correo electrónico</label>
          <input id="admin-email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="admin-password">Contraseña</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="admin-login-error" role="alert">{error}</p>}
          <button className="admin-login-submit" type="submit" disabled={isLoading}>{isLoading ? 'Comprobando sesión…' : 'Entrar al panel'}</button>
        </form>
        <Link className="admin-login-back" to="/">Volver a la web pública</Link>
      </section>
    </main>
  )
}
