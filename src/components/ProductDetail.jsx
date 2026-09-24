import { useEffect, useState } from 'react'
import { listarProveedoresDeProducto } from '../services/productoProveedor.js'
import { listarMovimientosPorProducto } from '../services/movimientos.js'

export default function ProductDetail ({ producto, onEdit, onDelete, onBack, onMovimiento }) {
  const [proveedores, setProveedores] = useState([])
  const [movimientos, setMovimientos] = useState([])

  useEffect(() => {
    let activo = true
    listarProveedoresDeProducto(producto.id).then((data) => {
      if (activo) setProveedores(data)
    })
    return () => { activo = false }
  }, [producto.id])

  useEffect(() => {
    let activo = true
    listarMovimientosPorProducto(producto.id).then((data) => {
      if (activo) setMovimientos(data)
    })
    return () => { activo = false }
  }, [producto.id])

  function handleDelete () {
    const confirmado = window.confirm(`¿Seguro que querés eliminar ${producto.nombre}? No se puede deshacer.`)
    if (confirmado) {
      onDelete()
    }
  }

  return (
    <section className="product-detail">
      <button type="button" onClick={onBack} className="link-button">← Volver</button>

      {producto.imagen_url && <img src={producto.imagen_url} alt={producto.nombre} className="product-detail-imagen" />}

      <h1>{producto.nombre}</h1>
      <p className="product-detail-codigo">{producto.id}</p>

      <dl className="product-detail-datos">
        <dt>Precio de venta</dt>
        <dd>${producto.precio_venta}</dd>
        <dt>Costo</dt>
        <dd>${producto.costo}</dd>
        <dt>Stock</dt>
        <dd>{producto.stock}</dd>
        <dt>Stock mínimo</dt>
        <dd>{producto.stock_minimo}</dd>
      </dl>

      {proveedores.length > 0 && (
        <div className="product-detail-proveedores">
          <h2>Proveedores</h2>
          <ul>
            {proveedores.map((p) => <li key={p.id} className="chip">{p.nombre}</li>)}
          </ul>
        </div>
      )}

      <div className="product-actions">
        <button type="button" onClick={() => onMovimiento('entrada')}>+ Entrada</button>
        <button type="button" onClick={() => onMovimiento('salida')}>− Salida</button>
      </div>

      {movimientos.length > 0 && (
        <div className="product-detail-historial">
          <h2>Historial de movimientos</h2>
          <ul>
            {movimientos.map((m) => (
              <li key={m.id}>
                <span className={m.tipo === 'entrada' ? 'movimiento-entrada' : 'movimiento-salida'}>
                  {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}
                </span>
                <span className="movimiento-fecha">{new Date(m.fecha).toLocaleDateString()}</span>
                {m.motivo && <span className="movimiento-motivo">{m.motivo}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={handleDelete}>Eliminar</button>
        <button type="button" onClick={onEdit}>Editar</button>
      </div>
    </section>
  )
}
