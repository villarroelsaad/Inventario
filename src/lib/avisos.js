const oyentes = new Set()

export function avisar (texto) {
  oyentes.forEach((oyente) => oyente(texto))
}

export function suscribirAvisos (oyente) {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}
