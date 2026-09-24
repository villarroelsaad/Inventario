import { useEffect, useState } from 'react'
import { useCategorias } from '../hooks/useCategorias.js'
import { useProveedores } from '../hooks/useProveedores.js'
import ModalHeader from './ModalHeader.jsx'
import Icono from './Icono.jsx'

export default function ProductForm ({ producto, codigoInicial = '', proveedoresSeleccionados = [], error, onSave, onCancel }) {
  const { categorias } = useCategorias()
  const { proveedores } = useProveedores()

  const [id, setId] = useState(producto?.id ?? codigoInicial)
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id ?? '')
  const [precioVenta, setPrecioVenta] = useState(producto?.precio_venta ?? '')
  const [costo, setCosto] = useState(producto?.costo ?? '')
  const [stockMinimo, setStockMinimo] = useState(producto?.stock_minimo ?? '')
  const [cantidadInicial, setCantidadInicial] = useState('')
  const [proveedorIds, setProveedorIds] = useState(proveedoresSeleccionados)
  const [imagenFile, setImagenFile] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState(null)
  const [arrastrando, setArrastrando] = useState(false)

  // Vista previa local de la foto elegida (solo para mostrarla en el formulario).
  useEffect(() => {
    if (!imagenFile || typeof URL.createObjectURL !== 'function') {
      setVistaPrevia(null)
      return
    }
    const url = URL.createObjectURL(imagenFile)
    setVistaPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [imagenFile])

  const fotoVisible = vistaPrevia ?? producto?.imagen_url ?? null

  function toggleProveedor (proveedorId) {
    setProveedorIds((actuales) =>
      actuales.includes(proveedorId)
        ? actuales.filter((p) => p !== proveedorId)
        : [...actuales, proveedorId]
    )
  }

  function handleSoltarFoto (event) {
    event.preventDefault()
    setArrastrando(false)
    const archivo = event.dataTransfer.files?.[0]
    if (archivo && archivo.type.startsWith('image/')) {
      setImagenFile(archivo)
    }
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
    <form onSubmit={handleSubmit} className="product-form hoja">
      <ModalHeader
        icono="caja"
        titulo={producto ? 'Editar producto' : 'Nuevo producto'}
        bajada={producto ? 'Cambiá lo que necesites y guardá.' : 'Completá los datos para sumarlo al stock.'}
        onClose={onCancel}
      />

      <div className="hoja-cuerpo">
        <div className="form-seccion">
          <h2 className="form-seccion-titulo">Datos básicos</h2>

          <label htmlFor="producto-id">Código</label>
          <div className="campo-icono">
            <Icono nombre="codigo" />
            <input
              id="producto-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={Boolean(producto)}
              required
            />
          </div>

          <label htmlFor="producto-nombre">Nombre</label>
          <div className="campo-icono">
            <Icono nombre="texto" />
            <input
              id="producto-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <label htmlFor="producto-categoria">Categoría</label>
          <div className="campo-icono">
            <Icono nombre="categoria" />
            <select id="producto-categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-seccion">
          <h2 className="form-seccion-titulo">Precios</h2>
          <div className="form-fila">
            <div className="campo">
              <label htmlFor="producto-precio">Precio de venta</label>
              <div className="campo-prefijo">
                <span aria-hidden="true">$</span>
                <input
                  id="producto-precio"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                />
              </div>
            </div>
            <div className="campo">
              <label htmlFor="producto-costo">Costo</label>
              <div className="campo-prefijo">
                <span aria-hidden="true">$</span>
                <input
                  id="producto-costo"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-seccion">
          <h2 className="form-seccion-titulo">Stock</h2>
          <div className="form-fila">
            <div className="campo">
              <label htmlFor="producto-stock-minimo">Stock mínimo</label>
              <input
                id="producto-stock-minimo"
                type="number"
                inputMode="numeric"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
              />
            </div>
            {!producto && (
              <div className="campo">
                <label htmlFor="producto-cantidad-inicial">Cantidad inicial</label>
                <input
                  id="producto-cantidad-inicial"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={cantidadInicial}
                  onChange={(e) => setCantidadInicial(e.target.value)}
                />
              </div>
            )}
          </div>
          <p className="ayuda">Si el stock queda por debajo del mínimo, el producto se marca en la lista.</p>
        </div>

        <div className="form-seccion">
          <h2 className="form-seccion-titulo">Foto</h2>
          <label
            htmlFor="producto-imagen"
            className={arrastrando ? 'dropzone arrastrando' : 'dropzone'}
            onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={handleSoltarFoto}
          >
            {fotoVisible
              ? <img src={fotoVisible} alt="" className="dropzone-preview" />
              : <span className="dropzone-icono"><Icono nombre="foto" /></span>}
            <span className="dropzone-texto">
              <strong>{fotoVisible ? 'Cambiar foto' : 'Foto (opcional)'}</strong>
              <span>{imagenFile ? imagenFile.name : 'Tocá para elegir una imagen o arrastrala acá'}</span>
            </span>
          </label>
          <input
            id="producto-imagen"
            className="visualmente-oculto"
            type="file"
            accept="image/*"
            onChange={(e) => setImagenFile(e.target.files[0] ?? null)}
          />
        </div>

        <fieldset className="form-seccion product-form-proveedores">
          <legend className="form-seccion-titulo">Proveedores</legend>
          <div className="chips-seleccion">
            {proveedores.length === 0 && <p className="ayuda">Todavía no hay proveedores cargados.</p>}
            {proveedores.map((p) => (
              <label key={p.id} className="chip-check">
                <input
                  type="checkbox"
                  className="visualmente-oculto"
                  checked={proveedorIds.includes(p.id)}
                  onChange={() => toggleProveedor(p.id)}
                />
                <Icono nombre="check" />
                {p.nombre}
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="login-error">{error}</p>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  )
}
