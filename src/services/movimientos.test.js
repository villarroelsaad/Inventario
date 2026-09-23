import { describe, it, expect, vi, beforeEach } from 'vitest'

const rpc = vi.fn()

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: { rpc: (...args) => rpc(...args) }
}))

const { registrarMovimiento } = await import('./movimientos.js')

beforeEach(() => {
  rpc.mockReset()
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
