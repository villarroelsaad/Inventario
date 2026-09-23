import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const login = vi.fn()
const useAuthMock = vi.fn()

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: (...args) => useAuthMock(...args)
}))

const { default: Login } = await import('./Login.jsx')

beforeEach(() => {
  login.mockReset()
  useAuthMock.mockReset()
  useAuthMock.mockReturnValue({ login, error: null, loading: false })
})

describe('Login', () => {
  it('pide email y contraseña, y llama a login al enviar', async () => {
    const user = userEvent.setup()
    render(<Login />)

    await user.type(screen.getByLabelText(/usuario/i), 'a@a.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'clave123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(login).toHaveBeenCalledWith('a@a.com', 'clave123')
  })

  it('muestra el mensaje de error en español simple si el login falla', () => {
    useAuthMock.mockReturnValue({ login, error: 'Usuario o contraseña incorrectos', loading: false })
    render(<Login />)

    expect(screen.getByText('Usuario o contraseña incorrectos')).toBeInTheDocument()
  })

  it('no muestra nada tecnico en pantalla', () => {
    render(<Login />)
    expect(screen.queryByText(/token/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/api/i)).not.toBeInTheDocument()
  })
})
