import { describe, it, expect, vi, beforeEach } from 'vitest'

const signInWithPassword = vi.fn()
const signOut = vi.fn()
const getSession = vi.fn()
const onAuthStateChange = vi.fn()

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args) => signInWithPassword(...args),
      signOut: (...args) => signOut(...args),
      getSession: (...args) => getSession(...args),
      onAuthStateChange: (...args) => onAuthStateChange(...args)
    }
  }
}))

const { signIn, logOut, getCurrentSession, onAuthChange } = await import('./auth.js')

beforeEach(() => {
  signInWithPassword.mockReset()
  signOut.mockReset()
  getSession.mockReset()
  onAuthStateChange.mockReset()
})

describe('signIn', () => {
  it('devuelve la sesion cuando el login es correcto', async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: { user: { email: 'a@a.com' } } },
      error: null
    })

    const session = await signIn('a@a.com', 'clave123')

    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'a@a.com', password: 'clave123' })
    expect(session.user.email).toBe('a@a.com')
  })

  it('lanza un error en espanol simple cuando el login falla', async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' }
    })

    await expect(signIn('a@a.com', 'mala')).rejects.toThrow('Usuario o contraseña incorrectos')
  })

  it('el mensaje de error no distingue la causa (evita filtrar si el email existe/está confirmado)', async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Email not confirmed' }
    })

    await expect(signIn('a@a.com', 'clave123')).rejects.toThrow('Usuario o contraseña incorrectos')
  })
})

describe('logOut', () => {
  it('cierra la sesion', async () => {
    signOut.mockResolvedValue({ error: null })
    await logOut()
    expect(signOut).toHaveBeenCalled()
  })
})

describe('getCurrentSession', () => {
  it('devuelve la sesion actual si existe', async () => {
    getSession.mockResolvedValue({ data: { session: { user: { email: 'a@a.com' } } } })
    const session = await getCurrentSession()
    expect(session.user.email).toBe('a@a.com')
  })

  it('devuelve null si no hay sesion', async () => {
    getSession.mockResolvedValue({ data: { session: null } })
    const session = await getCurrentSession()
    expect(session).toBeNull()
  })
})

describe('onAuthChange', () => {
  it('se suscribe a los cambios de sesion de supabase', () => {
    const callback = vi.fn()
    onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

    onAuthChange(callback)

    expect(onAuthStateChange).toHaveBeenCalled()
  })
})
