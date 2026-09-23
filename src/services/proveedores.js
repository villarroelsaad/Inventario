import { supabase } from '../lib/supabaseClient.js'

export async function listarProveedores () {
  const { data, error } = await supabase.from('proveedores').select('*').order('nombre')
  if (error) {
    throw new Error('No se pudieron cargar los proveedores')
  }
  return data
}

export async function crearProveedor ({ nombre, contacto, notas }) {
  const { data, error } = await supabase
    .from('proveedores')
    .insert({ nombre, contacto, notas })
    .select()
    .single()
  if (error) {
    throw new Error('No se pudo crear el proveedor')
  }
  return data
}

export async function actualizarProveedor (id, cambios) {
  const { data, error } = await supabase.from('proveedores').update(cambios).eq('id', id).select().single()
  if (error) {
    throw new Error('No se pudo actualizar el proveedor')
  }
  return data
}

export async function borrarProveedor (id) {
  const { error } = await supabase.from('proveedores').delete().eq('id', id)
  if (error) {
    throw new Error('No se pudo eliminar el proveedor')
  }
}
