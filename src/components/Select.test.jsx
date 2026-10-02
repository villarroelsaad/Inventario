import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Select from './Select.jsx'

const OPCIONES = [
  { value: '', label: 'Todos los proveedores' },
  { value: 'p1', label: 'Proveedor A' },
  { value: 'p2', label: 'Proveedor B' }
]

describe('Select', () => {
  it('muestra la opción seleccionada como valor visible', () => {
    render(<Select ariaLabel="Proveedor" value="p1" onChange={() => {}} options={OPCIONES} />)
    expect(screen.getByRole('button', { name: 'Proveedor' })).toHaveTextContent('Proveedor A')
  })

  it('abre la lista de opciones al hacer clic en el botón', async () => {
    const user = userEvent.setup()
    render(<Select ariaLabel="Proveedor" value="" onChange={() => {}} options={OPCIONES} />)

    await user.click(screen.getByRole('button', { name: 'Proveedor' }))

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Proveedor A' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Proveedor B' })).toBeInTheDocument()
  })

  it('elegir una opción llama a onChange con su valor y cierra la lista', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select ariaLabel="Proveedor" value="" onChange={onChange} options={OPCIONES} />)

    await user.click(screen.getByRole('button', { name: 'Proveedor' }))
    await user.click(screen.getByText('Proveedor B'))

    expect(onChange).toHaveBeenCalledWith('p2')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('Escape cierra la lista sin cambiar el valor', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select ariaLabel="Proveedor" value="" onChange={onChange} options={OPCIONES} />)

    await user.click(screen.getByRole('button', { name: 'Proveedor' }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clic afuera cierra la lista', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Select ariaLabel="Proveedor" value="" onChange={() => {}} options={OPCIONES} />
        <button type="button">Afuera</button>
      </div>
    )

    await user.click(screen.getByRole('button', { name: 'Proveedor' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByText('Afuera'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('flecha abajo y Enter eligen la siguiente opción', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select ariaLabel="Proveedor" value="" onChange={onChange} options={OPCIONES} />)

    const boton = screen.getByRole('button', { name: 'Proveedor' })
    boton.focus()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')

    expect(onChange).toHaveBeenCalledWith('p1')
  })
})
