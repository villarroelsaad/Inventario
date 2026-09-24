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

  return (
    <main className="app">
      <nav className="app-nav">
        <button type="button" onClick={irAInicio}>Inicio</button>
        <button type="button" onClick={() => setVista('categorias')}>Categorías</button>
        <button type="button" onClick={() => setVista('proveedores')}>Proveedores</button>
      </nav>

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
          onCancel={productoActivo ? () => setVista('producto-detalle') : irAInicio}
        />
      )}

      {vista === 'movimiento-elegir-producto' && (
        <section className="movement-picker">
          <button type="button" onClick={irAInicio} className="link-button">← Volver</button>
          <h1>{tipoMovimiento === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}</h1>
          <p>Elegí el producto:</p>
          <input
            type="search"
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            value={filtros.busqueda ?? ''}
            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
          />
          <button type="button" onClick={abrirEscaneoParaMovimiento}>Escanear código</button>
          <ul className="movement-picker-lista">
            {productos.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => elegirProductoParaMovimiento(p)}>
                  {p.nombre} — stock: {p.stock}
                </button>
              </li>
            ))}
          </ul>
        </section>
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
    </main>
  )
}
