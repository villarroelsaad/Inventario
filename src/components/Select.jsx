import { useEffect, useId, useRef, useState } from 'react'
import Icono from './Icono.jsx'

// Desplegable propio (no usa <select> nativo): en Linux, Chrome pinta la lista de un
// <select> con el widget nativo de GTK, que sigue el tema oscuro del sistema operativo
// aunque la página esté en modo claro. Dibujando la lista nosotros mismos se ve siempre
// igual, en cualquier navegador/SO.
export default function Select ({ id, ariaLabel, value, onChange, options, className }) {
  const [abierto, setAbierto] = useState(false)
  const [indiceActivo, setIndiceActivo] = useState(0)
  const raiz = useRef(null)
  const idBase = useId()

  const indiceSeleccionado = Math.max(0, options.findIndex((o) => String(o.value) === String(value ?? '')))
  const opcionActual = options[indiceSeleccionado] ?? options[0]

  useEffect(() => {
    if (!abierto) return
    setIndiceActivo(indiceSeleccionado)

    function alHacerClicAfuera (e) {
      if (raiz.current && !raiz.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', alHacerClicAfuera)
    return () => document.removeEventListener('mousedown', alHacerClicAfuera)
  }, [abierto, indiceSeleccionado])

  function elegir (opcion) {
    onChange(opcion.value)
    setAbierto(false)
  }

  function alPresionarTecla (e) {
    if (!abierto) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setAbierto(true)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceActivo((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceActivo((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      elegir(options[indiceActivo])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setAbierto(false)
    }
  }

  return (
    <div className={className ? `ui-select ${className}` : 'ui-select'} ref={raiz}>
      <button
        type="button"
        id={id}
        className="ui-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-activedescendant={abierto ? `${idBase}-${indiceActivo}` : undefined}
        onClick={() => setAbierto((a) => !a)}
        onKeyDown={alPresionarTecla}
      >
        <span className="ui-select-valor">{opcionActual?.label}</span>
        <Icono nombre="chevron" className="ui-select-icono" />
      </button>

      {abierto && (
        <ul className="ui-select-lista" role="listbox" aria-label={ariaLabel}>
          {options.map((opcion, indice) => (
            <li
              key={opcion.value}
              id={`${idBase}-${indice}`}
              role="option"
              aria-selected={indice === indiceSeleccionado}
              className={indice === indiceActivo ? 'ui-select-opcion activa' : 'ui-select-opcion'}
              onMouseEnter={() => setIndiceActivo(indice)}
              onClick={() => elegir(opcion)}
            >
              {opcion.label}
              {indice === indiceSeleccionado && <Icono nombre="check" className="ui-select-check" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
