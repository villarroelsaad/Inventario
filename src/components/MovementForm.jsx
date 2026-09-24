import { useState } from 'react'

export default function MovementForm ({ producto, tipo, error, onSave, onCancel }) {
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')

  const titulo = tipo === 'entrada' ? 'Registrar entrada' : 'Registrar salida'
  const superaStock = tipo === 'salida' && Number(cantidad) > producto.stock

  function handleSubmit (event) {
    event.preventDefault()
    if (superaStock) {
      return
    }
    onSave(Number(cantidad), motivo.trim() ? motivo.trim() : null)
  }

  return (
    <form onSubmit={handleSubmit} className="movement-form">
      <h1>{titulo}</h1>
      <p className="movement-form-producto">
        {producto.nombre} — stock actual: {producto.stock}
      </p>

      <label htmlFor="movimiento-cantidad">Cantidad</label>
      <input
        id="movimiento-cantidad"
        type="number"
        min="1"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        required
      />

      <label htmlFor="movimiento-motivo">Motivo (opcional)</label>
      <input
        id="movimiento-motivo"
        type="text"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
      />

      {superaStock && <p className="login-error">No hay stock suficiente</p>}
      {error && <p className="login-error">{error}</p>}

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  )
}
