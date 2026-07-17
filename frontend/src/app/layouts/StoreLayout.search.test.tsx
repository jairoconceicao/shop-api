import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, Outlet, RouterProvider, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HomePage } from '../../features/catalog/pages/HomePage'
import { StoreLayout } from './StoreLayout'

const { fetchCatalog, fetchCategories, fetchProductsByCategory } = vi.hoisted(() => ({
  fetchCatalog: vi.fn(),
  fetchCategories: vi.fn(),
  fetchProductsByCategory: vi.fn(),
}))

vi.mock('../../features/catalog/services/catalogService', () => ({ fetchCatalog }))
vi.mock('../../features/catalog/services/categoryService', () => ({ fetchCategories }))
vi.mock('../../features/catalog/services/productsByCategoryService', () => ({ fetchProductsByCategory }))

function NavigationProbe() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <output aria-label="Localização atual">{`${location.pathname}${location.search}`}</output>
      <button type="button" onClick={() => navigate(-1)}>Voltar histórico</button>
      <button type="button" onClick={() => navigate(1)}>Avançar histórico</button>
      <Outlet />
    </>
  )
}

function renderStore(initialEntry: string) {
  const router = createMemoryRouter(
    [
      {
        element: <NavigationProbe />,
        children: [
          {
            element: <StoreLayout />,
            children: [
              { index: true, element: <HomePage /> },
              { path: 'carrinho', element: <h1>Carrinho</h1> },
            ],
          },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  fetchCatalog.mockReset()
  fetchCategories.mockReset()
  fetchProductsByCategory.mockReset()
  fetchCatalog.mockResolvedValue({ products: [], pagination: { pages: 1, size: 20, totalItems: 0 } })
  fetchCategories.mockResolvedValue([])
  fetchProductsByCategory.mockResolvedValue({ products: [], pagination: { pages: 1, size: 20, totalItems: 0 } })
})

describe('StoreLayout catalog search', () => {
  it('pushes canonical pagination URLs and restores request and UI through history', async () => {
    fetchCatalog.mockImplementation(async ({ page }: { page: number }) => ({
      products: [{ id: page, title: `Produto página ${page}`, thumbnail: null, price: 10, stock: 1, category: { id: 1, title: 'Geral' } }],
      pagination: { pages: 3, size: 20, totalItems: 41 },
    }))
    renderStore('/?searchword=ssd&page=2')

    expect(await screen.findByText('Produto página 2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Página 3' }))
    expect(await screen.findByText('Produto página 3')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/?searchword=ssd&page=3')

    fireEvent.click(screen.getByRole('button', { name: 'Voltar histórico' }))
    expect(await screen.findByText('Produto página 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')

    fireEvent.click(screen.getByRole('button', { name: 'Avançar histórico' }))
    expect(await screen.findByText('Produto página 3')).toBeInTheDocument()
    expect(fetchCatalog).toHaveBeenCalledWith({ page: 3, size: 20, searchword: 'ssd' }, expect.any(AbortSignal))

    fireEvent.click(screen.getByRole('button', { name: 'Página 1' }))
    expect(await screen.findByText('Produto página 1')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/?searchword=ssd')
  })

  it('troca endpoint e produtos ao navegar por categoria e pelo histórico', async () => {
    fetchCategories.mockResolvedValue([{ id: 7, title: 'Games', description: null }])
    fetchCatalog.mockResolvedValue({
      products: [{ id: 1, title: 'Produto geral', thumbnail: null, price: 10, stock: 1, category: { id: 1, title: 'Geral' } }],
      pagination: { pages: 1, size: 20, totalItems: 1 },
    })
    fetchProductsByCategory.mockResolvedValue({
      products: [{ id: 7, title: 'Produto da categoria', thumbnail: null, price: 20, stock: 1, category: { id: 7, title: 'Games' } }],
      pagination: { pages: 1, size: 20, totalItems: 1 },
    })
    renderStore('/?searchword=console&page=2')

    expect(await screen.findByText('Produto geral')).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('link', { name: 'Games' }))

    expect(await screen.findByText('Produto da categoria')).toBeInTheDocument()
    expect(screen.queryByText('Produto geral')).not.toBeInTheDocument()
    expect(fetchProductsByCategory).toHaveBeenCalledWith(7, expect.any(AbortSignal))

    fireEvent.click(screen.getByRole('button', { name: 'Voltar histórico' }))
    expect(await screen.findByText('Produto geral')).toBeInTheDocument()
    expect(screen.queryByText('Produto da categoria')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Avançar histórico' }))
    expect(await screen.findByText('Produto da categoria')).toBeInTheDocument()
  })

  it('submits canonical search URL preserving category and resets page', async () => {
    renderStore('/?categoriaId=7&page=4')
    const inputs = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })

    fireEvent.change(inputs[0], { target: { value: '  teclado gamer  ' } })
    for (const input of inputs) expect(input).toHaveValue('  teclado gamer  ')
    fireEvent.submit(inputs[0].closest('form')!)

    expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent(
      '/?searchword=teclado+gamer&categoriaId=7',
    )
    await waitFor(() => expect(fetchProductsByCategory).toHaveBeenCalledWith(7, expect.any(AbortSignal)))
    expect(fetchCatalog).not.toHaveBeenCalled()
  })

  it('uses push history and synchronizes both inputs and query on back and forward', async () => {
    renderStore('/?searchword=mouse&page=2')
    const inputs = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })

    for (const input of inputs) expect(input).toHaveValue('mouse')
    fireEvent.change(inputs[0], { target: { value: 'monitor' } })
    fireEvent.submit(inputs[0].closest('form')!)
    for (const input of inputs) expect(input).toHaveValue('monitor')

    fireEvent.click(screen.getByRole('button', { name: 'Voltar histórico' }))
    await waitFor(() => {
      for (const input of screen.getAllByRole('searchbox', { name: 'Buscar produtos' })) {
        expect(input).toHaveValue('mouse')
      }
    })
    await waitFor(() => expect(fetchCatalog).toHaveBeenCalledWith(
      { page: 2, size: 20, searchword: 'mouse' },
      expect.any(AbortSignal),
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Avançar histórico' }))
    await waitFor(() => {
      for (const input of screen.getAllByRole('searchbox', { name: 'Buscar produtos' })) {
        expect(input).toHaveValue('monitor')
      }
    })
    await waitFor(() => expect(fetchCatalog).toHaveBeenCalledWith(
      { page: 1, size: 20, searchword: 'monitor' },
      expect.any(AbortSignal),
    ))
  })

  it('removes empty search and page while preserving category', () => {
    renderStore('/?searchword=mouse&categoriaId=7&page=3')
    const input = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]

    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(input.closest('form')!)

    expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent(
      '/?categoriaId=7',
    )
  })

  it('submits search from a child route to the catalog pathname', async () => {
    renderStore('/carrinho?categoriaId=7&page=2')
    const input = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]

    fireEvent.change(input, { target: { value: '  teclado  ' } })
    fireEvent.submit(input.closest('form')!)

    expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent(
      '/?searchword=teclado&categoriaId=7',
    )
    await waitFor(() => expect(fetchProductsByCategory).toHaveBeenCalledWith(7, expect.any(AbortSignal)))
    expect(fetchCatalog).not.toHaveBeenCalled()
  })
})

describe('StoreLayout debounced search', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    fetchCatalog.mockReset()
    fetchCategories.mockReset()
    fetchProductsByCategory.mockReset()
    fetchCatalog.mockResolvedValue({ products: [], pagination: { pages: 1, size: 20, totalItems: 0 } })
    fetchCategories.mockResolvedValue([])
    fetchProductsByCategory.mockResolvedValue({ products: [], pagination: { pages: 1, size: 20, totalItems: 0 } })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function renderStore(initialEntry: string) {
    const router = createMemoryRouter(
      [
        {
          element: <NavigationProbe />,
          children: [
            {
              element: <StoreLayout />,
              children: [
                { index: true, element: <HomePage /> },
                { path: 'carrinho', element: <h1>Carrinho</h1> },
              ],
            },
          ],
        },
      ],
      { initialEntries: [initialEntry] },
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
  }

  it('navigates automatically after 300ms of typing inactivity', async () => {
    renderStore('/')
    const input = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]

    fireEvent.change(input, { target: { value: 'teclado' } })

    expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/')

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/?searchword=teclado')
    })
  })

  it('only triggers one navigation after rapid typing', async () => {
    renderStore('/')
    const input = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]

    fireEvent.change(input, { target: { value: 't' } })
    vi.advanceTimersByTime(100)
    fireEvent.change(input, { target: { value: 'te' } })
    vi.advanceTimersByTime(100)
    fireEvent.change(input, { target: { value: 'tec' } })
    vi.advanceTimersByTime(100)
    fireEvent.change(input, { target: { value: 'tecl' } })

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/?searchword=tecl')
    })
  })

  it('does not trigger navigation on initial mount with pre-filled searchword', async () => {
    renderStore('/?searchword=mouse')
    const input = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]

    expect(input).toHaveValue('mouse')

    vi.advanceTimersByTime(500)
    await vi.runAllTimersAsync()

    expect(fetchCatalog).toHaveBeenCalledTimes(1)
  })

  it('uses replace navigation for debounced search', async () => {
    renderStore('/')
    let input = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]

    fireEvent.change(input, { target: { value: 'teclado' } })
    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/?searchword=teclado')
    })

    input = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]
    fireEvent.change(input, { target: { value: 'monitor' } })
    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/?searchword=monitor')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Voltar histórico' }))
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/')
    })
  })

  it('form submit still uses push navigation', async () => {
    renderStore('/')
    let input = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]

    fireEvent.change(input, { target: { value: 'teclado' } })
    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/?searchword=teclado')
    })

    input = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]
    fireEvent.change(input, { target: { value: 'monitor' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/?searchword=monitor')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Voltar histórico' }))
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent('/?searchword=teclado')
    })
  })
})
