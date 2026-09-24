import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const montajesLista = vi.fn()
const versionesLista = []
const borrar = vi.fn()
const registrar = vi.fn()

vi.mock('./hooks/useAuth.js', () => ({
  useAuth: () => ({ user: { id: 'u1' }, loading: false, logout: vi.fn() })
}))
const argsUseProductos = []
vi.mock('./hooks/useProductos.js', () => ({
  useProductos: (opciones) => argsUseProductos.push(opciones) && ({ productos: [], filtros: {}, setFiltros: vi.fn(), crear: vi.fn(), actualizar: vi.fn(), borrar })
}))
vi.mock('./hooks/useMovimientos.js', () => ({
  useMovimientos: () => ({ registrar, error: null })
}))
vi.mock('./hooks/useTema.js', () => ({
  useTema: () => ({ temaEfectivo: 'light', alternarTema: vi.fn() })
}))
vi.mock('./services/productos.js', () => ({
  obtenerProductoPorId: vi.fn(async () => ({ id: 'A1', nombre: 'Bomba', stock: 20 }))
}))
vi.mock('./services/productoProveedor.js', () => ({
  listarProveedoresDeProducto: vi.fn(async () => [])
}))

// La lista real se prueba aparte; acá solo importa cuántas veces se monta y qué versión recibe.
vi.mock('./components/ProductList.jsx', async () => {
  const { useEffect } = await import('react')
  return {
    default: function ProductListFalsa ({ onSelect, onMovimiento, version }) {
      useEffect(() => { montajesLista() }, [])
      versionesLista.push(version)
      return (
        <>
          <button type="button" onClick={() => onSelect({ id: 'A1', nombre: 'Bomba', stock: 16 })}>Fila Bomba</button>
          <button type="button" onClick={() => onMovimiento('salida')}>Salida general</button>
        </>
      )
    }
  }
})
vi.mock('./components/ProductDetail.jsx', () => ({
  default: ({ onBack, onDelete, onMovimiento }) => (
    <div>
      <p>Detalle abierto</p>
      <button type="button" onClick={onBack}>Cerrar detalle</button>
      <button type="button" onClick={onDelete}>Eliminar producto</button>
      <button type="button" onClick={() => onMovimiento('entrada')}>Entrada</button>
    </div>
  )
}))
vi.mock('./components/MovementForm.jsx', () => ({
  default: ({ onSave }) => <button type="button" onClick={() => onSave(4, '')}>Guardar movimiento</button>
}))

const { default: App } = await import('./App.jsx')

beforeEach(() => {
  montajesLista.mockReset()
  versionesLista.length = 0
  argsUseProductos.length = 0
  borrar.mockReset()
  registrar.mockReset()
  borrar.mockResolvedValue(undefined)
  registrar.mockResolvedValue(undefined)
})

describe('App', () => {
  it('con un producto abierto la lista sigue de fondo, y al cerrarlo no se vuelve a montar ni a recargar', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(montajesLista).toHaveBeenCalledTimes(1)

    await user.click(screen.getByText('Fila Bomba'))
    expect(screen.getByText('Detalle abierto')).toBeInTheDocument()
    expect(screen.getByText('Fila Bomba')).toBeInTheDocument()

    await user.click(screen.getByText('Cerrar detalle'))
    expect(montajesLista).toHaveBeenCalledTimes(1)
    expect(new Set(versionesLista).size).toBe(1)
  })

  it('después de eliminar un producto la lista recibe una versión nueva para recargarse', async () => {
    const user = userEvent.setup()
    render(<App />)
    const versionInicial = versionesLista.at(-1)

    await user.click(screen.getByText('Fila Bomba'))
    await user.click(screen.getByText('Eliminar producto'))

    expect(borrar).toHaveBeenCalledWith('A1')
    expect(versionesLista.at(-1)).not.toBe(versionInicial)
    expect(montajesLista).toHaveBeenCalledTimes(1)
  })

  it('después de registrar un movimiento desde el detalle la lista recibe una versión nueva', async () => {
    const user = userEvent.setup()
    render(<App />)
    const versionInicial = versionesLista.at(-1)

    await user.click(screen.getByText('Fila Bomba'))
    await user.click(screen.getByText('Entrada'))
    await user.click(await screen.findByText('Guardar movimiento'))

    expect(await screen.findByText('Detalle abierto')).toBeInTheDocument()
    expect(versionesLista.at(-1)).not.toBe(versionInicial)
  })

  it('la lista propia de App solo se pide al elegir producto para un movimiento, no en Inicio', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(argsUseProductos.at(-1)).toEqual({ cargarLista: false })

    await user.click(screen.getByText('Salida general'))

    expect(screen.getByText('Elegí el producto')).toBeInTheDocument()
    expect(argsUseProductos.at(-1)).toEqual({ cargarLista: true })
  })
})
