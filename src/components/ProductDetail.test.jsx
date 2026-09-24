import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const listarProveedoresDeProducto = vi.fn()
const listarMovimientosPorProducto = vi.fn()

vi.mock('../services/productoProveedor.js', () => ({
  listarProveedoresDeProducto: (...args) => listarProveedoresDeProducto(...args)
}))
vi.mock('../services/movimientos.js', () => ({
  listarMovimientosPorProducto: (...args) => listarMovimientosPorProducto(...args)
}))

const { default: ProductDetail } = await import('./ProductDetail.jsx')

const producto = {
  id: 'A1',
  nombre: 'Yerba 1kg',
  precio_venta: 3200,
  costo: 2000,
  stock: 24,
  stock_minimo: 5,
  imagen_url: null
}

beforeEach(() => {
  listarProveedoresDeProducto.mockReset()
  listarMovimientosPorProducto.mockReset()
  listarProveedoresDeProducto.mockResolvedValue([{ id: 'p1', nombre: 'Distribuidora Sur' }])
  listarMovimientosPorProducto.mockResolvedValue([])
})

describe('ProductDetail', () => {
  it('muestra los datos del producto', () => {
    render(<ProductDetail producto={producto} onEdit={() => {}} onDelete={() => {}} onBack={() => {}} onMovimiento={() => {}} />)
    expect(screen.getByText('Yerba 1kg')).toBeInTheDocument()
    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
  })

  it('carga y muestra los proveedores asociados', async () => {
    render(<ProductDetail producto={producto} onEdit={() => {}} onDelete={() => {}} onBack={() => {}} onMovimiento={() => {}} />)
    await waitFor(() => expect(screen.getByText('Distribuidora Sur')).toBeInTheDocument())
    expect(listarProveedoresDeProducto).toHaveBeenCalledWith('A1')
  })

  it('abierto desde la fila de un proveedor, muestra el precio y costo de ese proveedor', async () => {
    listarProveedoresDeProducto.mockResolvedValue([{ id: 'p1', nombre: 'Distribuidora Sur', precio_venta: 3500, costo: 2400 }])
    const fila = { ...producto, proveedor: { id: 'p1', nombre: 'Distribuidora Sur', precio_venta: 3500, costo: 2400 } }
    render(<ProductDetail producto={fila} onEdit={() => {}} onDelete={() => {}} onBack={() => {}} onMovimiento={() => {}} />)

    expect(screen.getByText('Precio de venta').closest('.dato')).toHaveTextContent('$3.500')
    expect(screen.getByText('Costo').closest('.dato')).toHaveTextContent('$2.400')
    expect(screen.getByText(/de distribuidora sur/i)).toBeInTheDocument()
    await waitFor(() => expect(listarProveedoresDeProducto).toHaveBeenCalled())
  })

  it('editar llama a onEdit', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    render(<ProductDetail producto={producto} onEdit={onEdit} onDelete={() => {}} onBack={() => {}} onMovimiento={() => {}} />)

    await user.click(screen.getByRole('button', { name: /editar/i }))

    expect(onEdit).toHaveBeenCalled()
  })

  it('eliminar pide confirmacion en espanol simple y llama a onDelete', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(<ProductDetail producto={producto} onEdit={() => {}} onDelete={onDelete} onBack={() => {}} onMovimiento={() => {}} />)

    await user.click(screen.getByRole('button', { name: /eliminar/i }))

    expect(window.confirm).toHaveBeenCalledWith('¿Seguro que querés eliminar Yerba 1kg? No se puede deshacer.')
    expect(onDelete).toHaveBeenCalled()
  })

  it('carga y muestra el historial de movimientos', async () => {
    listarMovimientosPorProducto.mockResolvedValue([
      { id: 'm1', tipo: 'entrada', cantidad: 10, motivo: 'Alta inicial', fecha: '2026-09-18T10:00:00Z' },
      { id: 'm2', tipo: 'salida', cantidad: 2, motivo: null, fecha: '2026-09-20T10:00:00Z' }
    ])
    render(<ProductDetail producto={producto} onEdit={() => {}} onDelete={() => {}} onBack={() => {}} onMovimiento={() => {}} />)

    await waitFor(() => expect(screen.getByText(/alta inicial/i)).toBeInTheDocument())
    expect(listarMovimientosPorProducto).toHaveBeenCalledWith('A1')
    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('-2')).toBeInTheDocument()
  })

  it('no muestra la seccion de historial si el producto no tiene movimientos', async () => {
    render(<ProductDetail producto={producto} onEdit={() => {}} onDelete={() => {}} onBack={() => {}} onMovimiento={() => {}} />)

    await waitFor(() => expect(listarMovimientosPorProducto).toHaveBeenCalled())
    expect(screen.queryByText(/historial/i)).not.toBeInTheDocument()
  })

  it('registrar entrada/salida llama a onMovimiento con el tipo', async () => {
    const onMovimiento = vi.fn()
    const user = userEvent.setup()
    render(<ProductDetail producto={producto} onEdit={() => {}} onDelete={() => {}} onBack={() => {}} onMovimiento={onMovimiento} />)

    await user.click(screen.getByRole('button', { name: /\+ entrada/i }))
    expect(onMovimiento).toHaveBeenCalledWith('entrada')

    await user.click(screen.getByRole('button', { name: /− salida/i }))
    expect(onMovimiento).toHaveBeenCalledWith('salida')
  })
})
