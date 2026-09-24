import { useState } from 'react'

export default function CategoryForm ({ categoria, onSave, onCancel }) {
  const [nombre, setNombre] = useState(categoria?.nombre ?? '')

  function handleSubmit (event) {
    event.preventDefault()
    onSave(nombre)
  }

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <h1>{categoria ? 'Editar categoría' : 'Nueva categoría'}</h1>
      <label htmlFor="categoria-nombre">Nombre</label>
      <input
        id="categoria-nombre"
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  )
}
