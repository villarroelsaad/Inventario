import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MovementForm from './MovementForm.jsx'

const producto = { id: 'A1', nombre: 'Yerba 1kg', stock: 10 }

describe('MovementForm', () => {
  it('entrada: muestra el producto y llama a onSave con cantidad y motivo', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<MovementForm producto={producto} tipo="entrada" onSave={onSave} onCancel={() => {}} />)

    expect(screen.getByText(/registrar entrada/i)).toBeInTheDocument()
    expect(screen.getByText(/yerba 1kg/i)).toBeInTheDocument()
    expect(screen.getByText(/10/)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/cantidad/i), '5')
    await user.type(screen.getByLabelText(/motivo/i), 'Reposición')
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    expect(onSave).toHaveBeenCalledWith(5, 'Reposición')
  })

  it('salida: el titulo cambia y el motivo es opcional', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<MovementForm producto={producto} tipo="salida" onSave={onSave} onCancel={() => {}} />)

    expect(screen.getByText(/registrar salida/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/cantidad/i), '2')
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    expect(onSave).toHaveBeenCalledWith(2, null)
  })

  it('muestra el error si se pasa por props (ej. no hay stock suficiente)', () => {
    render(<MovementForm producto={producto} tipo="salida" error="No hay stock suficiente" onSave={() => {}} onCancel={() => {}} />)

    expect(screen.getByText('No hay stock suficiente')).toBeInTheDocument()
  })

  it('salida: avisa antes de guardar si la cantidad supera el stock actual', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<MovementForm producto={producto} tipo="salida" onSave={onSave} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/cantidad/i), '99')

    expect(screen.getByText(/no hay stock suficiente/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))
    expect(onSave).not.toHaveBeenCalled()
  })

  it('entrada: no avisa de stock aunque la cantidad sea alta', async () => {
    const user = userEvent.setup()
    render(<MovementForm producto={producto} tipo="entrada" onSave={() => {}} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/cantidad/i), '99')

    expect(screen.queryByText(/no hay stock suficiente/i)).not.toBeInTheDocument()
  })

  it('cancelar llama a onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<MovementForm producto={producto} tipo="entrada" onSave={() => {}} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('dos toques muy seguidos en sumar cuentan los dos', () => {
    render(<MovementForm producto={producto} tipo="entrada" onSave={() => {}} onCancel={() => {}} />)
    const sumar = screen.getByRole('button', { name: /sumar uno/i })

    act(() => {
      sumar.click()
      sumar.click()
    })

    expect(screen.getByLabelText(/cantidad/i)).toHaveValue(2)
  })

  it('los botones de sumar y restar cambian la cantidad', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<MovementForm producto={producto} tipo="entrada" onSave={onSave} onCancel={() => {}} />)

    await user.click(screen.getByRole('button', { name: /sumar uno/i }))
    await user.click(screen.getByRole('button', { name: /sumar uno/i }))
    await user.click(screen.getByRole('button', { name: /sumar uno/i }))
    await user.click(screen.getByRole('button', { name: /restar uno/i }))

    expect(screen.getByLabelText(/cantidad/i)).toHaveValue(2)
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))
    expect(onSave).toHaveBeenCalledWith(2, null)
  })
})
