import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ProductImage } from './ProductImage'

describe('ProductImage', () => {
  it('renders an image with alternative text and reserved dimensions', () => {
    const { container } = render(
      <ProductImage src="/product.webp" alt="Notebook preto" width={800} height={600} />,
    )

    const image = screen.getByRole('img', { name: 'Notebook preto' })

    expect(image).toHaveAttribute('src', '/product.webp')
    expect(image).toHaveAttribute('width', '800')
    expect(image).toHaveAttribute('height', '600')
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(container.firstChild).toHaveStyle({ aspectRatio: '800 / 600' })
  })

  it('renders an accessible fallback when the source is absent', () => {
    render(<ProductImage src={null} alt="Mouse sem fio" />)

    expect(screen.getByRole('img', { name: 'Mouse sem fio' })).toHaveTextContent(
      'Imagem indisponível',
    )
  })

  it('replaces a broken image and accepts a new source afterwards', () => {
    const onError = vi.fn()
    const { rerender } = render(
      <ProductImage src="/broken.webp" alt="Teclado mecânico" onError={onError} />,
    )

    fireEvent.error(screen.getByRole('img', { name: 'Teclado mecânico' }))
    expect(onError).toHaveBeenCalledOnce()
    expect(screen.getByRole('img', { name: 'Teclado mecânico' })).toHaveTextContent(
      'Imagem indisponível',
    )

    rerender(<ProductImage src="/working.webp" alt="Teclado mecânico" />)
    expect(screen.getByRole('img', { name: 'Teclado mecânico' })).toHaveAttribute(
      'src',
      '/working.webp',
    )
  })
})
