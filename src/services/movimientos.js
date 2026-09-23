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
