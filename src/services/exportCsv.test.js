import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generarCsvProductos, descargarCsv } from './exportCsv.js'

describe('generarCsvProductos', () => {
  it('arma el encabezado y una fila por producto, con el nombre de categoría resuelto', () => {
    const productos = [
      { id: 'A1', nombre: 'Yerba 1kg', categoria_id: 'c1', precio_venta: 3200, costo: 2000, stock: 10, stock_minimo: 5 }
    ]
    const categorias = [{ id: 'c1', nombre: 'Almacén' }]

    const csv = generarCsvProductos(productos, categorias)

    expect(csv).toBe(
      'Código,Nombre,Categoría,Precio de venta,Costo,Stock,Stock mínimo\n' +
      'A1,Yerba 1kg,Almacén,3200,2000,10,5'
    )
  })

  it('deja la categoría vacía si el producto no tiene una asignada', () => {
    const productos = [
      { id: 'A2', nombre: 'Fideos', categoria_id: null, precio_venta: 800, costo: 500, stock: 3, stock_minimo: 2 }
    ]

    const csv = generarCsvProductos(productos, [])

    expect(csv).toContain('A2,Fideos,,800,500,3,2')
  })

  it('escapa campos con comas, comillas o saltos de línea', () => {
    const productos = [
      { id: 'A3', nombre: 'Yerba "Especial", 1kg', categoria_id: null, precio_venta: 1000, costo: 700, stock: 1, stock_minimo: 0 }
    ]

    const csv = generarCsvProductos(productos, [])

    expect(csv).toContain('"Yerba ""Especial"", 1kg"')
  })

  it('sin productos, deja solo el encabezado', () => {
    const csv = generarCsvProductos([], [])

    expect(csv).toBe('Código,Nombre,Categoría,Precio de venta,Costo,Stock,Stock mínimo')
  })
})

describe('descargarCsv', () => {
  const createObjectURL = vi.fn(() => 'blob:mock-url')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    global.URL.createObjectURL = createObjectURL
    global.URL.revokeObjectURL = revokeObjectURL
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('crea un link temporal y dispara la descarga del archivo', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    descargarCsv('productos.csv', 'Código,Nombre\nA1,Yerba')

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})
