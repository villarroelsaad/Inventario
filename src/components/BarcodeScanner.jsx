import { useBarcodeScanner } from '../hooks/useBarcodeScanner.js'

export default function BarcodeScanner ({ onDetected, onCancel }) {
  const { videoRef, error } = useBarcodeScanner(onDetected)

  return (
    <section className="barcode-scanner">
      <h1>Escanear código</h1>
      <p>Apuntá la cámara al código de barras del producto.</p>
      <video ref={videoRef} className="barcode-scanner-video" muted playsInline />

      {error && <p className="login-error">{error}</p>}

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </section>
  )
}
