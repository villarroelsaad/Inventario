import { useEffect, useState } from 'react'
import { suscribirAvisos } from '../lib/avisos.js'
import Icono from './Icono.jsx'

const DURACION_MS = 2800

export default function Avisos () {
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    let temporizador
    const desuscribir = suscribirAvisos((texto) => {
      clearTimeout(temporizador)
      setAviso({ texto, id: Date.now() })
      temporizador = setTimeout(() => setAviso(null), DURACION_MS)
    })
    return () => {
      clearTimeout(temporizador)
      desuscribir()
    }
  }, [])

  return (
    <div className="avisos" role="status" aria-live="polite">
      {aviso && (
        <p key={aviso.id} className="aviso">
          <Icono nombre="check" />
          {aviso.texto}
        </p>
      )}
    </div>
  )
}
