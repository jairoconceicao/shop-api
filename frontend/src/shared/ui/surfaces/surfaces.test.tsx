import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from './Card'
import { Surface } from './Surface'

describe('Surface', () => {
  it('supports base and raised visual hierarchy', () => {
    const { rerender } = render(<Surface>Conteudo</Surface>)

    expect(screen.getByText('Conteudo')).toHaveClass('surface')

    rerender(<Surface variant="raised">Conteudo</Surface>)
    expect(screen.getByText('Conteudo')).toHaveClass('surface-raised')
  })
})

describe('Card', () => {
  it('renders an article and supports the interactive variant', () => {
    render(
      <Card variant="interactive" className="p-4">
        Produto
      </Card>,
    )

    const card = screen.getByText('Produto')
    expect(card.tagName).toBe('ARTICLE')
    expect(card).toHaveClass(
      'surface-raised',
      'hover:-translate-y-1',
      'p-4',
    )
  })
})
