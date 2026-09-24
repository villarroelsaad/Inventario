import { supabase } from '../lib/supabaseClient.js'

export async function registrarMovimiento ({ productoId, tipo, cantidad, motivo }) {
  const { error } = await supabase.rpc('registrar_movimiento', {
    p_producto_id: productoId,
    p_tipo: tipo,
    p_cantidad: cantidad,
    p_motivo: motivo
  })
  if (error) {
    throw new Error(error.message)
  }
}

export async function listarMovimientosPorProducto (productoId) {
  const { data, error } = await supabase
    .from('movimientos')
    .select('*')
    .eq('producto_id', productoId)
    .order('fecha', { ascending: false })
  if (error) {
    throw new Error('No se pudo cargar el historial de movimientos')
  }
  return data
}
