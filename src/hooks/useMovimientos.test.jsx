import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const registrarMovimiento = vi.fn()

vi.mock('../services/movimientos.js', () => ({
  registrarMovimiento: (...args) => registrarMovimiento(...args)
}))

const { useMovimientos } = await import('./useMovimientos.js')

beforeEach(() => {
  registrarMovimiento.mockReset()
})

describe('useMovimientos', () => {
  it('registra un movimiento', async () => {
    registrarMovimiento.mockResolvedValue(undefined)
    const { result } = renderHook(() => useMovimientos())

    await act(async () => {
      await result.current.registrar({ productoId: 'A1', tipo: 'entrada', cantidad: 5, motivo: 'Reposición' })
    })

    expect(registrarMovimiento).toHaveBeenCalledWith({ productoId: 'A1', tipo: 'entrada', cantidad: 5, motivo: 'Reposición' })
    expect(result.current.error).toBeNull()
  })

  it('expone el error si falla (ej. no hay stock suficiente)', async () => {
    registrarMovimiento.mockRejectedValue(new Error('No hay stock suficiente'))
    const { result } = renderHook(() => useMovimientos())

    await act(async () => {
      await expect(
        result.current.registrar({ productoId: 'A1', tipo: 'salida', cantidad: 999, motivo: null })
      ).rejects.toThrow('No hay stock suficiente')
    })

    await waitFor(() => expect(result.current.error).toBe('No hay stock suficiente'))
  })
})
