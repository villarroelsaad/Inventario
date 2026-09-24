import { useEffect, useState } from 'react'
import { suscribirAvisos } from '../lib/avisos.js'
import Icono from './Icono.jsx'

const DURACION_MS = 2800
const SALIDA_MS = 250

export default function Avisos () {
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    let temporizadorSalida
    let temporizadorFin
    const desuscribir = suscribirAvisos((texto) => {
      clearTimeout(temporizadorSalida)
      clearTimeout(temporizadorFin)
      setAviso({ texto, id: Date.now(), saliendo: false })
      temporizadorSalida = setTimeout(() => setAviso((a) => a && { ...a, saliendo: true }), DURACION_MS)
      temporizadorFin = setTimeout(() => setAviso(null), DURACION_MS + SALIDA_MS)
    })
    return () => {
      clearTimeout(temporizadorSalida)
      clearTimeout(temporizadorFin)
      desuscribir()
    }
  }, [])

  return (
    <div className="avisos" role="status" aria-live="polite">
      {aviso && (
        <p key={aviso.id} className={aviso.saliendo ? 'aviso saliendo' : 'aviso'}>
          <Icono nombre="check" />
          {aviso.texto}
        </p>
      )}
    </div>
  )
}
