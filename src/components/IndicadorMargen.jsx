import { calcularMargen } from '../lib/margen.js'

function pesos (valor) {
  return `$${Math.abs(valor).toLocaleString('es-AR')}`
}

export default function IndicadorMargen ({ precio, costo }) {
  const margen = calcularMargen(precio, costo)
  if (!margen) return null

  const texto = margen.ganancia < 0
    ? `Perdés ${pesos(margen.ganancia)} por unidad (${margen.porcentaje}%)`
    : `Ganás ${pesos(margen.ganancia)} por unidad (${margen.porcentaje}%)`

  return <p className={`indicador-margen margen-${margen.nivel}`}>{texto}</p>
}
