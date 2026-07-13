import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { IconButton } from './IconButton'
import { LinkButton } from './LinkButton'

describe('Button', () => {
  it('uses a safe button type and forwards native behavior', () => {
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Comprar</Button>)
    const button = screen.getByRole('button', { name: 'Comprar' })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('bg-brand-500', 'min-h-11')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('supports semantic variants, sizes and the disabled state', () => {
    render(
      <Button variant="danger" size="sm" disabled>
        Remover
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Remover' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('text-rose-300', 'min-h-9')
  })
})

describe('IconButton', () => {
  it('requires an accessible name and hides the decorative icon', () => {
    render(<IconButton aria-label="Abrir carrinho">cart-icon</IconButton>)

    const button = screen.getByRole('button', { name: 'Abrir carrinho' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('size-11', 'bg-transparent')
    expect(button.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('LinkButton', () => {
  it('renders navigation as a link with button styling', () => {
    render(
      <MemoryRouter>
        <LinkButton to="/produtos" variant="secondary" size="lg">
          Ver produtos
        </LinkButton>
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Ver produtos' })
    expect(link).toHaveAttribute('href', '/produtos')
    expect(link).toHaveClass('bg-ink-800', 'min-h-12')
  })
})
