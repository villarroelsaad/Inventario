import { useBarcodeScanner } from '../hooks/useBarcodeScanner.js'
import ModalHeader from './ModalHeader.jsx'

export default function BarcodeScanner ({ onDetected, onCancel }) {
  const { videoRef, error } = useBarcodeScanner(onDetected)

  return (
    <section className="barcode-scanner hoja">
      <ModalHeader
        icono="camara"
        titulo="Escanear código"
        bajada="Apuntá la cámara al código de barras del producto."
        onClose={onCancel}
      />

      <div className="hoja-cuerpo">
        <div className="visor">
          <video ref={videoRef} className="barcode-scanner-video" muted playsInline />
          <span className="visor-marco" aria-hidden="true" />
        </div>
        {error && <p className="login-error">{error}</p>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </section>
  )
}
