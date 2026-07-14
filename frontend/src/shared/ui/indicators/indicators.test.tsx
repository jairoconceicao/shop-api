import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Badge } from './Badge'
import { Chip } from './Chip'

describe('Badge', () => {
  it('uses the semantic status tokens', () => {
    render(<Badge status="success">Em estoque</Badge>)

    expect(screen.getByText('Em estoque')).toHaveClass(
      'bg-emerald-500/10',
      'text-emerald-300',
    )
  })
})

describe('Chip', () => {
  it('exposes selection and native button behavior', () => {
    const onClick = vi.fn()
    render(
      <Chip selected onClick={onClick}>
        Todos
      </Chip>,
    )

    const chip = screen.getByRole('button', { name: 'Todos', pressed: true })
    expect(chip).toHaveAttribute('type', 'button')
    expect(chip).toHaveClass('min-h-10', 'bg-brand-500/10')
    fireEvent.click(chip)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('forwards disabled state', () => {
    render(<Chip disabled>Indisponivel</Chip>)

    expect(screen.getByRole('button', { name: 'Indisponivel' })).toBeDisabled()
  })
})
