import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'

export default function Login () {
  const { login, error, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mostrarClave, setMostrarClave] = useState(false)

  async function handleSubmit (event) {
    event.preventDefault()
    setEnviando(true)
    try {
      await login(email, password)
    } catch {
      // el mensaje de error ya queda disponible en useAuth().error
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="login">
      <div className="login-icono">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5" /></svg>
      </div>

      <h1>Ingresar</h1>
      <p className="login-subtitulo">Accedé para gestionar el stock del negocio.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">Usuario</label>
        <div className="login-input-wrap">
          <svg className="login-input-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <label htmlFor="login-password">Contraseña</label>
        <div className="login-input-wrap">
          <svg className="login-input-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          <input
            id="login-password"
            type={mostrarClave ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="login-toggle-clave"
            onClick={() => setMostrarClave((actual) => !actual)}
            aria-label={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {mostrarClave
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="M2 2l20 20" /></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></svg>}
          </button>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading || enviando}>
          Entrar
        </button>
      </form>
    </main>
  )
}
