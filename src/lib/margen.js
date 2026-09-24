// Margen sobre la venta: de cada $100 que se vende, cuánto queda de ganancia.
export const MARGEN_BAJO = 15

function numero (valor) {
  if (valor === '' || valor == null) return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

export function calcularMargen (precio, costo) {
  const p = numero(precio)
  const c = numero(costo)
  if (p == null || c == null || p <= 0) return null

  const ganancia = Math.round((p - c) * 100) / 100
  const porcentaje = Math.round((ganancia / p) * 100)
  const nivel = ganancia < 0 ? 'negativo' : porcentaje < MARGEN_BAJO ? 'bajo' : 'ok'
  return { ganancia, porcentaje, nivel }
}
