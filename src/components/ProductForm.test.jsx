import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const useCategoriasMock = vi.fn()
const useProveedoresMock = vi.fn()

vi.mock('../hooks/useCategorias.js', () => ({
  useCategorias: (...args) => useCategoriasMock(...args)
}))
vi.mock('../hooks/useProveedores.js', () => ({
  useProveedores: (...args) => useProveedoresMock(...args)
}))

let escanerOnDetected = null
vi.mock('../hooks/useBarcodeScanner.js', () => ({
  useBarcodeScanner: (onDetected) => {
    escanerOnDetected = onDetected
    return { videoRef: { current: null }, error: null }
  }
}))

const { default: ProductForm } = await import('./ProductForm.jsx')

beforeEach(() => {
  useCategoriasMock.mockReset()
  useProveedoresMock.mockReset()
  useCategoriasMock.mockReturnValue({ categorias: [{ id: 'c1', nombre: 'Bebidas' }] })
  useProveedoresMock.mockReturnValue({ proveedores: [{ id: 'p1', nombre: 'Distribuidora Sur' }] })
})

describe('ProductForm', () => {
  it('crear: el boton de escanear abre la camara y completa el codigo leido', async () => {
    const user = userEvent.setup()
    const { container } = render(<ProductForm onSave={() => {}} onCancel={() => {}} />)

    await user.click(screen.getByRole('button', { name: /escanear con la cámara/i }))
    expect(container.querySelector('video')).toBeInTheDocument()

    act(() => escanerOnDetected('7790001112223'))

    expect(screen.getByLabelText(/código/i)).toHaveValue('7790001112223')
    expect(container.querySelector('video')).not.toBeInTheDocument()
  })

  it('editar: no ofrece escanear porque el codigo no se puede cambiar', () => {
    render(<ProductForm producto={{ id: 'A1', nombre: 'Yerba' }} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.queryByRole('button', { name: /escanear con la cámara/i })).not.toBeInTheDocument()
  })

  it('mientras se cargan precio y costo muestra cuanto se gana por unidad', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSave={() => {}} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/precio de venta/i), '12')
    await user.type(screen.getByLabelText(/^costo$/i), '8')

    expect(screen.getByText('Ganás $4 por unidad (33%)')).toBeInTheDocument()
  })

  it('avisa si el precio de un proveedor queda por debajo de su costo', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSave={() => {}} onCancel={() => {}} />)

    await user.click(screen.getByLabelText('Distribuidora Sur'))
    await user.type(screen.getByLabelText('Precio en Distribuidora Sur'), '8')
    await user.type(screen.getByLabelText('Costo en Distribuidora Sur'), '10')

    expect(screen.getByText('Perdés $2 por unidad (-25%)')).toBeInTheDocument()
  })

  it('muestra el error si se pasa por props (ej. codigo duplicado)', () => {
    render(<ProductForm error="Ya existe un producto con ese código" onSave={() => {}} onCancel={() => {}} />)

    expect(screen.getByText('Ya existe un producto con ese código')).toBeInTheDocument()
  })

  it('crear: precarga el codigo cuando viene de un escaneo sin coincidencia', () => {
    render(<ProductForm codigoInicial="7791234567890" onSave={() => {}} onCancel={() => {}} />)

    expect(screen.getByLabelText(/código/i)).toHaveValue('7791234567890')
  })

  it('crear: carga los datos y llama a onSave', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<ProductForm onSave={onSave} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/código/i), 'A1')
    await user.type(screen.getByLabelText(/nombre/i), 'Yerba 1kg')
    await user.selectOptions(screen.getByLabelText(/categoría/i), 'c1')
    await user.type(screen.getByLabelText(/precio de venta/i), '3200')
    await user.type(screen.getByLabelText(/costo/i), '2000')
    await user.type(screen.getByLabelText(/stock mínimo/i), '5')
    await user.type(screen.getByLabelText(/cantidad inicial/i), '10')
    await user.click(screen.getByLabelText('Distribuidora Sur'))
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    expect(onSave).toHaveBeenCalledWith(
      {
        id: 'A1',
        nombre: 'Yerba 1kg',
        categoria_id: 'c1',
        precio_venta: 3200,
        costo: 2000,
        stock_minimo: 5
      },
      [{ proveedorId: 'p1', precioVenta: null, costo: null }],
      null,
      10
    )
  })

  it('al elegir un proveedor se pueden cargar su precio y costo propios', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<ProductForm onSave={onSave} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/código/i), 'A1')
    await user.type(screen.getByLabelText(/nombre/i), 'Yerba')
    expect(screen.queryByLabelText('Precio en Distribuidora Sur')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Distribuidora Sur'))
    await user.type(screen.getByLabelText('Precio en Distribuidora Sur'), '3300')
    await user.type(screen.getByLabelText('Costo en Distribuidora Sur'), '2100')
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    expect(onSave.mock.calls[0][1]).toEqual([{ proveedorId: 'p1', precioVenta: 3300, costo: 2100 }])
  })

  it('editar: no muestra el campo de cantidad inicial (el stock se cambia con movimientos)', () => {
    render(
      <ProductForm
        producto={{ id: 'A1', nombre: 'Yerba 1kg', stock_minimo: 5 }}
        onSave={() => {}}
        onCancel={() => {}}
      />
    )
    expect(screen.queryByLabelText(/cantidad inicial/i)).not.toBeInTheDocument()
  })

  it('editar: precarga los datos existentes y el código no se puede editar', () => {
    render(
      <ProductForm
        producto={{
          id: 'A1',
          nombre: 'Yerba 1kg',
          categoria_id: 'c1',
          precio_venta: 3200,
          costo: 2000,
          stock_minimo: 5
        }}
        proveedoresSeleccionados={[{ proveedorId: 'p1', precioVenta: 3300, costo: 2100 }]}
        onSave={() => {}}
        onCancel={() => {}}
      />
    )

    expect(screen.getByLabelText(/código/i)).toHaveValue('A1')
    expect(screen.getByLabelText(/código/i)).toBeDisabled()
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Yerba 1kg')
    expect(screen.getByLabelText('Distribuidora Sur')).toBeChecked()
    expect(screen.getByLabelText('Precio en Distribuidora Sur')).toHaveValue(3300)
  })

  it('cancelar llama a onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ProductForm onSave={() => {}} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onCancel).toHaveBeenCalled()
  })
})
