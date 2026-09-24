import { describe, it, expect } from 'vitest'
import { filasPorProveedor, precioDeFila, costoDeFila } from './filasPorProveedor.js'

const yerba = {
  id: 'A1',
  nombre: 'Yerba',
  precio_venta: 3000,
  costo: 1800,
  stock: 10,
  proveedores: [
    { id: 'p1', nombre: 'Distribuidora Sur', precio_venta: 3200, costo: 2000 },
    { id: 'p2', nombre: 'Molinos', precio_venta: null, costo: 1900 }
  ]
}
const pan = { id: 'B1', nombre: 'Pan casero', precio_venta: 900, costo: 400, stock: 3, proveedores: [] }

describe('filasPorProveedor', () => {
  it('arma una fila por cada proveedor del producto, compartiendo el stock', () => {
    const filas = filasPorProveedor([yerba])

    expect(filas).toHaveLength(2)
    expect(filas.map((f) => f.proveedor.nombre)).toEqual(['Distribuidora Sur', 'Molinos'])
    expect(filas.every((f) => f.stock === 10 && f.id === 'A1')).toBe(true)
    expect(new Set(filas.map((f) => f.clave)).size).toBe(2)
  })

  it('un producto sin proveedores es una sola fila sin proveedor', () => {
    const filas = filasPorProveedor([pan])

    expect(filas).toHaveLength(1)
    expect(filas[0].proveedor).toBeNull()
    expect(filas[0].clave).toBe('B1')
  })

  it('el precio de la fila es el del proveedor, y si no tiene, el precio general', () => {
    const [sur, molinos] = filasPorProveedor([yerba])

    expect(precioDeFila(sur)).toBe(3200)
    expect(precioDeFila(molinos)).toBe(3000)
    expect(costoDeFila(molinos)).toBe(1900)
    expect(precioDeFila(filasPorProveedor([pan])[0])).toBe(900)
  })

  it('el rango de precio se aplica sobre el precio de cada fila', () => {
    const filas = filasPorProveedor([yerba, pan], { precioMin: 3100 })

    expect(filas.map((f) => f.clave)).toEqual(['A1::p1'])
  })

  it('ordenar por precio ordena las filas de menor a mayor', () => {
    const filas = filasPorProveedor([yerba, pan], { orden: 'precio' })

    expect(filas.map(precioDeFila)).toEqual([900, 3000, 3200])
  })
})
