import { useState } from 'react'
import { avisar } from '../lib/avisos.js'
import { useCategorias } from '../hooks/useCategorias.js'
import CategoryForm from './CategoryForm.jsx'
import ModalAnimado from './ModalAnimado.jsx'

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
      avisar('Categoría guardada')
      setEditando(null)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDelete (categoria) {
    const confirmado = window.confirm(`¿Seguro que querés eliminar ${categoria.nombre}? No se puede deshacer.`)
    if (confirmado) {
      await borrar(categoria.id)
      avisar('Categoría eliminada')
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

      {loading && <p className="cargando">Cargando...</p>}
      {error && <p className="login-error">{error}</p>}
      {!loading && !error && categorias.length === 0 && (
        <p className="vacio">Todavía no hay categorías. Tocá “Agregar categoría” para sumar la primera.</p>
      )}
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

      <ModalAnimado abierto={editando !== null} onCerrar={() => setEditando(null)}>
        {editando !== null && (
          <CategoryForm
            categoria={editando.id ? editando : undefined}
            onSave={handleSave}
            onCancel={() => setEditando(null)}
            disabled={guardando}
          />
        )}
      </ModalAnimado>
    </section>
  )
}
