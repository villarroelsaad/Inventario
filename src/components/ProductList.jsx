import { useProductos } from '../hooks/useProductos.js'
import { useCategorias } from '../hooks/useCategorias.js'
import { useProveedores } from '../hooks/useProveedores.js'
import { generarCsvProductos, descargarCsv } from '../services/exportCsv.js'
import { estadoStock } from '../lib/estadoStock.js'
import { filasPorProveedor, precioDeFila, costoDeFila } from '../lib/filasPorProveedor.js'
import { calcularMargen } from '../lib/margen.js'
import Icono from './Icono.jsx'

export default function ProductList ({ onSelect, onAdd, onScan, onMovimiento }) {
  const { productos, filtros, setFiltros, loading, error } = useProductos()
  const { categorias } = useCategorias()
  const { proveedores } = useProveedores()

  const conStockBajo = productos.filter((p) => p.stock < p.stock_minimo)
  const valorEnStock = productos.reduce((total, p) => {
    const precio = p.precio_venta ?? p.proveedores?.[0]?.precio_venta ?? 0
    return total + precio * p.stock
  }, 0)
  const gananciaPosible = productos.reduce((total, p) => {
    const precio = p.precio_venta ?? p.proveedores?.[0]?.precio_venta
    const costo = p.costo ?? p.proveedores?.[0]?.costo
    const margen = calcularMargen(precio, costo)
    return margen ? total + margen.ganancia * p.stock : total
  }, 0)
  const filas = filasPorProveedor(productos, filtros)

  const nombreCategoria = Object.fromEntries(categorias.map((c) => [c.id, c.nombre]))

  function actualizarFiltro (campo, valor) {
    setFiltros({ ...filtros, [campo]: valor || undefined })
  }

  function actualizarPrecio (campo, texto) {
    setFiltros({ ...filtros, [campo]: texto === '' ? undefined : Number(texto) })
  }

  function handleExportar () {
    const csv = generarCsvProductos(filas, categorias)
    const fecha = new Date().toISOString().slice(0, 10)
    descargarCsv(`productos-${fecha}.csv`, csv)
  }

  return (
    <section className="product-list">
      <div className="list-header">
        <div>
          <h1>Inicio</h1>
          <p className="fecha">{productos.length === 1 ? '1 producto en total' : `${productos.length} productos en total`}</p>
        </div>
        <button type="button" onClick={onAdd} className="btn-agregar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Agregar producto
        </button>
      </div>

      <div className="stats">
        <div className="stat-tile">
          <span className="stat-icono"><Icono nombre="caja" /></span>
          <span className="valor">{productos.length}</span>
          <span className="label">Productos</span>
        </div>
        <div className={conStockBajo.length > 0 ? 'stat-tile alerta' : 'stat-tile'}>
          <span className="stat-icono"><Icono nombre="alerta" /></span>
          <span className="valor">{conStockBajo.length}</span>
          <span className="label">Stock bajo</span>
        </div>
        <div className="stat-tile">
          <span className="stat-icono"><Icono nombre="proveedor" /></span>
          <span className="valor">{proveedores.length}</span>
          <span className="label">Proveedores</span>
        </div>
        <div className="stat-tile">
          <span className="stat-icono"><Icono nombre="dinero" /></span>
          <span className="valor">${valorEnStock.toLocaleString('es-AR')}</span>
          <span className="label">Valor en stock</span>
          {gananciaPosible !== 0 && (
            <span className="stat-sub">Ganancia posible ${gananciaPosible.toLocaleString('es-AR')}</span>
          )}
        </div>
      </div>

      <div className="toolbar">
        <button type="button" onClick={onScan} className="tool-escanear">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><circle cx="12" cy="13" r="2.5" /></svg>
          Escanear
        </button>
        <button type="button" onClick={() => onMovimiento('entrada')} className="tool-entrada">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Entrada
        </button>
        <button type="button" onClick={() => onMovimiento('salida')} className="tool-salida">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
          Salida
        </button>
        <button type="button" onClick={handleExportar} className="tool-exportar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13m0 0-4-4m4 4 4-4M4 19h16" /></svg>
          Exportar
        </button>
      </div>

      <div className="search-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <label htmlFor="buscar-producto">Buscar</label>
        <input
          id="buscar-producto"
          type="search"
          placeholder="Buscar producto..."
          value={filtros.busqueda ?? ''}
          onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
        />
      </div>

      <div className="product-filters">
        <select
          aria-label="Categoría"
          value={filtros.categoriaId ?? ''}
          onChange={(e) => actualizarFiltro('categoriaId', e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <select
          aria-label="Proveedor"
          value={filtros.proveedorId ?? ''}
          onChange={(e) => actualizarFiltro('proveedorId', e.target.value)}
        >
          <option value="">Todos los proveedores</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <div className="filtro-precio">
          <span aria-hidden="true">$</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            aria-label="Precio desde"
            placeholder="Desde"
            value={filtros.precioMin ?? ''}
            onChange={(e) => actualizarPrecio('precioMin', e.target.value)}
          />
        </div>

        <div className="filtro-precio">
          <span aria-hidden="true">$</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            aria-label="Precio hasta"
            placeholder="Hasta"
            value={filtros.precioMax ?? ''}
            onChange={(e) => actualizarPrecio('precioMax', e.target.value)}
          />
        </div>

        <select
          aria-label="Ordenar por"
          value={filtros.orden ?? 'nombre'}
          onChange={(e) => actualizarFiltro('orden', e.target.value)}
        >
          <option value="nombre">A-Z</option>
          <option value="precio">Precio</option>
          <option value="cantidad">Cantidad</option>
          <option value="reciente">Más reciente</option>
        </select>
      </div>

      {loading && <p className="cargando">Cargando...</p>}
      {error && <p className="login-error">{error}</p>}
      {!loading && !error && filas.length === 0 && (
        <p className="vacio">
          {filtros.busqueda || filtros.categoriaId || filtros.proveedorId || filtros.precioMin != null || filtros.precioMax != null
            ? 'Ningún producto coincide con la búsqueda o los filtros elegidos.'
            : 'Todavía no hay productos. Tocá “Agregar producto” para cargar el primero.'}
        </p>
      )}

      {filas.length > 0 && (
        <div className="tabla-cabecera" aria-hidden="true">
          <span>Producto</span>
          <span>Código</span>
          <span>Categoría</span>
          <span>Proveedor</span>
          <span>Precio</span>
          <span>Margen</span>
          <span>Stock</span>
          <span>Estado</span>
        </div>
      )}

      <ul className="tabla-productos">
        {filas.map((producto) => {
          const estado = estadoStock(producto)
          return (
            <li
              key={producto.clave}
              className={producto.stock < producto.stock_minimo ? 'stock-bajo' : 'stock-ok'}
            >
              <button type="button" onClick={() => onSelect(producto)} className="product-row">
                <span className="product-thumb">{producto.nombre.charAt(0).toUpperCase()}</span>
                <span className="product-info">
                  <span className="product-nombre">{producto.nombre}</span>
                  <span className="product-meta">{nombreCategoria[producto.categoria_id] ?? 'Sin categoría'}</span>
                </span>
                <span className="product-codigo">{producto.id}</span>
                <span className={producto.proveedor ? 'product-proveedor' : 'product-proveedor sin'}>
                  {producto.proveedor?.nombre ?? 'Sin proveedor'}
                </span>
                <span className="product-precio">${Number(precioDeFila(producto) ?? 0).toLocaleString('es-AR')}</span>
                {(() => {
                  const margen = calcularMargen(precioDeFila(producto), costoDeFila(producto))
                  return (
                    <span className={margen ? `product-margen margen-${margen.nivel}` : 'product-margen'}>
                      {margen ? `${margen.porcentaje}%` : '—'}
                    </span>
                  )
                })()}
                <span className={`badge ${estado.clave}`}>{producto.stock}</span>
                <span className={`estado estado-${estado.clave}`}>{estado.texto}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
