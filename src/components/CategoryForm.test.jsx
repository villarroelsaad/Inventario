import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategoryForm from './CategoryForm.jsx'

describe('CategoryForm', () => {
  it('crear: arranca vacio y llama a onSave con el nombre', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<CategoryForm onSave={onSave} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/nombre/i), 'Almacén')
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    expect(onSave).toHaveBeenCalledWith('Almacén')
  })

  it('editar: arranca con el nombre existente', () => {
    render(<CategoryForm categoria={{ id: '1', nombre: 'Bebidas' }} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Bebidas')
  })

  it('cancelar llama a onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<CategoryForm onSave={() => {}} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onCancel).toHaveBeenCalled()
  })
})
