import { precioDeFila, costoDeFila } from '../lib/filasPorProveedor.js'
import { calcularMargen } from '../lib/margen.js'

const ENCABEZADO = ['Código', 'Nombre', 'Categoría', 'Proveedor', 'Precio de venta', 'Costo', 'Ganancia por unidad', 'Margen %', 'Stock', 'Stock mínimo']

function escaparCampoCsv (valor) {
  const texto = valor == null ? '' : String(valor)
  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}

export function generarCsvProductos (productos, categorias = []) {
  const nombrePorCategoria = new Map(categorias.map((c) => [c.id, c.nombre]))

  const filas = productos.map((p) => {
    const margen = calcularMargen(precioDeFila(p), costoDeFila(p))
    return [
    p.id,
    p.nombre,
    nombrePorCategoria.get(p.categoria_id) ?? '',
    p.proveedor?.nombre ?? '',
    precioDeFila(p),
    costoDeFila(p),
    margen?.ganancia,
    margen?.porcentaje,
    p.stock,
    p.stock_minimo
    ]
  })

  return [ENCABEZADO, ...filas]
    .map((fila) => fila.map(escaparCampoCsv).join(','))
    .join('\n')
}

export function descargarCsv (nombreArchivo, contenidoCsv) {
  const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}
