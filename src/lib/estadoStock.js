// Estado de stock para mostrar (color + texto). Solo presentación: la regla de
// "stock bajo" sigue siendo stock < stock_minimo, igual que en el resto de la app.
export function estadoStock (producto) {
  if (producto.stock <= 0) return { clave: 'sin', texto: 'Sin stock' }
  if (producto.stock < producto.stock_minimo) return { clave: 'bajo', texto: 'Bajo' }
  return { clave: 'ok', texto: 'Normal' }
}
