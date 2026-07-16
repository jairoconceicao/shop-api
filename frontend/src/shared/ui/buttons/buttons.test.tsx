import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { IconButton } from './IconButton'
import { LinkButton } from './LinkButton'

describe('Button', () => {
  it('activates with Enter and Space and blocks interaction when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onDisabledClick = vi.fn()
    render(<><Button onClick={onClick}>Continuar</Button><Button disabled onClick={onDisabledClick}>Salvar</Button></>)

    const enabled = screen.getByRole('button', { name: 'Continuar' })
    await user.tab()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(enabled).toHaveFocus()
    expect(onClick).toHaveBeenCalledTimes(2)
    const disabled = screen.getByRole('button', { name: 'Salvar' })
    await user.click(disabled)
    expect(disabled).toBeDisabled()
    expect(onDisabledClick).not.toHaveBeenCalled()
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
  it('navigates with Enter while preserving the target route', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/']}><Routes><Route path="/" element={<LinkButton to="/produtos">Produtos</LinkButton>} /><Route path="/produtos" element={<h1>Catálogo</h1>} /></Routes></MemoryRouter>)

    const link = screen.getByRole('link', { name: 'Produtos' })
    await user.tab()

    expect(link).toHaveFocus()
    expect(link).toHaveAttribute('href', '/produtos')
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
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
