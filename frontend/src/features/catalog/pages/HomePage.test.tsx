import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HomePage } from './HomePage'

const { fetchCatalog, fetchCategories } = vi.hoisted(() => ({
  fetchCatalog: vi.fn(),
  fetchCategories: vi.fn(),
}))

vi.mock('../services/catalogService', () => ({ fetchCatalog }))
vi.mock('../services/categoryService', () => ({ fetchCategories }))

const catalogPage = {
  products: [
    {
      id: 17,
      title: 'Teclado mecânico',
      thumbnail: null,
      price: 349.9,
      stock: 8,
      category: { id: 4, title: 'Periféricos' },
    },
    {
      id: 23,
      title: 'Mouse sem fio',
      thumbnail: null,
      price: 129.9,
      stock: 0,
      category: { id: 4, title: 'Periféricos' },
    },
  ],
  pagination: { pages: 1, size: 20, totalItems: 2 },
}

beforeEach(() => {
  fetchCatalog.mockReset()
  fetchCategories.mockReset()
  fetchCatalog.mockResolvedValue(catalogPage)
  fetchCategories.mockResolvedValue([])
})

function renderHomePage(initialEntry = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return render(<HomePage />, { wrapper: Wrapper })
}

describe('HomePage', () => {
  it('presents a neutral hero with a real link to the catalog section', () => {
    const { container } = renderHomePage()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Encontre produtos para o seu dia a dia' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar catálogo' })).toHaveAttribute(
      'href',
      '#catalogo',
    )
    expect(container.querySelector('section#catalogo')).toHaveClass('scroll-mt-32')
    expect(screen.getByRole('heading', { level: 2, name: 'Catálogo' })).toBeInTheDocument()
  })

  it('does not present unsupported promotional claims', () => {
    renderHomePage()

    expect(document.body).not.toHaveTextContent(
      /promoção|desconto|oferta|frete|entrega (?:rápida|grátis)|mais vendidos/i,
    )
  })

  it('starts categories and the first catalog page before either request resolves', async () => {
    let resolveCatalog!: (value: typeof catalogPage) => void
    let resolveCategories!: (value: []) => void
    fetchCatalog.mockReturnValue(
      new Promise((resolve) => {
        resolveCatalog = resolve
      }),
    )
    fetchCategories.mockReturnValue(
      new Promise((resolve) => {
        resolveCategories = resolve
      }),
    )

    renderHomePage()

    await waitFor(() => {
      expect(fetchCategories).toHaveBeenCalledOnce()
      expect(fetchCatalog).toHaveBeenCalledWith(
        { page: 1, size: 20 },
        expect.any(AbortSignal),
      )
    })

    resolveCategories([])
    resolveCatalog(catalogPage)
    expect(await screen.findByText('Teclado mecânico')).toBeInTheDocument()
  })

  it('derives page and searchword from the catalog URL', async () => {
    renderHomePage('/?searchword=ssd&page=3&categoriaId=9')

    await waitFor(() => expect(fetchCatalog).toHaveBeenCalledWith(
      { page: 3, size: 20, searchword: 'ssd' },
      expect.any(AbortSignal),
    ))
  })

  it('renders catalog products in a responsive grid using product cards', async () => {
    const { container } = renderHomePage()

    expect(await screen.findByText('Teclado mecânico')).toBeInTheDocument()
    expect(screen.getByText('Mouse sem fio')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Ver detalhes' })[0]).toHaveAttribute(
      'href',
      '/produtos/17',
    )
    expect(container.querySelector('[data-testid="catalog-grid"]')).toHaveClass(
      'grid',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4',
    )
  })
})
