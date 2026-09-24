import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const setFiltros = vi.fn()
const useProductosMock = vi.fn()
const useCategoriasMock = vi.fn()
const useProveedoresMock = vi.fn()
const generarCsvProductos = vi.fn()
const descargarCsv = vi.fn()

vi.mock('../hooks/useProductos.js', () => ({
  useProductos: (...args) => useProductosMock(...args)
}))
vi.mock('../hooks/useCategorias.js', () => ({
  useCategorias: (...args) => useCategoriasMock(...args)
}))
vi.mock('../hooks/useProveedores.js', () => ({
  useProveedores: (...args) => useProveedoresMock(...args)
}))
vi.mock('../services/exportCsv.js', () => ({
  generarCsvProductos: (...args) => generarCsvProductos(...args),
  descargarCsv: (...args) => descargarCsv(...args)
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
  generarCsvProductos.mockReset()
  descargarCsv.mockReset()
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

  it('la tarjeta de stat muestra la cantidad de productos con stock bajo', () => {
    render(<ProductList onSelect={() => {}} onAdd={() => {}} />)
    const tile = screen.getByText('Stock bajo').closest('.stat-tile')
    expect(tile).toHaveTextContent('1')
    expect(tile).toHaveClass('alerta')
  })

  it('la tarjeta de stock bajo muestra 0 y sin alerta si ningun producto esta bajo de stock', () => {
    useProductosMock.mockReturnValue({
      productos: [{ id: 'A1', nombre: 'Yerba', stock: 24, stock_minimo: 5, precio_venta: 3200 }],
      filtros: {},
      setFiltros,
      loading: false,
      error: null
    })
    render(<ProductList onSelect={() => {}} onAdd={() => {}} />)
    const tile = screen.getByText('Stock bajo').closest('.stat-tile')
    expect(tile).toHaveTextContent('0')
    expect(tile).not.toHaveClass('alerta')
  })

  it('muestra las tarjetas de productos, proveedores y valor en stock', () => {
    render(<ProductList onSelect={() => {}} onAdd={() => {}} />)
    expect(screen.getByText('Proveedores')).toBeInTheDocument()
    expect(screen.getByText('Valor en stock')).toBeInTheDocument()
    // Yerba: 3200*24 + Aceite: 4100*2 = 85000
    expect(screen.getByText('$85.000')).toBeInTheDocument()
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

  it('tocar exportar genera el CSV con los productos y categorías actuales y lo descarga', async () => {
    generarCsvProductos.mockReturnValue('Código,Nombre\nA1,Yerba')
    const user = userEvent.setup()
    render(<ProductList onSelect={() => {}} onAdd={() => {}} />)

    await user.click(screen.getByRole('button', { name: /exportar/i }))

    expect(generarCsvProductos).toHaveBeenCalledWith(productos, [{ id: 'c1', nombre: 'Bebidas' }])
    expect(descargarCsv).toHaveBeenCalledWith(expect.stringMatching(/^productos.*\.csv$/), 'Código,Nombre\nA1,Yerba')
  })

  it('marca el estado de stock de cada producto (normal, bajo, sin stock)', () => {
    useProductosMock.mockReturnValue({
      productos: [
        { id: 'A1', nombre: 'Yerba', stock: 24, stock_minimo: 5, precio_venta: 3200 },
        { id: 'A2', nombre: 'Aceite', stock: 2, stock_minimo: 5, precio_venta: 4100 },
        { id: 'A3', nombre: 'Arroz', stock: 0, stock_minimo: 5, precio_venta: 900 }
      ],
      filtros: {},
      setFiltros,
      loading: false,
      error: null
    })
    render(<ProductList onSelect={() => {}} onAdd={() => {}} />)

    expect(screen.getByText('Yerba').closest('li')).toHaveTextContent('Normal')
    expect(screen.getByText('Aceite').closest('li')).toHaveTextContent('Bajo')
    expect(screen.getByText('Arroz').closest('li')).toHaveTextContent('Sin stock')
  })

  it('sin productos, invita a cargar el primero', () => {
    useProductosMock.mockReturnValue({ productos: [], filtros: {}, setFiltros, loading: false, error: null })
    render(<ProductList onSelect={() => {}} onAdd={() => {}} />)

    expect(screen.getByText(/todavía no hay productos/i)).toBeInTheDocument()
  })
})

