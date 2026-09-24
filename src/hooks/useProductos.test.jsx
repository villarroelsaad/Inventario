import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const listarProductos = vi.fn()
const crearProducto = vi.fn()
const actualizarProducto = vi.fn()
const borrarProducto = vi.fn()
const subirImagenProducto = vi.fn()

vi.mock('../services/productos.js', () => ({
  listarProductos: (...args) => listarProductos(...args),
  crearProducto: (...args) => crearProducto(...args),
  actualizarProducto: (...args) => actualizarProducto(...args),
  borrarProducto: (...args) => borrarProducto(...args),
  subirImagenProducto: (...args) => subirImagenProducto(...args)
}))

const reemplazarProveedoresDeProducto = vi.fn()
vi.mock('../services/productoProveedor.js', () => ({
  reemplazarProveedoresDeProducto: (...args) => reemplazarProveedoresDeProducto(...args)
}))

const registrarMovimiento = vi.fn()
vi.mock('../services/movimientos.js', () => ({
  registrarMovimiento: (...args) => registrarMovimiento(...args)
}))

const { useProductos } = await import('./useProductos.js')

beforeEach(() => {
  listarProductos.mockReset()
  crearProducto.mockReset()
  actualizarProducto.mockReset()
  borrarProducto.mockReset()
  subirImagenProducto.mockReset()
  reemplazarProveedoresDeProducto.mockReset()
  registrarMovimiento.mockReset()
  listarProductos.mockResolvedValue([{ id: 'A1', nombre: 'Yerba' }])
})

describe('useProductos', () => {
  it('si una consulta vieja responde tarde, no pisa el resultado de la más nueva', async () => {
    let resolverVieja
    listarProductos
      .mockResolvedValueOnce([{ id: 'A1', nombre: 'Yerba' }])
      .mockImplementationOnce(() => new Promise((resolve) => { resolverVieja = resolve }))
      .mockResolvedValueOnce([{ id: 'A1', nombre: 'Yerba' }, { id: 'B1', nombre: 'Bomba' }])

    const { result } = renderHook(() => useProductos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setFiltros({ proveedorId: 'p2' }))
    act(() => result.current.setFiltros({}))
    await waitFor(() => expect(result.current.productos).toHaveLength(2))

    await act(async () => resolverVieja([{ id: 'E2E', nombre: 'Solo del proveedor' }]))

    expect(result.current.productos).toEqual([{ id: 'A1', nombre: 'Yerba' }, { id: 'B1', nombre: 'Bomba' }])
  })

  it('recargar vuelve a pedir los productos con los filtros actuales', async () => {
    const { result } = renderHook(() => useProductos())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setFiltros({ busqueda: 'yerba' }))
    await waitFor(() => expect(listarProductos).toHaveBeenCalledTimes(2))

    await act(async () => { await result.current.recargar() })

    expect(listarProductos).toHaveBeenCalledTimes(3)
    expect(listarProductos).toHaveBeenLastCalledWith({ busqueda: 'yerba' })
  })

  it('sin cargar la lista no consulta productos, ni al montar ni al guardar', async () => {
    crearProducto.mockResolvedValue({ id: 'A2', nombre: 'Aceite' })
    reemplazarProveedoresDeProducto.mockResolvedValue(undefined)
    borrarProducto.mockResolvedValue(undefined)

    const { result } = renderHook(() => useProductos({ cargarLista: false }))
    expect(result.current.loading).toBe(false)

    await act(async () => {
      await result.current.crear({ id: 'A2', nombre: 'Aceite' }, [])
      await result.current.borrar('A2')
    })

    expect(crearProducto).toHaveBeenCalled()
    expect(borrarProducto).toHaveBeenCalledWith('A2')
    expect(listarProductos).not.toHaveBeenCalled()
  })

  it('cuando se empieza a necesitar la lista, la carga con los filtros actuales', async () => {
    const { result, rerender } = renderHook(({ cargarLista }) => useProductos({ cargarLista }), {
      initialProps: { cargarLista: false }
    })
    act(() => result.current.setFiltros({ busqueda: 'yer' }))
    expect(listarProductos).not.toHaveBeenCalled()

    rerender({ cargarLista: true })

    await waitFor(() => expect(result.current.productos).toEqual([{ id: 'A1', nombre: 'Yerba' }]))
    expect(listarProductos).toHaveBeenCalledTimes(1)
    expect(listarProductos).toHaveBeenCalledWith({ busqueda: 'yer' })
  })

  it('carga los productos al montar, sin filtros', async () => {
    const { result } = renderHook(() => useProductos())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(listarProductos).toHaveBeenCalledWith({})
    expect(result.current.productos).toEqual([{ id: 'A1', nombre: 'Yerba' }])
  })

  it('setFiltros vuelve a cargar con los nuevos filtros', async () => {
    const { result } = renderHook(() => useProductos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      result.current.setFiltros({ busqueda: 'yerba' })
    })

    await waitFor(() => expect(listarProductos).toHaveBeenLastCalledWith({ busqueda: 'yerba' }))
  })

  it('crear crea el producto, asigna proveedores y refresca', async () => {
    crearProducto.mockResolvedValue({ id: 'A2', nombre: 'Aceite' })
    reemplazarProveedoresDeProducto.mockResolvedValue(undefined)

    const { result } = renderHook(() => useProductos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.crear({ id: 'A2', nombre: 'Aceite' }, ['p1'])
    })

    expect(crearProducto).toHaveBeenCalledWith({ id: 'A2', nombre: 'Aceite' })
    expect(reemplazarProveedoresDeProducto).toHaveBeenCalledWith('A2', ['p1'])
    expect(listarProductos).toHaveBeenCalledTimes(2)
  })

  it('crear con imagen la sube y guarda la url en el producto', async () => {
    crearProducto.mockResolvedValue({ id: 'A2', nombre: 'Aceite' })
    subirImagenProducto.mockResolvedValue('https://cdn/A2.jpg')
    actualizarProducto.mockResolvedValue({ id: 'A2', imagen_url: 'https://cdn/A2.jpg' })
    reemplazarProveedoresDeProducto.mockResolvedValue(undefined)
    const file = { name: 'foto.jpg' }

    const { result } = renderHook(() => useProductos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.crear({ id: 'A2', nombre: 'Aceite' }, [], file)
    })

    expect(subirImagenProducto).toHaveBeenCalledWith('A2', file)
    expect(actualizarProducto).toHaveBeenCalledWith('A2', { imagen_url: 'https://cdn/A2.jpg' })
  })

  it('crear con cantidad inicial registra un movimiento de entrada', async () => {
    crearProducto.mockResolvedValue({ id: 'A2', nombre: 'Aceite' })
    reemplazarProveedoresDeProducto.mockResolvedValue(undefined)
    registrarMovimiento.mockResolvedValue(undefined)

    const { result } = renderHook(() => useProductos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.crear({ id: 'A2', nombre: 'Aceite' }, [], null, 10)
    })

    expect(registrarMovimiento).toHaveBeenCalledWith({
      productoId: 'A2',
      tipo: 'entrada',
      cantidad: 10,
      motivo: 'Alta inicial'
    })
  })

  it('crear sin cantidad inicial no registra ningun movimiento', async () => {
    crearProducto.mockResolvedValue({ id: 'A2', nombre: 'Aceite' })
    reemplazarProveedoresDeProducto.mockResolvedValue(undefined)

    const { result } = renderHook(() => useProductos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.crear({ id: 'A2', nombre: 'Aceite' }, [], null, 0)
    })

    expect(registrarMovimiento).not.toHaveBeenCalled()
  })

  it('borrar elimina el producto y refresca', async () => {
    borrarProducto.mockResolvedValue(undefined)
    const { result } = renderHook(() => useProductos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.borrar('A1')
    })

    expect(borrarProducto).toHaveBeenCalledWith('A1')
  })
})
