import { describe, it, expect, vi, beforeEach } from 'vitest'

const select = vi.fn()
const order = vi.fn()
const insert = vi.fn()
const update = vi.fn()
const del = vi.fn()
const eq = vi.fn()
const singleInsert = vi.fn()
const singleUpdate = vi.fn()
const from = vi.fn()

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: { from: (...args) => from(...args) }
}))

const { listarProveedores, crearProveedor, actualizarProveedor, borrarProveedor } = await import('./proveedores.js')

beforeEach(() => {
  select.mockReset()
  order.mockReset()
  insert.mockReset()
  update.mockReset()
  del.mockReset()
  eq.mockReset()
  singleInsert.mockReset()
  singleUpdate.mockReset()
  from.mockReset()
})

describe('listarProveedores', () => {
  it('trae los proveedores ordenados por nombre', async () => {
    order.mockResolvedValue({ data: [{ id: '1', nombre: 'Distribuidora Sur' }], error: null })
    select.mockReturnValue({ order })
    from.mockReturnValue({ select })

    const proveedores = await listarProveedores()

    expect(from).toHaveBeenCalledWith('proveedores')
    expect(order).toHaveBeenCalledWith('nombre')
    expect(proveedores).toEqual([{ id: '1', nombre: 'Distribuidora Sur' }])
  })

  it('lanza un error en espanol simple si falla', async () => {
    order.mockResolvedValue({ data: null, error: { message: 'boom' } })
    select.mockReturnValue({ order })
    from.mockReturnValue({ select })

    await expect(listarProveedores()).rejects.toThrow('No se pudieron cargar los proveedores')
  })
})

describe('crearProveedor', () => {
  it('inserta un proveedor nuevo y devuelve la fila creada', async () => {
    singleInsert.mockResolvedValue({
      data: { id: '1', nombre: 'Distribuidora Sur', contacto: '11-1111', notas: '' },
      error: null
    })
    const select2 = vi.fn().mockReturnValue({ single: singleInsert })
    insert.mockReturnValue({ select: select2 })
    from.mockReturnValue({ insert })

    const proveedor = await crearProveedor({ nombre: 'Distribuidora Sur', contacto: '11-1111', notas: '' })

    expect(from).toHaveBeenCalledWith('proveedores')
    expect(insert).toHaveBeenCalledWith({ nombre: 'Distribuidora Sur', contacto: '11-1111', notas: '' })
    expect(proveedor.nombre).toBe('Distribuidora Sur')
  })
})

describe('actualizarProveedor', () => {
  it('actualiza los datos de un proveedor', async () => {
    singleUpdate.mockResolvedValue({ data: { id: '1', nombre: 'Distribuidora Norte' }, error: null })
    const select2 = vi.fn().mockReturnValue({ single: singleUpdate })
    eq.mockReturnValue({ select: select2 })
    update.mockReturnValue({ eq })
    from.mockReturnValue({ update })

    const proveedor = await actualizarProveedor('1', { nombre: 'Distribuidora Norte' })

    expect(update).toHaveBeenCalledWith({ nombre: 'Distribuidora Norte' })
    expect(eq).toHaveBeenCalledWith('id', '1')
    expect(proveedor.nombre).toBe('Distribuidora Norte')
  })
})

describe('borrarProveedor', () => {
  it('borra el proveedor por id', async () => {
    eq.mockResolvedValue({ error: null })
    del.mockReturnValue({ eq })
    from.mockReturnValue({ delete: del })

    await borrarProveedor('1')

    expect(del).toHaveBeenCalled()
    expect(eq).toHaveBeenCalledWith('id', '1')
  })
})
