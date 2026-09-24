import { useEffect, useRef, useState } from 'react'

const SALIDA_MS = 200

// Fondo oscuro + tarjeta flotante. Al cerrarse sigue mostrando el último contenido
// mientras dura la animación de salida, así no hace falta demorar cada forma de cerrar.
export default function ModalAnimado ({ abierto, onCerrar, children }) {
  const [visible, setVisible] = useState(abierto)
  const [cerrando, setCerrando] = useState(false)
  const ultimoContenido = useRef(children)

  if (abierto) {
    ultimoContenido.current = children
  }

  useEffect(() => {
    if (abierto) {
      setVisible(true)
      setCerrando(false)
      return
    }
    setCerrando(true)
    const temporizador = setTimeout(() => {
      setVisible(false)
      setCerrando(false)
    }, SALIDA_MS)
    return () => clearTimeout(temporizador)
  }, [abierto])

  if (!abierto && !visible) {
    return null
  }

  return (
    <div
      className={cerrando ? 'modal-backdrop abierto cerrando' : 'modal-backdrop abierto'}
      onClick={(e) => { if (e.target === e.currentTarget && !cerrando) onCerrar?.() }}
    >
      <div className="modal-card">{abierto ? children : ultimoContenido.current}</div>
    </div>
  )
}
