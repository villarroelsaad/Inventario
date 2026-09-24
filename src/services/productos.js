import { supabase } from '../lib/supabaseClient.js'

const ORDEN_COLUMNA = {
  nombre: 'nombre',
  precio: 'precio_venta',
  cantidad: 'stock',
  reciente: 'created_at'
}

export async function listarProductos ({ busqueda, categoriaId, proveedorId, precioMin, precioMax, orden } = {}) {
  let query = supabase.from('productos')

  if (proveedorId) {
    query = query.select('*, producto_proveedor!inner(proveedor_id)').eq('producto_proveedor.proveedor_id', proveedorId)
  } else {
    query = query.select('*')
  }

  if (busqueda) {
    query = query.ilike('nombre', `%${busqueda}%`)
  }
  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId)
  }
  if (precioMin != null) {
    query = query.gte('precio_venta', precioMin)
  }
  if (precioMax != null) {
    query = query.lte('precio_venta', precioMax)
  }

  const columnaOrden = ORDEN_COLUMNA[orden] ?? 'nombre'
  query = query.order(columnaOrden)

  const { data, error } = await query
  if (error) {
    throw new Error('No se pudieron cargar los productos')
  }
  return data.map(({ producto_proveedor, ...producto }) => producto)
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
