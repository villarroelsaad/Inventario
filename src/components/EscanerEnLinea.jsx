import { useBarcodeScanner } from '../hooks/useBarcodeScanner.js'

export default function EscanerEnLinea ({ onDetected, onCancel }) {
  const { videoRef, error } = useBarcodeScanner(onDetected)

  return (
    <div className="escaner-en-linea">
      <div className="visor">
        <video ref={videoRef} className="barcode-scanner-video" muted playsInline />
        <span className="visor-marco" aria-hidden="true" />
      </div>
      {error && <p className="login-error">{error}</p>}
      <button type="button" className="link-button" onClick={onCancel}>Cancelar escaneo</button>
    </div>
  )
}
