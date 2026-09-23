import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'

export default function Login () {
  const { login, error, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)

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
      <h1>Registro</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">Usuario</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading || enviando}>
          Entrar
        </button>
      </form>
    </main>
  )
}
