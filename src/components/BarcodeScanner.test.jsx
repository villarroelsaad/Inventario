import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BarcodeScanner from './BarcodeScanner.jsx'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner.js'

vi.mock('../hooks/useBarcodeScanner.js', () => ({
  useBarcodeScanner: vi.fn()
}))

describe('BarcodeScanner', () => {
  it('pasa onDetected al hook y muestra el video de la camara', () => {
    useBarcodeScanner.mockReturnValue({ videoRef: { current: null }, error: null })
    const onDetected = vi.fn()

    const { container } = render(<BarcodeScanner onDetected={onDetected} onCancel={() => {}} />)

    expect(useBarcodeScanner).toHaveBeenCalledWith(onDetected)
    expect(container.querySelector('video')).toBeInTheDocument()
  })

  it('muestra el error de camara si lo hay', () => {
    useBarcodeScanner.mockReturnValue({ videoRef: { current: null }, error: 'No se pudo acceder a la cámara' })

    render(<BarcodeScanner onDetected={() => {}} onCancel={() => {}} />)

    expect(screen.getByText('No se pudo acceder a la cámara')).toBeInTheDocument()
  })

  it('cancelar llama a onCancel', async () => {
    useBarcodeScanner.mockReturnValue({ videoRef: { current: null }, error: null })
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<BarcodeScanner onDetected={() => {}} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onCancel).toHaveBeenCalled()
  })
})
