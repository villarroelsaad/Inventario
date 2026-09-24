import { useState } from 'react'
import { useAuth } from './hooks/useAuth.js'
import { useProductos } from './hooks/useProductos.js'
import { useMovimientos } from './hooks/useMovimientos.js'
import { listarProveedoresDeProducto } from './services/productoProveedor.js'
import { obtenerProductoPorId } from './services/productos.js'
import Login from './components/Login.jsx'
import CategoryList from './components/CategoryList.jsx'
import SupplierList from './components/SupplierList.jsx'
import ProductList from './components/ProductList.jsx'
import ProductDetail from './components/ProductDetail.jsx'
import ProductForm from './components/ProductForm.jsx'
import MovementForm from './components/MovementForm.jsx'
import BarcodeScanner from './components/BarcodeScanner.jsx'

export default function App () {
  const { user, loading } = useAuth()
  const { productos, filtros, setFiltros, crear, actualizar, borrar } = useProductos()
  const { registrar: registrarMovimiento, error: movimientoError } = useMovimientos()

  const [vista, setVista] = useState('inicio')
  const [productoActivo, setProductoActivo] = useState(null)
  const [proveedoresDelProducto, setProveedoresDelProducto] = useState([])
  const [tipoMovimiento, setTipoMovimiento] = useState(null)
  const [movimientoDesdeDetalle, setMovimientoDesdeDetalle] = useState(false)
  const [codigoEscaneado, setCodigoEscaneado] = useState('')
  const [productoError, setProductoError] = useState(null)
  const [sidebarColapsada, setSidebarColapsada] = useState(false)

  if (loading) {
    return null
  }

  if (!user) {
    return <Login />
  }

  function irAInicio () {
    setProductoActivo(null)
    setVista('inicio')
  }

  async function abrirDetalle (producto) {
    setProductoActivo(producto)
    setVista('producto-detalle')
  }

  async function abrirFormularioEdicion () {
    const proveedores = await listarProveedoresDeProducto(productoActivo.id)
    setProveedoresDelProducto(proveedores.map((p) => p.id))
    setProductoError(null)
    setVista('producto-form')
  }

  function abrirFormularioNuevo () {
    setProductoActivo(null)
    setProveedoresDelProducto([])
    setCodigoEscaneado('')
    setProductoError(null)
    setVista('producto-form')
  }

  function handleCancelarForm () {
    if (productoActivo) {
      setVista('producto-detalle')
    } else {
      irAInicio()
    }
  }

  async function handleGuardarProducto (datos, proveedorIds, imagenFile, cantidadInicial) {
    try {
      if (productoActivo) {
        await actualizar(productoActivo.id, datos, proveedorIds, imagenFile)
      } else {
        await crear(datos, proveedorIds, imagenFile, cantidadInicial)
      }
      irAInicio()
    } catch (err) {
      setProductoError(err.message)
    }
  }

  async function handleEliminarProducto () {
    await borrar(productoActivo.id)
    irAInicio()
  }

  function handleMovimiento (tipo) {
    setTipoMovimiento(tipo)
    if (productoActivo) {
      setMovimientoDesdeDetalle(true)
      setVista('movimiento-form')
    } else {
      setMovimientoDesdeDetalle(false)
      setVista('movimiento-elegir-producto')
    }
  }

  function elegirProductoParaMovimiento (producto) {
    setProductoActivo(producto)
    setVista('movimiento-form')
  }

  async function handleGuardarMovimiento (cantidad, motivo) {
    try {
      await registrarMovimiento({ productoId: productoActivo.id, tipo: tipoMovimiento, cantidad, motivo })
      if (movimientoDesdeDetalle) {
        setProductoActivo(await obtenerProductoPorId(productoActivo.id))
        setVista('producto-detalle')
      } else {
        irAInicio()
      }
    } catch {
      // el mensaje de error ya queda disponible en useMovimientos().error
    }
  }

  function cancelarMovimiento () {
    setVista(movimientoDesdeDetalle ? 'producto-detalle' : 'inicio')
  }

  function abrirEscaneoStandalone () {
    setTipoMovimiento(null)
    setVista('escaneo')
  }

  function abrirEscaneoParaMovimiento () {
    setVista('escaneo')
  }

  async function manejarCodigoEscaneado (codigo) {
    const producto = await obtenerProductoPorId(codigo)
    if (producto) {
      setProductoActivo(producto)
      setVista(tipoMovimiento ? 'movimiento-form' : 'producto-detalle')
    } else {
      setTipoMovimiento(null)
      setProductoActivo(null)
      setCodigoEscaneado(codigo)
      setProductoError(null)
      setVista('producto-form')
    }
  }

  function cancelarEscaneo () {
    setVista(tipoMovimiento ? 'movimiento-elegir-producto' : 'inicio')
  }

  function cerrarModalActivo () {
    if (vista === 'producto-detalle') irAInicio()
    else if (vista === 'producto-form') handleCancelarForm()
    else if (vista === 'movimiento-form') cancelarMovimiento()
    else if (vista === 'escaneo') cancelarEscaneo()
  }

  const vistaModal = ['producto-detalle', 'producto-form', 'movimiento-form', 'escaneo'].includes(vista)

  return (
    <div className={sidebarColapsada ? 'app-shell colapsada' : 'app-shell'}>
      <nav className="app-nav">
        <div className="app-nav-top">
          <div className="app-nav-logo">Registro</div>
          <button
            type="button"
            className="app-nav-toggle"
            onClick={() => setSidebarColapsada((actual) => !actual)}
            aria-label="Contraer menú"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6" /></svg>
          </button>
        </div>
        <div className="app-nav-links">
          <button type="button" className={vista === 'inicio' ? 'activo' : ''} onClick={irAInicio}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
            <span className="nav-label">Inicio</span>
          </button>
          <button type="button" className={vista === 'categorias' ? 'activo' : ''} onClick={() => setVista('categorias')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            <span className="nav-label">Categorías</span>
          </button>
          <button type="button" className={vista === 'proveedores' ? 'activo' : ''} onClick={() => setVista('proveedores')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18l-1.5 11a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 7Z" /><path d="M8 7V5a4 4 0 0 1 8 0v2" /></svg>
            <span className="nav-label">Proveedores</span>
          </button>
        </div>
      </nav>

      <main className="app-content">
        {vista === 'inicio' && (
          <ProductList
            onSelect={abrirDetalle}
            onAdd={abrirFormularioNuevo}
            onScan={abrirEscaneoStandalone}
            onMovimiento={handleMovimiento}
          />
        )}

        {vista === 'categorias' && <CategoryList />}
        {vista === 'proveedores' && <SupplierList />}

        {vista === 'movimiento-elegir-producto' && (
          <section className="movement-picker">
            <button type="button" onClick={irAInicio} className="link-button">← Volver</button>
            <h1>{tipoMovimiento === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}</h1>
            <p className="fecha">Elegí el producto</p>

            <div className="search-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <label htmlFor="movimiento-buscar-producto">Buscar producto</label>
              <input
                id="movimiento-buscar-producto"
                type="search"
                placeholder="Buscar producto..."
                value={filtros.busqueda ?? ''}
                onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              />
            </div>

            <button type="button" onClick={abrirEscaneoParaMovimiento} className="link-button">Escanear código en vez de buscar</button>

            <ul className="movement-picker-lista">
              {productos.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => elegirProductoParaMovimiento(p)}>
                    <span className="product-thumb">{p.nombre.charAt(0).toUpperCase()}</span>
                    <span className="product-nombre">{p.nombre}</span>
                    <span className={p.stock < p.stock_minimo ? 'badge bajo' : 'badge ok'}>{p.stock}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {vistaModal && (
        <div className="modal-backdrop abierto" onClick={(e) => { if (e.target === e.currentTarget) cerrarModalActivo() }}>
          <div className="modal-card">
            {vista === 'producto-detalle' && productoActivo && (
              <ProductDetail
                producto={productoActivo}
                onEdit={abrirFormularioEdicion}
                onDelete={handleEliminarProducto}
                onBack={irAInicio}
                onMovimiento={handleMovimiento}
              />
            )}

            {vista === 'producto-form' && (
              <ProductForm
                producto={productoActivo}
                codigoInicial={codigoEscaneado}
                proveedoresSeleccionados={proveedoresDelProducto}
                error={productoError}
                onSave={handleGuardarProducto}
                onCancel={handleCancelarForm}
              />
            )}

            {vista === 'movimiento-form' && productoActivo && (
              <MovementForm
                producto={productoActivo}
                tipo={tipoMovimiento}
                error={movimientoError}
                onSave={handleGuardarMovimiento}
                onCancel={cancelarMovimiento}
              />
            )}

            {vista === 'escaneo' && (
              <BarcodeScanner
                onDetected={manejarCodigoEscaneado}
                onCancel={cancelarEscaneo}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
