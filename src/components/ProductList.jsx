import { useProductos } from '../hooks/useProductos.js'
import { useCategorias } from '../hooks/useCategorias.js'
import { useProveedores } from '../hooks/useProveedores.js'
import { generarCsvProductos, descargarCsv } from '../services/exportCsv.js'

export default function ProductList ({ onSelect, onAdd, onScan, onMovimiento }) {
  const { productos, filtros, setFiltros, loading, error } = useProductos()
  const { categorias } = useCategorias()
  const { proveedores } = useProveedores()

  const conStockBajo = productos.filter((p) => p.stock < p.stock_minimo)

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
      {conStockBajo.length > 0 && (
        <p className="stock-alert">
          Stock bajo en {conStockBajo.length} {conStockBajo.length === 1 ? 'producto' : 'productos'}
        </p>
      )}

      <label htmlFor="buscar-producto">Buscar</label>
      <input
        id="buscar-producto"
        type="search"
        value={filtros.busqueda ?? ''}
        onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
      />

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
              <span className="product-nombre">{producto.nombre}</span>
              <span className="product-stock">{producto.stock}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="product-actions">
        <button type="button" onClick={onScan}>Escanear código</button>
        <button type="button" onClick={() => onMovimiento('entrada')}>+ Entrada</button>
        <button type="button" onClick={() => onMovimiento('salida')}>− Salida</button>
      </div>
      <button type="button" onClick={onAdd}>+ Agregar producto</button>
      <button type="button" onClick={handleExportar} className="export-button">Exportar</button>
    </section>
  )
}
