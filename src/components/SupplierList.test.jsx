import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const crear = vi.fn()
const actualizar = vi.fn()
const borrar = vi.fn()
const useProveedoresMock = vi.fn()

vi.mock('../hooks/useProveedores.js', () => ({
  useProveedores: (...args) => useProveedoresMock(...args)
}))

const { default: SupplierList } = await import('./SupplierList.jsx')

beforeEach(() => {
  crear.mockReset()
  actualizar.mockReset()
  borrar.mockReset()
  useProveedoresMock.mockReset()
  useProveedoresMock.mockReturnValue({
    proveedores: [{ id: '1', nombre: 'Distribuidora Sur', contacto: '', notas: '' }],
    loading: false,
    error: null,
    crear,
    actualizar,
    borrar
  })
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('SupplierList', () => {
  it('muestra los proveedores existentes', () => {
    render(<SupplierList />)
    expect(screen.getByText('Distribuidora Sur')).toBeInTheDocument()
  })

  it('al agregar un proveedor nuevo, llama a crear con los datos', async () => {
    const user = userEvent.setup()
    render(<SupplierList />)

    await user.click(screen.getByRole('button', { name: /agregar proveedor/i }))
    await user.type(screen.getByLabelText(/nombre/i), 'Distribuidora Norte')
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    expect(crear).toHaveBeenCalledWith({ nombre: 'Distribuidora Norte', contacto: '', notas: '' })
  })

  it('pide confirmacion en espanol simple antes de borrar', async () => {
    const user = userEvent.setup()
    render(<SupplierList />)

    await user.click(screen.getAllByRole('button', { name: /eliminar/i })[0])

    expect(window.confirm).toHaveBeenCalledWith('¿Seguro que querés eliminar Distribuidora Sur? No se puede deshacer.')
    expect(borrar).toHaveBeenCalledWith('1')
  })
})
