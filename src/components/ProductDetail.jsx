import { useEffect, useState } from 'react'
import { listarProveedoresDeProducto } from '../services/productoProveedor.js'
import { listarMovimientosPorProducto } from '../services/movimientos.js'
import { estadoStock } from '../lib/estadoStock.js'
import Icono from './Icono.jsx'

function pesos (valor) {
  return `$${Number(valor ?? 0).toLocaleString('es-AR')}`
}

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

  const estado = estadoStock(producto)

  return (
    <section className="product-detail hoja">
      <div className="hoja-cuerpo">
        <div className="detalle-hero">
          {producto.imagen_url
            ? <img src={producto.imagen_url} alt={producto.nombre} className="product-detail-imagen" />
            : <span className="product-thumb detalle-avatar" aria-hidden="true">{producto.nombre.charAt(0).toUpperCase()}</span>}
          <div className="detalle-hero-texto">
            <h1>{producto.nombre}</h1>
            <p className="product-detail-codigo">{producto.id}</p>
            <span className={`estado estado-${estado.clave}`}>{estado.texto}</span>
          </div>
          <button type="button" onClick={onBack} className="hoja-cerrar" aria-label="Volver">
            <Icono nombre="cerrar" />
          </button>
        </div>

        <dl className="product-detail-datos">
          <div className="dato">
            <dt>Precio de venta</dt>
            <dd>{pesos(producto.precio_venta)}</dd>
          </div>
          <div className="dato">
            <dt>Costo</dt>
            <dd>{pesos(producto.costo)}</dd>
          </div>
          <div className={`dato dato-stock estado-${estado.clave}`}>
            <dt>Stock</dt>
            <dd>{producto.stock}</dd>
          </div>
          <div className="dato">
            <dt>Stock mínimo</dt>
            <dd>{producto.stock_minimo}</dd>
          </div>
        </dl>

        <div className="product-actions">
          <button type="button" className="accion-entrada" onClick={() => onMovimiento('entrada')}>+ Entrada</button>
          <button type="button" className="accion-salida" onClick={() => onMovimiento('salida')}>− Salida</button>
        </div>

        {proveedores.length > 0 && (
          <div className="product-detail-proveedores">
            <h2>Proveedores</h2>
            <ul>
              {proveedores.map((p) => <li key={p.id} className="chip">{p.nombre}</li>)}
            </ul>
          </div>
        )}

        {movimientos.length > 0 && (
          <div className="product-detail-historial">
            <h2>Historial de movimientos</h2>
            <ol className="timeline">
              {movimientos.map((m) => (
                <li key={m.id} className={m.tipo === 'entrada' ? 'timeline-item es-entrada' : 'timeline-item es-salida'}>
                  <span className="timeline-punto" aria-hidden="true" />
                  <span className={m.tipo === 'entrada' ? 'movimiento-entrada' : 'movimiento-salida'}>
                    {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}
                  </span>
                  <span className="movimiento-motivo">{m.motivo || (m.tipo === 'entrada' ? 'Entrada' : 'Salida')}</span>
                  <span className="movimiento-fecha">{new Date(m.fecha).toLocaleDateString()}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="button" onClick={handleDelete} className="btn-peligro">Eliminar</button>
        <button type="button" onClick={onEdit}>
          <Icono nombre="editar" />
          Editar
        </button>
      </div>
    </section>
  )
}
