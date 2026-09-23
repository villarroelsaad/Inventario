import { useState } from 'react'
import { useAuth } from './hooks/useAuth.js'
import { useProductos } from './hooks/useProductos.js'
import { listarProveedoresDeProducto } from './services/productoProveedor.js'
import Login from './components/Login.jsx'
import CategoryList from './components/CategoryList.jsx'
import SupplierList from './components/SupplierList.jsx'
import ProductList from './components/ProductList.jsx'
import ProductDetail from './components/ProductDetail.jsx'
import ProductForm from './components/ProductForm.jsx'

export default function App () {
  const { user, loading } = useAuth()
  const { crear, actualizar, borrar } = useProductos()

  const [vista, setVista] = useState('inicio')
  const [productoActivo, setProductoActivo] = useState(null)
  const [proveedoresDelProducto, setProveedoresDelProducto] = useState([])

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
    setVista('producto-form')
  }

  function abrirFormularioNuevo () {
    setProductoActivo(null)
    setProveedoresDelProducto([])
    setVista('producto-form')
  }

  async function handleGuardarProducto (datos, proveedorIds, imagenFile, cantidadInicial) {
    if (productoActivo) {
      await actualizar(productoActivo.id, datos, proveedorIds, imagenFile)
    } else {
      await crear(datos, proveedorIds, imagenFile, cantidadInicial)
    }
    irAInicio()
  }

  async function handleEliminarProducto () {
    await borrar(productoActivo.id)
    irAInicio()
  }

  function handleMovimiento (tipo) {
    setVista('movimiento')
    // TODO Fase 4: pantalla real de Registrar movimiento (con escaneo de código de barras)
    console.info('Registrar movimiento pendiente (Fase 4):', tipo, productoActivo?.id)
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
          onScan={() => handleMovimiento('entrada')}
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
          proveedoresSeleccionados={proveedoresDelProducto}
          onSave={handleGuardarProducto}
          onCancel={productoActivo ? () => setVista('producto-detalle') : irAInicio}
        />
      )}

      {vista === 'movimiento' && (
        <section>
          <p>Registrar movimiento — en construcción (próxima fase).</p>
          <button type="button" onClick={irAInicio}>← Volver</button>
        </section>
      )}
    </main>
  )
}
