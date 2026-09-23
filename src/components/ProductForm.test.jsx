import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const useCategoriasMock = vi.fn()
const useProveedoresMock = vi.fn()

vi.mock('../hooks/useCategorias.js', () => ({
  useCategorias: (...args) => useCategoriasMock(...args)
}))
vi.mock('../hooks/useProveedores.js', () => ({
  useProveedores: (...args) => useProveedoresMock(...args)
}))

const { default: ProductForm } = await import('./ProductForm.jsx')

beforeEach(() => {
  useCategoriasMock.mockReset()
  useProveedoresMock.mockReset()
  useCategoriasMock.mockReturnValue({ categorias: [{ id: 'c1', nombre: 'Bebidas' }] })
  useProveedoresMock.mockReturnValue({ proveedores: [{ id: 'p1', nombre: 'Distribuidora Sur' }] })
})

describe('ProductForm', () => {
  it('crear: carga los datos y llama a onSave', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<ProductForm onSave={onSave} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/código/i), 'A1')
    await user.type(screen.getByLabelText(/nombre/i), 'Yerba 1kg')
    await user.selectOptions(screen.getByLabelText(/categoría/i), 'c1')
    await user.type(screen.getByLabelText(/precio de venta/i), '3200')
    await user.type(screen.getByLabelText(/costo/i), '2000')
    await user.type(screen.getByLabelText(/stock mínimo/i), '5')
    await user.type(screen.getByLabelText(/cantidad inicial/i), '10')
    await user.click(screen.getByLabelText('Distribuidora Sur'))
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    expect(onSave).toHaveBeenCalledWith(
      {
        id: 'A1',
        nombre: 'Yerba 1kg',
        categoria_id: 'c1',
        precio_venta: 3200,
        costo: 2000,
        stock_minimo: 5
      },
      ['p1'],
      null,
      10
    )
  })

  it('editar: no muestra el campo de cantidad inicial (el stock se cambia con movimientos)', () => {
    render(
      <ProductForm
        producto={{ id: 'A1', nombre: 'Yerba 1kg', stock_minimo: 5 }}
        onSave={() => {}}
        onCancel={() => {}}
      />
    )
    expect(screen.queryByLabelText(/cantidad inicial/i)).not.toBeInTheDocument()
  })

  it('editar: precarga los datos existentes y el código no se puede editar', () => {
    render(
      <ProductForm
        producto={{
          id: 'A1',
          nombre: 'Yerba 1kg',
          categoria_id: 'c1',
          precio_venta: 3200,
          costo: 2000,
          stock_minimo: 5
        }}
        proveedoresSeleccionados={['p1']}
        onSave={() => {}}
        onCancel={() => {}}
      />
    )

    expect(screen.getByLabelText(/código/i)).toHaveValue('A1')
    expect(screen.getByLabelText(/código/i)).toBeDisabled()
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Yerba 1kg')
    expect(screen.getByLabelText('Distribuidora Sur')).toBeChecked()
  })

  it('cancelar llama a onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ProductForm onSave={() => {}} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onCancel).toHaveBeenCalled()
  })
})
