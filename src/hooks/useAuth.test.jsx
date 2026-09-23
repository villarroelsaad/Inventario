import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const signIn = vi.fn()
const logOut = vi.fn()
const getCurrentSession = vi.fn()
const onAuthChange = vi.fn()

vi.mock('../services/auth.js', () => ({
  signIn: (...args) => signIn(...args),
  logOut: (...args) => logOut(...args),
  getCurrentSession: (...args) => getCurrentSession(...args),
  onAuthChange: (...args) => onAuthChange(...args)
}))

const { useAuth } = await import('./useAuth.js')

beforeEach(() => {
  signIn.mockReset()
  logOut.mockReset()
  getCurrentSession.mockReset()
  onAuthChange.mockReset()
  onAuthChange.mockReturnValue(() => {})
  getCurrentSession.mockResolvedValue(null)
})

describe('useAuth', () => {
  it('arranca con loading y sin usuario, y termina sin usuario si no hay sesion', async () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('carga el usuario si ya hay sesion activa', async () => {
    getCurrentSession.mockResolvedValue({ user: { email: 'a@a.com' } })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user.email).toBe('a@a.com')
  })

  it('login exitoso actualiza el usuario', async () => {
    signIn.mockResolvedValue({ user: { email: 'a@a.com' } })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login('a@a.com', 'clave123')
    })

    expect(signIn).toHaveBeenCalledWith('a@a.com', 'clave123')
    expect(result.current.user.email).toBe('a@a.com')
    expect(result.current.error).toBeNull()
  })

  it('login fallido guarda el mensaje de error y no setea usuario', async () => {
    signIn.mockRejectedValue(new Error('Usuario o contraseña incorrectos'))
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login('a@a.com', 'mala').catch(() => {})
    })

    expect(result.current.user).toBeNull()
    expect(result.current.error).toBe('Usuario o contraseña incorrectos')
  })

  it('logout limpia el usuario', async () => {
    getCurrentSession.mockResolvedValue({ user: { email: 'a@a.com' } })
    logOut.mockResolvedValue(undefined)
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.logout()
    })

    expect(logOut).toHaveBeenCalled()
    expect(result.current.user).toBeNull()
  })
})
