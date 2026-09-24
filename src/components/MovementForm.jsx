import { useState } from 'react'
import ModalHeader from './ModalHeader.jsx'
import Icono from './Icono.jsx'

export default function MovementForm ({ producto, tipo, error, onSave, onCancel }) {
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')

  const esEntrada = tipo === 'entrada'
  const titulo = esEntrada ? 'Registrar entrada' : 'Registrar salida'
  const cantidadNumero = Number(cantidad)
  const superaStock = tipo === 'salida' && cantidadNumero > producto.stock
  const stockResultante = esEntrada ? producto.stock + cantidadNumero : producto.stock - cantidadNumero

  // Con la función de actualización, dos toques muy seguidos suman 2 y no 1.
  function sumar () {
    setCantidad((actual) => String((Number(actual) || 0) + 1))
  }

  function restar () {
    setCantidad((actual) => (Number(actual) > 1 ? String(Number(actual) - 1) : actual))
  }

  function handleSubmit (event) {
    event.preventDefault()
    if (superaStock) {
      return
    }
    onSave(Number(cantidad), motivo.trim() ? motivo.trim() : null)
  }

  return (
    <form onSubmit={handleSubmit} className={`movement-form hoja ${esEntrada ? 'es-entrada' : 'es-salida'}`}>
      <ModalHeader
        icono={esEntrada ? 'entrada' : 'salida'}
        tono={esEntrada ? 'verde' : 'rojo'}
        titulo={titulo}
        bajada={esEntrada ? 'Sumá las unidades que ingresaron.' : 'Descontá las unidades que salieron.'}
        onClose={onCancel}
      />

      <div className="hoja-cuerpo">
        <div className="movimiento-producto">
          <span className="product-thumb">{producto.nombre.charAt(0).toUpperCase()}</span>
          <span className="movimiento-producto-nombre">{producto.nombre}</span>
          <span className="movimiento-producto-stock">
            <span className="etiqueta">Stock actual</span>
            <span className="numero">{producto.stock}</span>
          </span>
        </div>

        <label htmlFor="movimiento-cantidad">Cantidad</label>
        <div className="stepper">
          <button type="button" onClick={restar} aria-label="Restar uno" disabled={!(cantidadNumero > 1)}>
            <Icono nombre="menos" />
          </button>
          <input
            id="movimiento-cantidad"
            type="number"
            min="1"
            inputMode="numeric"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
          />
          <button type="button" onClick={sumar} aria-label="Sumar uno">
            <Icono nombre="mas" />
          </button>
        </div>

        {cantidadNumero > 0 && !superaStock && (
          <p className="movimiento-resultado">
            El stock va a quedar en <strong>{stockResultante}</strong>
          </p>
        )}
        {superaStock && <p className="login-error">No hay stock suficiente</p>}

        <label htmlFor="movimiento-motivo">Motivo (opcional)</label>
        <div className="campo-icono">
          <Icono nombre="nota" />
          <input
            id="movimiento-motivo"
            type="text"
            placeholder={esEntrada ? 'Ej.: compra al proveedor' : 'Ej.: venta'}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        {error && <p className="login-error">{error}</p>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  )
}
