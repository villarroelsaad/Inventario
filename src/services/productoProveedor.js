import { supabase } from '../lib/supabaseClient.js'

export async function listarProveedoresDeProducto (productoId) {
  const { data, error } = await supabase
    .from('producto_proveedor')
    .select('proveedor_id, proveedores (id, nombre)')
    .eq('producto_id', productoId)

  if (error) {
    throw new Error('No se pudieron cargar los proveedores del producto')
  }
  return data.map((fila) => fila.proveedores)
}

export async function reemplazarProveedoresDeProducto (productoId, proveedorIds) {
  const { error: errorBorrar } = await supabase
    .from('producto_proveedor')
    .delete()
    .eq('producto_id', productoId)

  if (errorBorrar) {
    throw new Error('No se pudieron actualizar los proveedores del producto')
  }

  if (proveedorIds.length === 0) {
    return
  }

  const filas = proveedorIds.map((proveedorId) => ({ producto_id: productoId, proveedor_id: proveedorId }))
  const { error: errorInsertar } = await supabase.from('producto_proveedor').insert(filas)

  if (errorInsertar) {
    throw new Error('No se pudieron actualizar los proveedores del producto')
  }
}
