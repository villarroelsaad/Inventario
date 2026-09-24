import { supabase } from '../lib/supabaseClient.js'

export async function listarProveedoresDeProducto (productoId) {
  const { data, error } = await supabase
    .from('producto_proveedor')
    .select('proveedor_id, precio_venta, costo, proveedores (id, nombre)')
    .eq('producto_id', productoId)

  if (error) {
    throw new Error('No se pudieron cargar los proveedores del producto')
  }
  return data.map((fila) => ({ ...fila.proveedores, precio_venta: fila.precio_venta, costo: fila.costo }))
}

export async function reemplazarProveedoresDeProducto (productoId, items) {
  const { error: errorBorrar } = await supabase
    .from('producto_proveedor')
    .delete()
    .eq('producto_id', productoId)

  if (errorBorrar) {
    throw new Error('No se pudieron actualizar los proveedores del producto')
  }

  if (items.length === 0) {
    return
  }

  const filas = items.map(({ proveedorId, precioVenta, costo }) => ({
    producto_id: productoId,
    proveedor_id: proveedorId,
    precio_venta: precioVenta ?? null,
    costo: costo ?? null
  }))
  const { error: errorInsertar } = await supabase.from('producto_proveedor').insert(filas)

  if (errorInsertar) {
    throw new Error('No se pudieron actualizar los proveedores del producto')
  }
}
