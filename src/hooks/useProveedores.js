import { useCallback, useEffect, useState } from 'react'
import { listarProveedores, crearProveedor, actualizarProveedor, borrarProveedor } from '../services/proveedores.js'

export function useProveedores () {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      setProveedores(await listarProveedores())
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

  const crear = useCallback(async (datos) => {
    const nuevo = await crearProveedor(datos)
    await cargar()
    return nuevo
  }, [cargar])

  const actualizar = useCallback(async (id, cambios) => {
    const actualizado = await actualizarProveedor(id, cambios)
    await cargar()
    return actualizado
  }, [cargar])

  const borrar = useCallback(async (id) => {
    await borrarProveedor(id)
    await cargar()
  }, [cargar])

  return { proveedores, loading, error, crear, actualizar, borrar }
}
