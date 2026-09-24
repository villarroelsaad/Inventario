import { useEffect, useState } from 'react'

const CLAVE = 'tema'

function obtenerPreferenciaSistema () {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function leerTemaGuardado () {
  try {
    return localStorage.getItem(CLAVE)
  } catch {
    return null
  }
}

export function useTema () {
  const [temaGuardado, setTemaGuardado] = useState(leerTemaGuardado)
  const [temaSistema, setTemaSistema] = useState(obtenerPreferenciaSistema)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setTemaSistema(obtenerPreferenciaSistema())
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const temaEfectivo = temaGuardado ?? temaSistema

  useEffect(() => {
    if (temaGuardado) {
      document.documentElement.dataset.theme = temaGuardado
    } else {
      delete document.documentElement.dataset.theme
    }
  }, [temaGuardado])

  function alternarTema () {
    const siguiente = temaEfectivo === 'dark' ? 'light' : 'dark'
    // Solo mientras dura el cambio, todos los colores se deslizan (ver .tema-cambiando en index.css)
    const raiz = document.documentElement
    raiz.classList.add('tema-cambiando')
    setTimeout(() => raiz.classList.remove('tema-cambiando'), 350)
    try {
      localStorage.setItem(CLAVE, siguiente)
    } catch {
      // sin localStorage disponible el tema no persiste, pero sigue funcionando en esta sesión
    }
    setTemaGuardado(siguiente)
  }

  return { temaEfectivo, alternarTema }
}
