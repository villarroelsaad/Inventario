import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export function useBarcodeScanner (onDetected) {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let activo = true
    let controls
    const reader = new BrowserMultiFormatReader()

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      if (result && activo) {
        onDetected(result.getText())
      }
    }).then((c) => {
      if (activo) {
        controls = c
      } else {
        c.stop()
      }
    }).catch(() => {
      if (activo) {
        setError('No se pudo acceder a la cámara')
      }
    })

    return () => {
      activo = false
      controls?.stop()
    }
  }, [onDetected])

  return { videoRef, error }
}
