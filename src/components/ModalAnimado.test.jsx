import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModalAnimado from './ModalAnimado.jsx'

describe('ModalAnimado', () => {
  afterEach(() => vi.useRealTimers())

  it('muestra el contenido cuando está abierto y nada cuando está cerrado', () => {
    const { rerender } = render(<ModalAnimado abierto={false}><p>Contenido</p></ModalAnimado>)
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()

    rerender(<ModalAnimado abierto><p>Contenido</p></ModalAnimado>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('al cerrarse mantiene el último contenido mientras dura la animación de salida', () => {
    vi.useFakeTimers()
    const { rerender, container } = render(<ModalAnimado abierto><p>Detalle de Yerba</p></ModalAnimado>)

    rerender(<ModalAnimado abierto={false}>{null}</ModalAnimado>)
    expect(screen.getByText('Detalle de Yerba')).toBeInTheDocument()
    expect(container.querySelector('.modal-backdrop')).toHaveClass('cerrando')

    act(() => vi.advanceTimersByTime(300))
    expect(screen.queryByText('Detalle de Yerba')).not.toBeInTheDocument()
  })

  it('tocar el fondo oscuro pide cerrar', async () => {
    const onCerrar = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<ModalAnimado abierto onCerrar={onCerrar}><p>Contenido</p></ModalAnimado>)

    await user.click(container.querySelector('.modal-backdrop'))
    expect(onCerrar).toHaveBeenCalled()

    await user.click(screen.getByText('Contenido'))
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })
})
