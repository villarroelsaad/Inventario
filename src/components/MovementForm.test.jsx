import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('cancelar llama a onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<MovementForm producto={producto} tipo="entrada" onSave={() => {}} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onCancel).toHaveBeenCalled()
  })
})
