import { useCallback, useEffect, useState } from 'react'
import { listarCategorias, crearCategoria, actualizarCategoria, borrarCategoria } from '../services/categorias.js'

export function useCategorias () {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      setCategorias(await listarCategorias())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = useCallback(async (nombre) => {
    const nueva = await crearCategoria(nombre)
    await cargar()
    return nueva
  }, [cargar])

  const actualizar = useCallback(async (id, nombre) => {
    const actualizada = await actualizarCategoria(id, nombre)
    await cargar()
    return actualizada
  }, [cargar])

  const borrar = useCallback(async (id) => {
    await borrarCategoria(id)
    await cargar()
  }, [cargar])

  return { categorias, loading, error, crear, actualizar, borrar }
}
