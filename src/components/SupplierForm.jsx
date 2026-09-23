import { useState } from 'react'

export default function SupplierForm ({ proveedor, onSave, onCancel }) {
  const [nombre, setNombre] = useState(proveedor?.nombre ?? '')
  const [contacto, setContacto] = useState(proveedor?.contacto ?? '')
  const [notas, setNotas] = useState(proveedor?.notas ?? '')

  function handleSubmit (event) {
    event.preventDefault()
    onSave({ nombre, contacto, notas })
  }

  return (
    <form onSubmit={handleSubmit} className="supplier-form">
      <label htmlFor="proveedor-nombre">Nombre</label>
      <input
        id="proveedor-nombre"
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <label htmlFor="proveedor-contacto">Contacto</label>
      <input
        id="proveedor-contacto"
        type="text"
        value={contacto}
        onChange={(e) => setContacto(e.target.value)}
      />

      <label htmlFor="proveedor-notas">Notas</label>
      <input
        id="proveedor-notas"
        type="text"
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
      />

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  )
}
