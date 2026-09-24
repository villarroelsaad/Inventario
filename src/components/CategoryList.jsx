import { useState } from 'react'
import { useCategorias } from '../hooks/useCategorias.js'
import CategoryForm from './CategoryForm.jsx'

export default function CategoryList () {
  const { categorias, loading, error, crear, actualizar, borrar } = useCategorias()
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nueva, {id,...} = editar
  const [guardando, setGuardando] = useState(false)

  async function handleSave (nombre) {
    setGuardando(true)
    try {
      if (editando?.id) {
        await actualizar(editando.id, nombre)
      } else {
        await crear(nombre)
      }
      setEditando(null)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDelete (categoria) {
    const confirmado = window.confirm(`¿Seguro que querés eliminar ${categoria.nombre}? No se puede deshacer.`)
    if (confirmado) {
      await borrar(categoria.id)
    }
  }

  return (
    <section className="category-list">
      <div className="list-header">
        <h1>Categorías</h1>
        <button type="button" onClick={() => setEditando({})} className="btn-agregar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Agregar categoría
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="login-error">{error}</p>}
      <ul>
        {categorias.map((categoria) => (
          <li key={categoria.id}>
            <button type="button" onClick={() => setEditando(categoria)}>
              <span className="product-thumb">{categoria.nombre.charAt(0).toUpperCase()}</span>
              {categoria.nombre}
            </button>
            <button type="button" onClick={() => handleDelete(categoria)}>Eliminar</button>
          </li>
        ))}
      </ul>

      {editando !== null && (
        <div className="modal-backdrop abierto" onClick={(e) => { if (e.target === e.currentTarget) setEditando(null) }}>
          <div className="modal-card">
            <CategoryForm
              categoria={editando.id ? editando : undefined}
              onSave={handleSave}
              onCancel={() => setEditando(null)}
              disabled={guardando}
            />
          </div>
        </div>
      )}
    </section>
  )
}
