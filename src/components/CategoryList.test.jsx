import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const crear = vi.fn()
const actualizar = vi.fn()
const borrar = vi.fn()
const useCategoriasMock = vi.fn()

vi.mock('../hooks/useCategorias.js', () => ({
  useCategorias: (...args) => useCategoriasMock(...args)
}))
const avisar = vi.fn()
vi.mock('../lib/avisos.js', () => ({ avisar: (...args) => avisar(...args) }))

const { default: CategoryList } = await import('./CategoryList.jsx')

beforeEach(() => {
  crear.mockReset()
  actualizar.mockReset()
  borrar.mockReset()
  useCategoriasMock.mockReset()
  useCategoriasMock.mockReturnValue({
    categorias: [{ id: '1', nombre: 'Bebidas' }, { id: '2', nombre: 'Limpieza' }],
    loading: false,
    error: null,
    crear,
    actualizar,
    borrar
  })
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('CategoryList', () => {
  it('muestra las categorias existentes', () => {
    render(<CategoryList />)
    expect(screen.getByText('Bebidas')).toBeInTheDocument()
    expect(screen.getByText('Limpieza')).toBeInTheDocument()
  })

  it('al agregar una categoria nueva, llama a crear con el nombre', async () => {
    const user = userEvent.setup()
    render(<CategoryList />)

    await user.click(screen.getByRole('button', { name: /agregar categoría/i }))
    await user.type(screen.getByLabelText(/nombre/i), 'Almacén')
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    expect(crear).toHaveBeenCalledWith('Almacén')
    expect(avisar).toHaveBeenCalledWith('Categoría guardada')
  })

  it('pide confirmacion en espanol simple antes de borrar', async () => {
    const user = userEvent.setup()
    render(<CategoryList />)

    await user.click(screen.getAllByRole('button', { name: /eliminar/i })[0])

    expect(window.confirm).toHaveBeenCalledWith('¿Seguro que querés eliminar Bebidas? No se puede deshacer.')
    expect(borrar).toHaveBeenCalledWith('1')
  })
})
