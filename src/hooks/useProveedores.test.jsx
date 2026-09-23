import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const listarProveedores = vi.fn()
const crearProveedor = vi.fn()
const actualizarProveedor = vi.fn()
const borrarProveedor = vi.fn()

vi.mock('../services/proveedores.js', () => ({
  listarProveedores: (...args) => listarProveedores(...args),
  crearProveedor: (...args) => crearProveedor(...args),
  actualizarProveedor: (...args) => actualizarProveedor(...args),
  borrarProveedor: (...args) => borrarProveedor(...args)
}))

const { useProveedores } = await import('./useProveedores.js')

beforeEach(() => {
  listarProveedores.mockReset()
  crearProveedor.mockReset()
  actualizarProveedor.mockReset()
  borrarProveedor.mockReset()
  listarProveedores.mockResolvedValue([{ id: '1', nombre: 'Distribuidora Sur' }])
})

describe('useProveedores', () => {
  it('carga los proveedores al montar', async () => {
    const { result } = renderHook(() => useProveedores())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.proveedores).toEqual([{ id: '1', nombre: 'Distribuidora Sur' }])
  })

  it('crear agrega el proveedor y refresca la lista', async () => {
    crearProveedor.mockResolvedValue({ id: '2', nombre: 'Distribuidora Norte' })
    listarProveedores
      .mockResolvedValueOnce([{ id: '1', nombre: 'Distribuidora Sur' }])
      .mockResolvedValueOnce([{ id: '1', nombre: 'Distribuidora Sur' }, { id: '2', nombre: 'Distribuidora Norte' }])

    const { result } = renderHook(() => useProveedores())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.crear({ nombre: 'Distribuidora Norte' })
    })

    expect(crearProveedor).toHaveBeenCalledWith({ nombre: 'Distribuidora Norte' })
    expect(result.current.proveedores).toHaveLength(2)
  })

  it('borrar quita el proveedor de la lista', async () => {
    borrarProveedor.mockResolvedValue(undefined)
    listarProveedores
      .mockResolvedValueOnce([{ id: '1', nombre: 'Distribuidora Sur' }])
      .mockResolvedValueOnce([])

    const { result } = renderHook(() => useProveedores())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.borrar('1')
    })

    expect(borrarProveedor).toHaveBeenCalledWith('1')
    expect(result.current.proveedores).toEqual([])
  })
})
