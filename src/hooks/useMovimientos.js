import { useCallback, useState } from 'react'
import { registrarMovimiento } from '../services/movimientos.js'

export function useMovimientos () {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const registrar = useCallback(async (datos) => {
    setLoading(true)
    try {
      await registrarMovimiento(datos)
      setError(null)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { registrar, loading, error }
}
