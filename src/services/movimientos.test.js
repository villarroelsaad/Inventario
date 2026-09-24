import { describe, it, expect, vi, beforeEach } from 'vitest'

function makeQueryBuilder (result) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    then: (resolve) => Promise.resolve(result).then(resolve)
  }
  return builder
}

const rpc = vi.fn()
const from = vi.fn()

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    rpc: (...args) => rpc(...args),
    from: (...args) => from(...args)
  }
}))

const { registrarMovimiento, listarMovimientosPorProducto } = await import('./movimientos.js')

beforeEach(() => {
  rpc.mockReset()
  from.mockReset()
})

describe('registrarMovimiento', () => {
  it('llama al rpc registrar_movimiento con los parametros correctos', async () => {
    rpc.mockResolvedValue({ error: null })

    await registrarMovimiento({ productoId: 'A1', tipo: 'entrada', cantidad: 10, motivo: 'Alta inicial' })

    expect(rpc).toHaveBeenCalledWith('registrar_movimiento', {
      p_producto_id: 'A1',
      p_tipo: 'entrada',
      p_cantidad: 10,
      p_motivo: 'Alta inicial'
    })
  })

  it('propaga el mensaje de error que devuelve la base (ej. sin stock suficiente)', async () => {
    rpc.mockResolvedValue({ error: { message: 'No hay stock suficiente' } })

    await expect(
      registrarMovimiento({ productoId: 'A1', tipo: 'salida', cantidad: 999 })
    ).rejects.toThrow('No hay stock suficiente')
  })
})

describe('listarMovimientosPorProducto', () => {
  it('trae los movimientos del producto ordenados del mas reciente al mas viejo', async () => {
    const movimientos = [
      { id: 'm2', tipo: 'salida', cantidad: 1, motivo: null, fecha: '2026-09-24T10:00:00Z' },
      { id: 'm1', tipo: 'entrada', cantidad: 10, motivo: 'Alta inicial', fecha: '2026-09-18T10:00:00Z' }
    ]
    const builder = makeQueryBuilder({ data: movimientos, error: null })
    from.mockReturnValue(builder)

    const resultado = await listarMovimientosPorProducto('A1')

    expect(from).toHaveBeenCalledWith('movimientos')
    expect(builder.eq).toHaveBeenCalledWith('producto_id', 'A1')
    expect(builder.order).toHaveBeenCalledWith('fecha', { ascending: false })
    expect(resultado).toEqual(movimientos)
  })

  it('lanza un error legible si falla la consulta', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'boom' } })
    from.mockReturnValue(builder)

    await expect(listarMovimientosPorProducto('A1')).rejects.toThrow('No se pudo cargar el historial de movimientos')
  })
})
