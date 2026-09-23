import { useCallback, useEffect, useState } from 'react'
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  borrarProducto,
  subirImagenProducto
} from '../services/productos.js'
import { reemplazarProveedoresDeProducto } from '../services/productoProveedor.js'
import { registrarMovimiento } from '../services/movimientos.js'

export function useProductos () {
  const [productos, setProductos] = useState([])
  const [filtros, setFiltros] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async (filtrosActuales) => {
    setLoading(true)
    try {
      setProductos(await listarProductos(filtrosActuales))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar(filtros)
  }, [cargar, filtros])

  const crear = useCallback(async (datos, proveedorIds = [], imagenFile = null, cantidadInicial = 0) => {
    let nuevo = await crearProducto(datos)
    await reemplazarProveedoresDeProducto(nuevo.id, proveedorIds)
    if (imagenFile) {
      const url = await subirImagenProducto(nuevo.id, imagenFile)
      nuevo = await actualizarProducto(nuevo.id, { imagen_url: url })
    }
    if (cantidadInicial > 0) {
      await registrarMovimiento({
        productoId: nuevo.id,
        tipo: 'entrada',
        cantidad: cantidadInicial,
        motivo: 'Alta inicial'
      })
    }
    await cargar(filtros)
    return nuevo
  }, [cargar, filtros])

  const actualizar = useCallback(async (id, cambios, proveedorIds = [], imagenFile = null) => {
    let actualizado = await actualizarProducto(id, cambios)
    await reemplazarProveedoresDeProducto(id, proveedorIds)
    if (imagenFile) {
      const url = await subirImagenProducto(id, imagenFile)
      actualizado = await actualizarProducto(id, { imagen_url: url })
    }
    await cargar(filtros)
    return actualizado
  }, [cargar, filtros])

  const borrar = useCallback(async (id) => {
    await borrarProducto(id)
    await cargar(filtros)
  }, [cargar, filtros])

  return { productos, filtros, setFiltros, loading, error, crear, actualizar, borrar }
}
