import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SupplierForm from './SupplierForm.jsx'

describe('SupplierForm', () => {
  it('crear: llama a onSave con los datos cargados', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<SupplierForm onSave={onSave} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/nombre/i), 'Distribuidora Sur')
    await user.type(screen.getByLabelText(/contacto/i), '11-2222-3333')
    await user.type(screen.getByLabelText(/notas/i), 'Entrega los lunes')
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    expect(onSave).toHaveBeenCalledWith({
      nombre: 'Distribuidora Sur',
      contacto: '11-2222-3333',
      notas: 'Entrega los lunes'
    })
  })

  it('editar: arranca con los datos existentes', () => {
    render(
      <SupplierForm
        proveedor={{ id: '1', nombre: 'Distribuidora Sur', contacto: '11-2222', notas: '' }}
        onSave={() => {}}
        onCancel={() => {}}
      />
    )
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Distribuidora Sur')
    expect(screen.getByLabelText(/contacto/i)).toHaveValue('11-2222')
  })

  it('cancelar llama a onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<SupplierForm onSave={() => {}} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onCancel).toHaveBeenCalled()
  })
})
