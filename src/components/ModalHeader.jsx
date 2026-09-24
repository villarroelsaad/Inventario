import Icono from './Icono.jsx'

// Cabecera común de las hojas/modales: ícono en badge de color, título, bajada
// corta y botón para cerrar arriba a la derecha.
export default function ModalHeader ({ icono, tono = 'azul', titulo, bajada, onClose, cerrarLabel = 'Cerrar' }) {
  return (
    <header className="hoja-cabecera">
      <span className={`hoja-badge tono-${tono}`}>
        <Icono nombre={icono} />
      </span>
      <div className="hoja-titulos">
        <h1>{titulo}</h1>
        {bajada && <p>{bajada}</p>}
      </div>
      {onClose && (
        <button type="button" className="hoja-cerrar" onClick={onClose} aria-label={cerrarLabel}>
          <Icono nombre="cerrar" />
        </button>
      )}
    </header>
  )
}
