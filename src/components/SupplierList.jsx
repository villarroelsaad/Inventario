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

  if (editando !== null) {
    return (
      <SupplierForm
        proveedor={editando.id ? editando : undefined}
        onSave={handleSave}
        onCancel={() => setEditando(null)}
        disabled={guardando}
      />
    )
  }

  return (
    <section className="supplier-list">
      <h1>Proveedores</h1>
      {loading && <p>Cargando...</p>}
      {error && <p className="login-error">{error}</p>}
      <ul>
        {proveedores.map((proveedor) => (
          <li key={proveedor.id}>
            <button type="button" onClick={() => setEditando(proveedor)}>{proveedor.nombre}</button>
            <button type="button" onClick={() => handleDelete(proveedor)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setEditando({})}>+ Agregar proveedor</button>
    </section>
  )
}
