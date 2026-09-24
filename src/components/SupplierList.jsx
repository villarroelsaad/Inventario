import { useState } from 'react'
import { useProveedores } from '../hooks/useProveedores.js'
import SupplierForm from './SupplierForm.jsx'

export default function SupplierList () {
  const { proveedores, loading, error, crear, actualizar, borrar } = useProveedores()
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nuevo, {id,...} = editar
  const [guardando, setGuardando] = useState(false)

  async function handleSave (datos) {
    setGuardando(true)
    try {
      if (editando?.id) {
        await actualizar(editando.id, datos)
      } else {
        await crear(datos)
      }
      setEditando(null)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDelete (proveedor) {
    const confirmado = window.confirm(`¿Seguro que querés eliminar ${proveedor.nombre}? No se puede deshacer.`)
    if (confirmado) {
      await borrar(proveedor.id)
    }
  }

  return (
    <section className="supplier-list">
      <div className="list-header">
        <h1>Proveedores</h1>
        <button type="button" onClick={() => setEditando({})} className="btn-agregar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Agregar proveedor
        </button>
      </div>

      {loading && <p className="cargando">Cargando...</p>}
      {error && <p className="login-error">{error}</p>}
      {!loading && !error && proveedores.length === 0 && (
        <p className="vacio">Todavía no hay proveedores. Tocá “Agregar proveedor” para sumar el primero.</p>
      )}
      <ul>
        {proveedores.map((proveedor) => (
          <li key={proveedor.id}>
            <button type="button" onClick={() => setEditando(proveedor)}>
              <span className="product-thumb">{proveedor.nombre.charAt(0).toUpperCase()}</span>
              {proveedor.nombre}
            </button>
            <button type="button" onClick={() => handleDelete(proveedor)}>Eliminar</button>
          </li>
        ))}
      </ul>

      {editando !== null && (
        <div className="modal-backdrop abierto" onClick={(e) => { if (e.target === e.currentTarget) setEditando(null) }}>
          <div className="modal-card">
            <SupplierForm
              proveedor={editando.id ? editando : undefined}
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
