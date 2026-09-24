import { describe, it, expect } from 'vitest'
import { calcularMargen, MARGEN_BAJO } from './margen.js'

describe('calcularMargen', () => {
  it('ganancia por unidad y margen sobre la venta', () => {
    expect(calcularMargen(12, 8)).toEqual({ ganancia: 4, porcentaje: 33, nivel: 'ok' })
  })

  it('margen bajo si queda por debajo del umbral', () => {
    expect(MARGEN_BAJO).toBe(15)
    expect(calcularMargen(100, 90).nivel).toBe('bajo')
  })

  it('vender por debajo del costo es margen negativo', () => {
    expect(calcularMargen(8, 10)).toEqual({ ganancia: -2, porcentaje: -25, nivel: 'negativo' })
  })

  it('sin precio o sin costo no se puede calcular', () => {
    expect(calcularMargen(null, 5)).toBeNull()
    expect(calcularMargen(10, null)).toBeNull()
    expect(calcularMargen(0, 5)).toBeNull()
    expect(calcularMargen('', '')).toBeNull()
  })

  it('acepta valores escritos como texto (campos del formulario)', () => {
    expect(calcularMargen('12', '8').ganancia).toBe(4)
  })
})
