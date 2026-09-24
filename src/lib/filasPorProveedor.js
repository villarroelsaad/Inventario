// Cada combinación producto + proveedor se muestra como una fila aparte, con el
// precio y costo de ese proveedor. El stock es del producto y se comparte.

export function precioDeFila (fila) {
  return fila.proveedor?.precio_venta ?? fila.precio_venta ?? null
}

export function costoDeFila (fila) {
  return fila.proveedor?.costo ?? fila.costo ?? null
}

export function filasPorProveedor (productos, { precioMin, precioMax, orden } = {}) {
  let filas = productos.flatMap((producto) => {
    const proveedores = producto.proveedores ?? []
    if (proveedores.length === 0) {
      return [{ ...producto, proveedor: null, clave: producto.id }]
    }
    return proveedores.map((proveedor) => ({
      ...producto,
      proveedor,
      clave: `${producto.id}::${proveedor.id}`
    }))
  })

  if (precioMin != null || precioMax != null) {
    filas = filas.filter((fila) => {
      const precio = precioDeFila(fila)
      if (precio == null) return false
      if (precioMin != null && precio < precioMin) return false
      if (precioMax != null && precio > precioMax) return false
      return true
    })
  }

  if (orden === 'precio') {
    filas = [...filas].sort((a, b) => (precioDeFila(a) ?? Infinity) - (precioDeFila(b) ?? Infinity))
  }

  return filas
}
