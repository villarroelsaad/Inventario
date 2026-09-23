import { supabase } from '../lib/supabaseClient.js'

export async function listarCategorias () {
  const { data, error } = await supabase.from('categorias').select('*').order('nombre')
  if (error) {
    throw new Error('No se pudieron cargar las categorías')
  }
  return data
}

export async function crearCategoria (nombre) {
  const { data, error } = await supabase.from('categorias').insert({ nombre }).select().single()
  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya existe una categoría con ese nombre')
    }
    throw new Error('No se pudo crear la categoría')
  }
  return data
}

export async function actualizarCategoria (id, nombre) {
  const { data, error } = await supabase.from('categorias').update({ nombre }).eq('id', id).select().single()
  if (error) {
    throw new Error('No se pudo actualizar la categoría')
  }
  return data
}

export async function borrarCategoria (id) {
  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) {
    throw new Error('No se pudo eliminar la categoría')
  }
}
