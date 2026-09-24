import { useState } from 'react'
import { useAuth } from './hooks/useAuth.js'
import { useProductos } from './hooks/useProductos.js'
import { useMovimientos } from './hooks/useMovimientos.js'
import { useTema } from './hooks/useTema.js'
import { listarProveedoresDeProducto } from './services/productoProveedor.js'
import { obtenerProductoPorId } from './services/productos.js'
import { estadoStock } from './lib/estadoStock.js'
import Login from './components/Login.jsx'
import CategoryList from './components/CategoryList.jsx'
import SupplierList from './components/SupplierList.jsx'
import ProductList from './components/ProductList.jsx'
import ProductDetail from './components/ProductDetail.jsx'
import ProductForm from './components/ProductForm.jsx'
import MovementForm from './components/MovementForm.jsx'
import BarcodeScanner from './components/BarcodeScanner.jsx'
import Avisos from './components/Avisos.jsx'
import ModalHeader from './components/ModalHeader.jsx'
import { avisar } from './lib/avisos.js'
import { filasPorProveedor, precioDeFila } from './lib/filasPorProveedor.js'

export default function App () {
  const { user, loading, logout } = useAuth()
  const { productos, filtros, setFiltros, crear, actualizar, borrar } = useProductos()
  const { registrar: registrarMovimiento, error: movimientoError } = useMovimientos()
  const { temaEfectivo, alternarTema } = useTema()

  const [vista, setVista] = useState('inicio')
  const [productoActivo, setProductoActivo] = useState(null)
  const [proveedoresDelProducto, setProveedoresDelProducto] = useState([])
  const [tipoMovimiento, setTipoMovimiento] = useState(null)
  const [movimientoDesdeDetalle, setMovimientoDesdeDetalle] = useState(false)
  const [codigoEscaneado, setCodigoEscaneado] = useState('')
  const [filasEscaneadas, setFilasEscaneadas] = useState([])
  const [productoError, setProductoError] = useState(null)
  const [sidebarColapsada, setSidebarColapsada] = useState(false)

  if (loading) {
    return null
  }

  if (!user) {
    return <Login />
  }

  function handleSalir () {
    if (window.confirm('¿Querés cerrar la sesión? Vas a tener que volver a ingresar con tu usuario y contraseña.')) {
      logout()
    }
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
    setProveedoresDelProducto(proveedores.map((p) => ({ proveedorId: p.id, precioVenta: p.precio_venta, costo: p.costo })))
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

  async function handleGuardarProducto (datos, proveedores, imagenFile, cantidadInicial) {
    try {
      if (productoActivo) {
        await actualizar(productoActivo.id, datos, proveedores, imagenFile)
      } else {
        await crear(datos, proveedores, imagenFile, cantidadInicial)
      }
      avisar(productoActivo ? 'Producto actualizado' : 'Producto guardado')
      irAInicio()
    } catch (err) {
      setProductoError(err.message)
    }
  }

  async function handleEliminarProducto () {
    await borrar(productoActivo.id)
    avisar('Producto eliminado')
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
      avisar(tipoMovimiento === 'entrada' ? 'Entrada registrada' : 'Salida registrada')
      if (movimientoDesdeDetalle) {
        const actualizado = await obtenerProductoPorId(productoActivo.id)
        setProductoActivo((actual) => ({ ...actual, ...actualizado }))
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
    if (producto && tipoMovimiento) {
      // El stock es uno solo por producto: para un movimiento no importa el proveedor.
      setProductoActivo(producto)
      setVista('movimiento-form')
    } else if (producto) {
      const proveedores = await listarProveedoresDeProducto(codigo)
      const filas = filasPorProveedor([{ ...producto, proveedores }])
      if (filas.length > 1) {
        setFilasEscaneadas(filas)
        setVista('escaneo-elegir-proveedor')
      } else {
        setProductoActivo(filas[0])
        setVista('producto-detalle')
      }
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
    if (vista === 'producto-detalle' || vista === 'escaneo-elegir-proveedor') irAInicio()
    else if (vista === 'producto-form') handleCancelarForm()
    else if (vista === 'movimiento-form') cancelarMovimiento()
    else if (vista === 'escaneo') cancelarEscaneo()
  }

  const vistaModal = ['producto-detalle', 'producto-form', 'movimiento-form', 'escaneo', 'escaneo-elegir-proveedor'].includes(vista)

  return (
    <div className={sidebarColapsada ? 'app-shell colapsada' : 'app-shell'}>
      <nav className="app-nav">
        <div className="app-nav-top">
          <div className="app-nav-logo">Registro</div>
          <button
            type="button"
            className="app-nav-toggle"
            onClick={() => setSidebarColapsada((actual) => !actual)}
            aria-label={sidebarColapsada ? 'Expandir menú' : 'Contraer menú'}
            aria-expanded={!sidebarColapsada}
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
          <button
            type="button"
            className="nav-tema"
            onClick={alternarTema}
            aria-label={temaEfectivo === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {temaEfectivo === 'dark'
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /></svg>}
            <span className="nav-label">{temaEfectivo === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
          <button type="button" className="nav-salir" onClick={handleSalir} aria-label="Salir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
            <span className="nav-label">Salir</span>
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
                    <span className={`badge ${estadoStock(p).clave}`}>{p.stock}</span>
                  </button>
                </li>
              ))}
            </ul>
            {productos.length === 0 && (
              <p className="vacio">
                {filtros.busqueda ? 'Ningún producto coincide con esa búsqueda.' : 'Todavía no hay productos cargados.'}
              </p>
            )}
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

            {vista === 'escaneo-elegir-proveedor' && (
              <section className="hoja elegir-proveedor">
                <ModalHeader
                  icono="proveedor"
                  titulo={filasEscaneadas[0]?.nombre}
                  bajada="Este código lo traen varios proveedores. ¿De cuál es?"
                  onClose={irAInicio}
                />
                <div className="hoja-cuerpo">
                  <ul className="movement-picker-lista">
                    {filasEscaneadas.map((fila) => (
                      <li key={fila.clave}>
                        <button type="button" onClick={() => abrirDetalle(fila)}>
                          <span className="product-thumb">{fila.proveedor.nombre.charAt(0).toUpperCase()}</span>
                          <span className="product-nombre">{fila.proveedor.nombre}</span>
                          <span className="product-precio">${Number(precioDeFila(fila) ?? 0).toLocaleString('es-AR')}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
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

      <Avisos />
    </div>
  )
}
