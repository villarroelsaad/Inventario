import { useState } from 'react'
import ModalHeader from './ModalHeader.jsx'
import Icono from './Icono.jsx'

export default function SupplierForm ({ proveedor, onSave, onCancel }) {
  const [nombre, setNombre] = useState(proveedor?.nombre ?? '')
  const [contacto, setContacto] = useState(proveedor?.contacto ?? '')
  const [notas, setNotas] = useState(proveedor?.notas ?? '')

  function handleSubmit (event) {
    event.preventDefault()
    onSave({ nombre, contacto, notas })
  }

  return (
    <form onSubmit={handleSubmit} className="supplier-form hoja">
      <ModalHeader
        icono="proveedor"
        titulo={proveedor ? 'Editar proveedor' : 'Nuevo proveedor'}
        bajada="Guardá cómo contactarlo y cualquier dato útil."
        onClose={onCancel}
      />

      <div className="hoja-cuerpo">
        <label htmlFor="proveedor-nombre">Nombre</label>
        <div className="campo-icono">
          <Icono nombre="proveedor" />
          <input
            id="proveedor-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <label htmlFor="proveedor-contacto">Contacto</label>
        <div className="campo-icono">
          <Icono nombre="telefono" />
          <input
            id="proveedor-contacto"
            type="text"
            placeholder="Teléfono, mail o nombre"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
          />
        </div>

        <label htmlFor="proveedor-notas">Notas</label>
        <div className="campo-icono">
          <Icono nombre="nota" />
          <input
            id="proveedor-notas"
            type="text"
            placeholder="Ej.: entrega los lunes"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  )
}
