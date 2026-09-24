import { supabase } from '../lib/supabaseClient.js'

const ORDEN_COLUMNA = {
  nombre: 'nombre',
  precio: 'precio_venta',
  cantidad: 'stock',
  reciente: 'created_at'
}

const PROVEEDORES_EMBEBIDOS = 'proveedor_id, precio_venta, costo, proveedores(nombre)'

// El rango de precio no se filtra acá: cada proveedor puede tener su propio precio,
// así que se aplica sobre cada fila producto+proveedor (ver lib/filasPorProveedor.js).
export async function listarProductos ({ busqueda, categoriaId, proveedorId, orden } = {}) {
  let query = supabase.from('productos')

  if (proveedorId) {
    query = query.select(`*, producto_proveedor!inner(${PROVEEDORES_EMBEBIDOS})`).eq('producto_proveedor.proveedor_id', proveedorId)
  } else {
    query = query.select(`*, producto_proveedor(${PROVEEDORES_EMBEBIDOS})`)
  }

  if (busqueda) {
    query = query.ilike('nombre', `%${busqueda}%`)
  }
  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId)
  }

  const columnaOrden = ORDEN_COLUMNA[orden] ?? 'nombre'
  query = query.order(columnaOrden)

  const { data, error } = await query
  if (error) {
    throw new Error('No se pudieron cargar los productos')
  }
  return data.map(({ producto_proveedor: relaciones, ...producto }) => ({
    ...producto,
    proveedores: (relaciones ?? []).map((r) => ({
      id: r.proveedor_id,
      nombre: r.proveedores?.nombre ?? '',
      precio_venta: r.precio_venta,
      costo: r.costo
    }))
  }))
}

export async function obtenerProductoPorId (id) {
  const { data, error } = await supabase.from('productos').select('*').eq('id', id).single()
  if (error) {
    return null
  }
  return data
}

export async function crearProducto (datos) {
  const { data, error } = await supabase.from('productos').insert(datos).select().single()
  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya existe un producto con ese código')
    }
    throw new Error('No se pudo crear el producto')
  }
  return data
}

export async function actualizarProducto (id, cambios) {
  const { data, error } = await supabase.from('productos').update(cambios).eq('id', id).select().single()
  if (error) {
    throw new Error('No se pudo actualizar el producto')
  }
  return data
}

export async function borrarProducto (id) {
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) {
    throw new Error('No se pudo eliminar el producto')
  }
}

export async function subirImagenProducto (productoId, file) {
  const { error } = await supabase.storage.from('productos-imagenes').upload(productoId, file, { upsert: true })
  if (error) {
    throw new Error('No se pudo subir la imagen')
  }
  const { data } = supabase.storage.from('productos-imagenes').getPublicUrl(productoId)
  return data.publicUrl
}
