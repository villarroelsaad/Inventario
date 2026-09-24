import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const decodeFromVideoDevice = vi.fn()
const stop = vi.fn()

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn(function () {
    this.decodeFromVideoDevice = decodeFromVideoDevice
  })
}))

const { useBarcodeScanner } = await import('./useBarcodeScanner.js')

beforeEach(() => {
  decodeFromVideoDevice.mockReset()
  stop.mockReset()
  decodeFromVideoDevice.mockResolvedValue({ stop })
})

describe('useBarcodeScanner', () => {
  it('inicia la lectura desde la camara al montar', async () => {
    renderHook(() => useBarcodeScanner(vi.fn()))

    await waitFor(() => expect(decodeFromVideoDevice).toHaveBeenCalled())
  })

  it('llama a onDetected con el texto leido', async () => {
    const onDetected = vi.fn()
    renderHook(() => useBarcodeScanner(onDetected))
    await waitFor(() => expect(decodeFromVideoDevice).toHaveBeenCalled())

    const callback = decodeFromVideoDevice.mock.calls[0][2]
    callback({ getText: () => '7791234567890' }, null)

    expect(onDetected).toHaveBeenCalledWith('7791234567890')
  })

  it('ignora los intentos fallidos (sin resultado)', async () => {
    const onDetected = vi.fn()
    renderHook(() => useBarcodeScanner(onDetected))
    await waitFor(() => expect(decodeFromVideoDevice).toHaveBeenCalled())

    const callback = decodeFromVideoDevice.mock.calls[0][2]
    callback(undefined, new Error('no encontrado'))

    expect(onDetected).not.toHaveBeenCalled()
  })

  it('detiene el lector al desmontar', async () => {
    const { unmount } = renderHook(() => useBarcodeScanner(vi.fn()))
    await waitFor(() => expect(decodeFromVideoDevice).toHaveBeenCalled())

    unmount()

    await waitFor(() => expect(stop).toHaveBeenCalled())
  })

  it('expone un error si no se puede acceder a la camara', async () => {
    decodeFromVideoDevice.mockRejectedValue(new Error('NotAllowedError'))

    const { result } = renderHook(() => useBarcodeScanner(vi.fn()))

    await waitFor(() => expect(result.current.error).toBe('No se pudo acceder a la cámara'))
  })
})
