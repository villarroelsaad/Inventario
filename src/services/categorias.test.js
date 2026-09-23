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

const { listarCategorias, crearCategoria, actualizarCategoria, borrarCategoria } = await import('./categorias.js')

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

describe('listarCategorias', () => {
  it('trae las categorias ordenadas por nombre', async () => {
    order.mockResolvedValue({ data: [{ id: '1', nombre: 'Bebidas' }], error: null })
    select.mockReturnValue({ order })
    from.mockReturnValue({ select })

    const categorias = await listarCategorias()

    expect(from).toHaveBeenCalledWith('categorias')
    expect(select).toHaveBeenCalledWith('*')
    expect(order).toHaveBeenCalledWith('nombre')
    expect(categorias).toEqual([{ id: '1', nombre: 'Bebidas' }])
  })

  it('lanza un error en espanol simple si falla', async () => {
    order.mockResolvedValue({ data: null, error: { message: 'boom' } })
    select.mockReturnValue({ order })
    from.mockReturnValue({ select })

    await expect(listarCategorias()).rejects.toThrow('No se pudieron cargar las categorías')
  })
})

describe('crearCategoria', () => {
  it('inserta una categoria nueva y devuelve la fila creada', async () => {
    singleInsert.mockResolvedValue({ data: { id: '1', nombre: 'Bebidas' }, error: null })
    const select2 = vi.fn().mockReturnValue({ single: singleInsert })
    insert.mockReturnValue({ select: select2 })
    from.mockReturnValue({ insert })

    const categoria = await crearCategoria('Bebidas')

    expect(from).toHaveBeenCalledWith('categorias')
    expect(insert).toHaveBeenCalledWith({ nombre: 'Bebidas' })
    expect(categoria).toEqual({ id: '1', nombre: 'Bebidas' })
  })

  it('lanza error legible si el nombre ya existe', async () => {
    singleInsert.mockResolvedValue({ data: null, error: { code: '23505' } })
    const select2 = vi.fn().mockReturnValue({ single: singleInsert })
    insert.mockReturnValue({ select: select2 })
    from.mockReturnValue({ insert })

    await expect(crearCategoria('Bebidas')).rejects.toThrow('Ya existe una categoría con ese nombre')
  })
})

describe('actualizarCategoria', () => {
  it('actualiza el nombre de una categoria', async () => {
    singleUpdate.mockResolvedValue({ data: { id: '1', nombre: 'Limpieza' }, error: null })
    const select2 = vi.fn().mockReturnValue({ single: singleUpdate })
    eq.mockReturnValue({ select: select2 })
    update.mockReturnValue({ eq })
    from.mockReturnValue({ update })

    const categoria = await actualizarCategoria('1', 'Limpieza')

    expect(update).toHaveBeenCalledWith({ nombre: 'Limpieza' })
    expect(eq).toHaveBeenCalledWith('id', '1')
    expect(categoria.nombre).toBe('Limpieza')
  })
})

describe('borrarCategoria', () => {
  it('borra la categoria por id', async () => {
    eq.mockResolvedValue({ error: null })
    del.mockReturnValue({ eq })
    from.mockReturnValue({ delete: del })

    await borrarCategoria('1')

    expect(del).toHaveBeenCalled()
    expect(eq).toHaveBeenCalledWith('id', '1')
  })
})
