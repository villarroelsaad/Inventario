import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

function mockMatchMedia (prefiereOscuro) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: prefiereOscuro,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }))
}

describe('useTema', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sin preferencia guardada, sigue el modo del sistema y no fuerza data-theme', async () => {
    mockMatchMedia(false)
    const { useTema } = await import('./useTema.js')
    const { result } = renderHook(() => useTema())

    expect(result.current.temaEfectivo).toBe('light')
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })

  it('alternarTema fuerza el modo contrario y lo guarda', async () => {
    mockMatchMedia(false)
    const { useTema } = await import('./useTema.js')
    const { result } = renderHook(() => useTema())

    act(() => result.current.alternarTema())

    expect(result.current.temaEfectivo).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('tema')).toBe('dark')
  })

  it('al cambiar de tema marca el documento un instante para que los colores se deslicen', async () => {
    vi.useFakeTimers()
    mockMatchMedia(false)
    const { useTema } = await import('./useTema.js')
    const { result } = renderHook(() => useTema())

    act(() => result.current.alternarTema())
    expect(document.documentElement.classList.contains('tema-cambiando')).toBe(true)

    act(() => vi.advanceTimersByTime(500))
    expect(document.documentElement.classList.contains('tema-cambiando')).toBe(false)
    vi.useRealTimers()
  })

  it('si ya habia una preferencia guardada, arranca con esa', async () => {
    mockMatchMedia(false)
    localStorage.setItem('tema', 'dark')
    const { useTema } = await import('./useTema.js')
    const { result } = renderHook(() => useTema())

    expect(result.current.temaEfectivo).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
