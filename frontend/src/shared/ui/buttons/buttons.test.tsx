import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { IconButton } from './IconButton'
import { LinkButton } from './LinkButton'

describe('Button', () => {
  it('preserves focus and keyboard event semantics without activating when disabled', () => {
    const onClick = vi.fn()
    const onKeyDown = vi.fn()
    render(<><Button onKeyDown={onKeyDown}>Continuar</Button><Button disabled onClick={onClick}>Salvar</Button></>)

    const enabled = screen.getByRole('button', { name: 'Continuar' })
    enabled.focus()
    fireEvent.keyDown(enabled, { key: 'Enter' })
    fireEvent.keyDown(enabled, { key: ' ' })

    expect(enabled).toHaveFocus()
    expect(onKeyDown).toHaveBeenCalledTimes(2)
    const disabled = screen.getByRole('button', { name: 'Salvar' })
    fireEvent.click(disabled)
    expect(disabled).toBeDisabled()
    expect(onClick).not.toHaveBeenCalled()
  })

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
  it('is focusable and receives the native Enter keyboard event', () => {
    const onKeyDown = vi.fn()
    render(<MemoryRouter><LinkButton to="/produtos" onKeyDown={onKeyDown}>Produtos</LinkButton></MemoryRouter>)

    const link = screen.getByRole('link', { name: 'Produtos' })
    link.focus()
    fireEvent.keyDown(link, { key: 'Enter' })

    expect(link).toHaveFocus()
    expect(link).toHaveAttribute('href', '/produtos')
    expect(onKeyDown).toHaveBeenCalledOnce()
  })

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
