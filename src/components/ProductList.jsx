import { useProductos } from '../hooks/useProductos.js'
import { useCategorias } from '../hooks/useCategorias.js'
import { useProveedores } from '../hooks/useProveedores.js'
import { generarCsvProductos, descargarCsv } from '../services/exportCsv.js'

export default function ProductList ({ onSelect, onAdd, onScan, onMovimiento }) {
  const { productos, filtros, setFiltros, loading, error } = useProductos()
  const { categorias } = useCategorias()
  const { proveedores } = useProveedores()

  const conStockBajo = productos.filter((p) => p.stock < p.stock_minimo)
  const valorEnStock = productos.reduce((total, p) => total + (p.precio_venta ?? 0) * p.stock, 0)

  function actualizarFiltro (campo, valor) {
    setFiltros({ ...filtros, [campo]: valor || undefined })
  }

  function handleExportar () {
    const csv = generarCsvProductos(productos, categorias)
    const fecha = new Date().toISOString().slice(0, 10)
    descargarCsv(`productos-${fecha}.csv`, csv)
  }

  return (
    <section className="product-list">
      <div className="list-header">
        <div>
          <h1>Inicio</h1>
          <span className="fecha">{productos.length} productos en total</span>
        </div>
        <button type="button" onClick={onAdd} className="btn-agregar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Agregar producto
        </button>
      </div>

      <div className="stats">
        <div className="stat-tile">
          <span className="valor">{productos.length}</span>
          <span className="label">Productos</span>
        </div>
        <div className={conStockBajo.length > 0 ? 'stat-tile alerta' : 'stat-tile'}>
          <span className="valor">{conStockBajo.length}</span>
          <span className="label">Stock bajo</span>
        </div>
        <div className="stat-tile">
          <span className="valor">{proveedores.length}</span>
          <span className="label">Proveedores</span>
        </div>
        <div className="stat-tile">
          <span className="valor">${valorEnStock.toLocaleString('es-AR')}</span>
          <span className="label">Valor en stock</span>
        </div>
      </div>

      <div className="toolbar">
        <button type="button" onClick={onScan}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><circle cx="12" cy="13" r="2.5" /></svg>
          Escanear
        </button>
        <button type="button" onClick={() => onMovimiento('entrada')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Entrada
        </button>
        <button type="button" onClick={() => onMovimiento('salida')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
          Salida
        </button>
        <button type="button" onClick={handleExportar}>
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

      {loading && <p>Cargando...</p>}
      {error && <p className="login-error">{error}</p>}

      <ul>
        {productos.map((producto) => (
          <li
            key={producto.id}
            className={producto.stock < producto.stock_minimo ? 'stock-bajo' : 'stock-ok'}
          >
            <button type="button" onClick={() => onSelect(producto)} className="product-row">
              <span className="product-thumb">{producto.nombre.charAt(0).toUpperCase()}</span>
              <span className="product-nombre">{producto.nombre}</span>
              <span className={producto.stock < producto.stock_minimo ? 'badge bajo' : 'badge ok'}>{producto.stock}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
