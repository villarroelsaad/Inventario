import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const listarCategorias = vi.fn()
const crearCategoria = vi.fn()
const actualizarCategoria = vi.fn()
const borrarCategoria = vi.fn()

vi.mock('../services/categorias.js', () => ({
  listarCategorias: (...args) => listarCategorias(...args),
  crearCategoria: (...args) => crearCategoria(...args),
  actualizarCategoria: (...args) => actualizarCategoria(...args),
  borrarCategoria: (...args) => borrarCategoria(...args)
}))

const { useCategorias } = await import('./useCategorias.js')

beforeEach(() => {
  listarCategorias.mockReset()
  crearCategoria.mockReset()
  actualizarCategoria.mockReset()
  borrarCategoria.mockReset()
  listarCategorias.mockResolvedValue([{ id: '1', nombre: 'Bebidas' }])
})

describe('useCategorias', () => {
  it('carga las categorias al montar', async () => {
    const { result } = renderHook(() => useCategorias())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.categorias).toEqual([{ id: '1', nombre: 'Bebidas' }])
  })

  it('crear agrega la categoria y refresca la lista', async () => {
    crearCategoria.mockResolvedValue({ id: '2', nombre: 'Limpieza' })
    listarCategorias
      .mockResolvedValueOnce([{ id: '1', nombre: 'Bebidas' }])
      .mockResolvedValueOnce([{ id: '1', nombre: 'Bebidas' }, { id: '2', nombre: 'Limpieza' }])

    const { result } = renderHook(() => useCategorias())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.crear('Limpieza')
    })

    expect(crearCategoria).toHaveBeenCalledWith('Limpieza')
    expect(result.current.categorias).toHaveLength(2)
  })

  it('borrar quita la categoria de la lista', async () => {
    borrarCategoria.mockResolvedValue(undefined)
    listarCategorias
      .mockResolvedValueOnce([{ id: '1', nombre: 'Bebidas' }])
      .mockResolvedValueOnce([])

    const { result } = renderHook(() => useCategorias())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.borrar('1')
    })

    expect(borrarCategoria).toHaveBeenCalledWith('1')
    expect(result.current.categorias).toEqual([])
  })
})
