import { describe, it, expect, vi, beforeEach } from 'vitest'

function makeQueryBuilder (result) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    in: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve) => Promise.resolve(result).then(resolve)
  }
  return builder
}

const from = vi.fn()
const storageUpload = vi.fn()
const storageGetPublicUrl = vi.fn()

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => from(...args),
    storage: { from: () => ({ upload: storageUpload, getPublicUrl: storageGetPublicUrl }) }
  }
}))

const {
  listarProductos,
  crearProducto,
  actualizarProducto,
  borrarProducto,
  subirImagenProducto
} = await import('./productos.js')

beforeEach(() => {
  from.mockReset()
  storageUpload.mockReset()
  storageGetPublicUrl.mockReset()
})

describe('listarProductos', () => {
  it('trae todos los productos sin filtros, ordenados por nombre', async () => {
    const builder = makeQueryBuilder({ data: [{ id: 'A1', nombre: 'Yerba' }], error: null })
    from.mockReturnValue(builder)

    const productos = await listarProductos({})

    expect(from).toHaveBeenCalledWith('productos')
    expect(builder.order).toHaveBeenCalledWith('nombre')
    expect(productos).toEqual([{ id: 'A1', nombre: 'Yerba' }])
  })

  it('aplica busqueda de texto, categoria y rango de precio', async () => {
    const builder = makeQueryBuilder({ data: [], error: null })
    from.mockReturnValue(builder)

    await listarProductos({
      busqueda: 'yerba',
      categoriaId: 'cat-1',
      precioMin: 100,
      precioMax: 500,
      orden: 'precio'
    })

    expect(builder.ilike).toHaveBeenCalledWith('nombre', '%yerba%')
    expect(builder.eq).toHaveBeenCalledWith('categoria_id', 'cat-1')
    expect(builder.gte).toHaveBeenCalledWith('precio_venta', 100)
    expect(builder.lte).toHaveBeenCalledWith('precio_venta', 500)
    expect(builder.order).toHaveBeenCalledWith('precio_venta')
  })

  it('filtra por proveedor via join y limpia el campo embebido', async () => {
    const builder = makeQueryBuilder({
      data: [{ id: 'A1', nombre: 'Yerba', producto_proveedor: [{ proveedor_id: 'p1' }] }],
      error: null
    })
    from.mockReturnValue(builder)

    const productos = await listarProductos({ proveedorId: 'p1' })

    expect(builder.select).toHaveBeenCalledWith('*, producto_proveedor!inner(proveedor_id)')
    expect(builder.eq).toHaveBeenCalledWith('producto_proveedor.proveedor_id', 'p1')
    expect(productos).toEqual([{ id: 'A1', nombre: 'Yerba' }])
  })
})

describe('crearProducto', () => {
  it('inserta el producto y devuelve la fila creada', async () => {
    const builder = makeQueryBuilder({
      data: { id: 'A1', nombre: 'Yerba' },
      error: null
    })
    from.mockReturnValue(builder)

    const producto = await crearProducto({ id: 'A1', nombre: 'Yerba' })

    expect(from).toHaveBeenCalledWith('productos')
    expect(builder.insert).toHaveBeenCalledWith({ id: 'A1', nombre: 'Yerba' })
    expect(producto.id).toBe('A1')
  })

  it('lanza error legible si el codigo ya existe', async () => {
    const builder = makeQueryBuilder({ data: null, error: { code: '23505' } })
    from.mockReturnValue(builder)

    await expect(crearProducto({ id: 'A1', nombre: 'Yerba' }))
      .rejects.toThrow('Ya existe un producto con ese código')
  })
})

describe('actualizarProducto', () => {
  it('actualiza los datos del producto', async () => {
    const builder = makeQueryBuilder({ data: { id: 'A1', nombre: 'Yerba 1kg' }, error: null })
    from.mockReturnValue(builder)

    const producto = await actualizarProducto('A1', { nombre: 'Yerba 1kg' })

    expect(builder.update).toHaveBeenCalledWith({ nombre: 'Yerba 1kg' })
    expect(builder.eq).toHaveBeenCalledWith('id', 'A1')
    expect(producto.nombre).toBe('Yerba 1kg')
  })
})

describe('borrarProducto', () => {
  it('borra el producto por id', async () => {
    const builder = makeQueryBuilder({ error: null })
    from.mockReturnValue(builder)

    await borrarProducto('A1')

    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('id', 'A1')
  })
})

describe('subirImagenProducto', () => {
  it('sube el archivo y devuelve la url publica', async () => {
    storageUpload.mockResolvedValue({ error: null })
    storageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn/productos-imagenes/A1.jpg' } })
    const file = { name: 'foto.jpg' }

    const url = await subirImagenProducto('A1', file)

    expect(storageUpload).toHaveBeenCalledWith('A1', file, { upsert: true })
    expect(url).toBe('https://cdn/productos-imagenes/A1.jpg')
  })
})
