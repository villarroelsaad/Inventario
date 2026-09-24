import { useState } from 'react'
import ModalHeader from './ModalHeader.jsx'
import Icono from './Icono.jsx'

export default function CategoryForm ({ categoria, onSave, onCancel }) {
  const [nombre, setNombre] = useState(categoria?.nombre ?? '')

  function handleSubmit (event) {
    event.preventDefault()
    onSave(nombre)
  }

  return (
    <form onSubmit={handleSubmit} className="category-form hoja">
      <ModalHeader
        icono="categoria"
        titulo={categoria ? 'Editar categoría' : 'Nueva categoría'}
        bajada="Sirve para agrupar productos parecidos."
        onClose={onCancel}
      />

      <div className="hoja-cuerpo">
        <label htmlFor="categoria-nombre">Nombre</label>
        <div className="campo-icono">
          <Icono nombre="texto" />
          <input
            id="categoria-nombre"
            type="text"
            placeholder="Ej.: Bebidas"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
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
