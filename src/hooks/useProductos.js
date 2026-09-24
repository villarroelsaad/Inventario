import { useCallback, useEffect, useRef, useState } from 'react'
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  borrarProducto,
  subirImagenProducto
} from '../services/productos.js'
import { reemplazarProveedoresDeProducto } from '../services/productoProveedor.js'
import { registrarMovimiento } from '../services/movimientos.js'

// cargarLista: false sirve para quien solo necesita crear/editar/borrar (sin pedir la lista a la base)
export function useProductos ({ cargarLista = true } = {}) {
  const [productos, setProductos] = useState([])
  const [filtros, setFiltros] = useState({})
  const [loading, setLoading] = useState(cargarLista)
  const [error, setError] = useState(null)

  // Si los filtros cambian rápido salen varias consultas a la vez; solo vale la
  // respuesta de la última, así una respuesta vieja que llega tarde no pisa la nueva.
  const ultimaConsulta = useRef(0)

  const cargar = useCallback(async (filtrosActuales) => {
    const consulta = ++ultimaConsulta.current
    setLoading(true)
    try {
      const datos = await listarProductos(filtrosActuales)
      if (consulta !== ultimaConsulta.current) return
      setProductos(datos)
      setError(null)
    } catch (err) {
      if (consulta !== ultimaConsulta.current) return
      setError(err.message)
    } finally {
      if (consulta === ultimaConsulta.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargarLista) cargar(filtros)
  }, [cargar, filtros, cargarLista])

  // Después de guardar, solo se refresca la lista si alguien la está usando
  const refrescar = useCallback(async () => {
    if (cargarLista) await cargar(filtros)
  }, [cargar, filtros, cargarLista])

  const crear = useCallback(async (datos, proveedores = [], imagenFile = null, cantidadInicial = 0) => {
    let nuevo = await crearProducto(datos)
    await reemplazarProveedoresDeProducto(nuevo.id, proveedores)
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
    await refrescar()
    return nuevo
  }, [refrescar])

  const actualizar = useCallback(async (id, cambios, proveedores = [], imagenFile = null) => {
    let actualizado = await actualizarProducto(id, cambios)
    await reemplazarProveedoresDeProducto(id, proveedores)
    if (imagenFile) {
      const url = await subirImagenProducto(id, imagenFile)
      actualizado = await actualizarProducto(id, { imagen_url: url })
    }
    await refrescar()
    return actualizado
  }, [refrescar])

  const borrar = useCallback(async (id) => {
    await borrarProducto(id)
    await refrescar()
  }, [refrescar])

  const recargar = useCallback(() => cargar(filtros), [cargar, filtros])

  return { productos, filtros, setFiltros, loading, error, crear, actualizar, borrar, recargar }
}
