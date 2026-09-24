import { describe, it, expect, vi, beforeEach } from 'vitest'

function makeQueryBuilder (result) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    then: (resolve) => Promise.resolve(result).then(resolve)
  }
  return builder
}

const from = vi.fn()

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: { from: (...args) => from(...args) }
}))

const { listarProveedoresDeProducto, reemplazarProveedoresDeProducto } = await import('./productoProveedor.js')

beforeEach(() => {
  from.mockReset()
})

describe('listarProveedoresDeProducto', () => {
  it('trae los proveedores asociados a un producto con el precio y costo de cada uno', async () => {
    const builder = makeQueryBuilder({
      data: [{ proveedor_id: 'p1', precio_venta: 3200, costo: 2000, proveedores: { id: 'p1', nombre: 'Distribuidora Sur' } }],
      error: null
    })
    from.mockReturnValue(builder)

    const proveedores = await listarProveedoresDeProducto('A1')

    expect(from).toHaveBeenCalledWith('producto_proveedor')
    expect(builder.eq).toHaveBeenCalledWith('producto_id', 'A1')
    expect(proveedores).toEqual([{ id: 'p1', nombre: 'Distribuidora Sur', precio_venta: 3200, costo: 2000 }])
  })
})

describe('reemplazarProveedoresDeProducto', () => {
  it('borra las relaciones viejas e inserta las nuevas', async () => {
    const deleteBuilder = makeQueryBuilder({ error: null })
    const insertBuilder = makeQueryBuilder({ error: null })
    from
      .mockReturnValueOnce(deleteBuilder)
      .mockReturnValueOnce(insertBuilder)

    await reemplazarProveedoresDeProducto('A1', [
      { proveedorId: 'p1', precioVenta: 3200, costo: 2000 },
      { proveedorId: 'p2', precioVenta: null, costo: null }
    ])

    expect(deleteBuilder.delete).toHaveBeenCalled()
    expect(deleteBuilder.eq).toHaveBeenCalledWith('producto_id', 'A1')
    expect(insertBuilder.insert).toHaveBeenCalledWith([
      { producto_id: 'A1', proveedor_id: 'p1', precio_venta: 3200, costo: 2000 },
      { producto_id: 'A1', proveedor_id: 'p2', precio_venta: null, costo: null }
    ])
  })

  it('si la lista viene vacia, solo borra y no inserta', async () => {
    const deleteBuilder = makeQueryBuilder({ error: null })
    from.mockReturnValueOnce(deleteBuilder)

    await reemplazarProveedoresDeProducto('A1', [])

    expect(deleteBuilder.delete).toHaveBeenCalled()
    expect(from).toHaveBeenCalledTimes(1)
  })
})
