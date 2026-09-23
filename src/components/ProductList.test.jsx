import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const setFiltros = vi.fn()
const useProductosMock = vi.fn()
const useCategoriasMock = vi.fn()
const useProveedoresMock = vi.fn()

vi.mock('../hooks/useProductos.js', () => ({
  useProductos: (...args) => useProductosMock(...args)
}))
vi.mock('../hooks/useCategorias.js', () => ({
  useCategorias: (...args) => useCategoriasMock(...args)
}))
vi.mock('../hooks/useProveedores.js', () => ({
  useProveedores: (...args) => useProveedoresMock(...args)
}))

const { default: ProductList } = await import('./ProductList.jsx')

const productos = [
  { id: 'A1', nombre: 'Yerba', stock: 24, stock_minimo: 5, precio_venta: 3200 },
  { id: 'A2', nombre: 'Aceite', stock: 2, stock_minimo: 5, precio_venta: 4100 }
]

beforeEach(() => {
  setFiltros.mockReset()
  useProductosMock.mockReset()
  useCategoriasMock.mockReset()
  useProveedoresMock.mockReset()
  useProductosMock.mockReturnValue({ productos, filtros: {}, setFiltros, loading: false, error: null })
  useCategoriasMock.mockReturnValue({ categorias: [{ id: 'c1', nombre: 'Bebidas' }] })
  useProveedoresMock.mockReturnValue({ proveedores: [{ id: 'p1', nombre: 'Distribuidora Sur' }] })
})

describe('ProductList', () => {
  it('muestra los productos con su stock', () => {
    render(<ProductList onSelect={() => {}} onAdd={() => {}} />)
    expect(screen.getByText('Yerba')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('Aceite')).toBeInTheDocument()
  })

  it('muestra el banner de alerta cuando hay stock bajo', () => {
    render(<ProductList onSelect={() => {}} onAdd={() => {}} />)
    expect(screen.getByText(/stock bajo/i)).toBeInTheDocument()
  })

  it('no muestra el banner si ningun producto esta bajo de stock', () => {
    useProductosMock.mockReturnValue({
      productos: [{ id: 'A1', nombre: 'Yerba', stock: 24, stock_minimo: 5, precio_venta: 3200 }],
      filtros: {},
      setFiltros,
      loading: false,
      error: null
    })
    render(<ProductList onSelect={() => {}} onAdd={() => {}} />)
    expect(screen.queryByText(/stock bajo/i)).not.toBeInTheDocument()
  })

  it('escribir en el buscador actualiza los filtros', async () => {
    const user = userEvent.setup()
    render(<ProductList onSelect={() => {}} onAdd={() => {}} />)

    await user.type(screen.getByLabelText(/buscar/i), 'y')

    expect(setFiltros).toHaveBeenCalled()
  })

  it('tocar un producto llama a onSelect con ese producto', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<ProductList onSelect={onSelect} onAdd={() => {}} />)

    await user.click(screen.getByText('Yerba'))

    expect(onSelect).toHaveBeenCalledWith(productos[0])
  })

  it('tocar agregar producto llama a onAdd', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<ProductList onSelect={() => {}} onAdd={onAdd} />)

    await user.click(screen.getByRole('button', { name: /agregar producto/i }))

    expect(onAdd).toHaveBeenCalled()
  })
})
