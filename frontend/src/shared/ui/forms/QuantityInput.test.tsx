import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QuantityInput } from './QuantityInput'

describe('QuantityInput', () => {
  it('provides accessible names for the input and controls', () => {
    render(<QuantityInput label="Quantidade" value={2} min={1} max={4} onChange={vi.fn()} />)

    expect(screen.getByRole('spinbutton', { name: 'Quantidade' })).toHaveValue(2)
    expect(screen.getByRole('button', { name: 'Diminuir quantidade' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Aumentar quantidade' })).toBeEnabled()
  })

  it('increments, decrements and respects both limits', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <QuantityInput label="Quantidade" value={1} min={1} max={2} onChange={onChange} />,
    )

    expect(screen.getByRole('button', { name: 'Diminuir quantidade' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar quantidade' }))
    expect(onChange).toHaveBeenLastCalledWith(2)

    rerender(<QuantityInput label="Quantidade" value={2} min={1} max={2} onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Diminuir quantidade' }))
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('supports arrow, Home and End keys', () => {
    const onChange = vi.fn()
    render(<QuantityInput label="Quantidade" value={3} min={1} max={5} onChange={onChange} />)
    const input = screen.getByRole('spinbutton', { name: 'Quantidade' })

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith(4)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(onChange).toHaveBeenLastCalledWith(2)
    fireEvent.keyDown(input, { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith(1)
    fireEvent.keyDown(input, { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith(5)
  })

  it('clamps typed values and disables every control when unavailable', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <QuantityInput label="Quantidade" value={2} min={1} max={5} onChange={onChange} />,
    )

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Quantidade' }), {
      target: { value: '8' },
    })
    expect(onChange).toHaveBeenCalledWith(5)

    rerender(
      <QuantityInput label="Quantidade" value={2} min={1} max={5} disabled onChange={onChange} />,
    )
    expect(screen.getByRole('spinbutton', { name: 'Quantidade' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Diminuir quantidade' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()
  })
})
