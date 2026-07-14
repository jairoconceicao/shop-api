import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('is hidden from assistive technology and preserves consumer dimensions', () => {
    const { container } = render(<Skeleton className="h-24 w-full" data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')

    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    expect(skeleton).toHaveClass('h-24', 'w-full')
    expect(container).not.toHaveAccessibleName()
  })
})

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    render(<EmptyState title="Carrinho vazio" description="Adicione produtos para continuar." action={<button>Explorar produtos</button>} />)

    expect(screen.getByRole('heading', { name: 'Carrinho vazio' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Explorar produtos' })).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('uses alert semantics and supports a recovery action', () => {
    render(<ErrorState action={<button>Tentar novamente</button>} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o conteúdo')
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })
})
