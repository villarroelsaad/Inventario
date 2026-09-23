import { useState } from 'react'
import { useCategorias } from '../hooks/useCategorias.js'
import { useProveedores } from '../hooks/useProveedores.js'

export default function ProductForm ({ producto, proveedoresSeleccionados = [], onSave, onCancel }) {
  const { categorias } = useCategorias()
  const { proveedores } = useProveedores()

  const [id, setId] = useState(producto?.id ?? '')
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id ?? '')
  const [precioVenta, setPrecioVenta] = useState(producto?.precio_venta ?? '')
  const [costo, setCosto] = useState(producto?.costo ?? '')
  const [stockMinimo, setStockMinimo] = useState(producto?.stock_minimo ?? '')
  const [cantidadInicial, setCantidadInicial] = useState('')
  const [proveedorIds, setProveedorIds] = useState(proveedoresSeleccionados)
  const [imagenFile, setImagenFile] = useState(null)

  function toggleProveedor (proveedorId) {
    setProveedorIds((actuales) =>
      actuales.includes(proveedorId)
        ? actuales.filter((p) => p !== proveedorId)
        : [...actuales, proveedorId]
    )
  }

  function handleSubmit (event) {
    event.preventDefault()
    onSave(
      {
        id,
        nombre,
        categoria_id: categoriaId,
        precio_venta: Number(precioVenta),
        costo: Number(costo),
        stock_minimo: Number(stockMinimo)
      },
      proveedorIds,
      imagenFile,
      Number(cantidadInicial) || 0
    )
  }

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <label htmlFor="producto-id">Código</label>
      <input
        id="producto-id"
        type="text"
        value={id}
        onChange={(e) => setId(e.target.value)}
        disabled={Boolean(producto)}
        required
      />

      <label htmlFor="producto-nombre">Nombre</label>
      <input
        id="producto-nombre"
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <label htmlFor="producto-categoria">Categoría</label>
      <select id="producto-categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
        <option value="">Sin categoría</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>

      <label htmlFor="producto-precio">Precio de venta</label>
      <input
        id="producto-precio"
        type="number"
        step="0.01"
        value={precioVenta}
        onChange={(e) => setPrecioVenta(e.target.value)}
      />

      <label htmlFor="producto-costo">Costo</label>
      <input
        id="producto-costo"
        type="number"
        step="0.01"
        value={costo}
        onChange={(e) => setCosto(e.target.value)}
      />

      <label htmlFor="producto-stock-minimo">Stock mínimo</label>
      <input
        id="producto-stock-minimo"
        type="number"
        value={stockMinimo}
        onChange={(e) => setStockMinimo(e.target.value)}
      />

      {!producto && (
        <>
          <label htmlFor="producto-cantidad-inicial">Cantidad inicial</label>
          <input
            id="producto-cantidad-inicial"
            type="number"
            min="0"
            value={cantidadInicial}
            onChange={(e) => setCantidadInicial(e.target.value)}
          />
        </>
      )}

      <label htmlFor="producto-imagen">Foto (opcional)</label>
      <input
        id="producto-imagen"
        type="file"
        accept="image/*"
        onChange={(e) => setImagenFile(e.target.files[0] ?? null)}
      />

      <fieldset className="product-form-proveedores">
        <legend>Proveedores</legend>
        {proveedores.map((p) => (
          <label key={p.id} className="checkbox-label">
            <input
              type="checkbox"
              checked={proveedorIds.includes(p.id)}
              onChange={() => toggleProveedor(p.id)}
            />
            {p.nombre}
          </label>
        ))}
      </fieldset>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  )
}
