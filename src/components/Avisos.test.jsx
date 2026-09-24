import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import Avisos from './Avisos.jsx'
import { avisar } from '../lib/avisos.js'

describe('Avisos', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el mensaje cuando alguien avisa y lo anuncia a lectores de pantalla', () => {
    render(<Avisos />)

    act(() => avisar('Producto guardado'))

    expect(screen.getByRole('status')).toHaveTextContent('Producto guardado')
  })

  it('el aviso desaparece solo después de unos segundos', () => {
    vi.useFakeTimers()
    render(<Avisos />)

    act(() => avisar('Categoría guardada'))
    expect(screen.getByText('Categoría guardada')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(4000))
    expect(screen.queryByText('Categoría guardada')).not.toBeInTheDocument()
  })

  it('antes de desaparecer el aviso pasa a estado de salida (fundido)', () => {
    vi.useFakeTimers()
    render(<Avisos />)

    act(() => avisar('Proveedor guardado'))
    act(() => vi.advanceTimersByTime(2900))

    expect(screen.getByText('Proveedor guardado')).toHaveClass('saliendo')
  })

  it('avisar sin nadie escuchando no rompe nada', () => {
    expect(() => avisar('Sin pantalla')).not.toThrow()
  })
})
