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

  if (editando !== null) {
    return (
      <CategoryForm
        categoria={editando.id ? editando : undefined}
        onSave={handleSave}
        onCancel={() => setEditando(null)}
        disabled={guardando}
      />
    )
  }

  return (
    <section className="category-list">
      <h1>Categorías</h1>
      {loading && <p>Cargando...</p>}
      {error && <p className="login-error">{error}</p>}
      <ul>
        {categorias.map((categoria) => (
          <li key={categoria.id}>
            <button type="button" onClick={() => setEditando(categoria)}>{categoria.nombre}</button>
            <button type="button" onClick={() => handleDelete(categoria)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setEditando({})}>+ Agregar categoría</button>
    </section>
  )
}
