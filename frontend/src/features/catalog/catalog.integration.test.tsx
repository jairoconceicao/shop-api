import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppRouter } from '../../app/router/AppRouter'
import { renderIntegration } from '../../shared/testing/renderIntegration'
import { server } from '../../shared/testing/server'
import { catalogQueryKeys } from './queries/useCatalogQuery'
import { productQueryKeys } from './queries/useProductDetailQuery'

const categories = {
  status: true,
  data: [
    {
      categoriaId: 5,
      titulo: 'Hardware',
      descricao: 'Componentes',
    },
  ],
} as const

const page = {
  status: true,
  pagination: {
    pages: 2,
    size: 20,
    totalItems: 21,
    data: [
      {
        produtoId: 42,
        titulo: 'Teclado Mecânico',
        thumb: null,
        preco: 199.9,
        estoque: 8,
        categoria: {
          categoriaId: 5,
          titulo: 'Hardware',
        },
      },
    ],
  },
} as const

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })

  return { promise, resolve }
}

function BackButton() {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>Voltar histórico</button>
}

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="URL atual">{location.search}</output>
}

describe('TASK-113 catalog integration', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    localStorage.clear()
    sessionStorage.clear()
    window.history.replaceState(null, '', '/')
  })

  it('starts categories and first catalog page before either response resolves', async () => {
    const categoryGate = deferred()
    const catalogGate = deferred()
    const started: string[] = []

    server.use(
      http.get('*/api/v1/categoria', async () => {
        started.push('categories')
        await categoryGate.promise
        started.push('categories:resolved')
        return HttpResponse.json(categories)
      }),
      http.get('*/api/v1/produto', async ({ request }) => {
        started.push(new URL(request.url).search)
        await catalogGate.promise
        started.push('catalog:resolved')
        return HttpResponse.json(page)
      }),
    )

    renderIntegration(<AppRouter />)

    await waitFor(() =>
      expect(started).toEqual(
        expect.arrayContaining(['categories', '?page=1&size=20']),
      ),
    )

    categoryGate.resolve()
    catalogGate.resolve()
    await waitFor(() =>
      expect(started).toEqual(
        expect.arrayContaining(['categories:resolved', 'catalog:resolved']),
      ),
    )
  })

  it('serializes search and page in URL/request and restores history', async () => {
    const urls: string[] = []

    server.use(
      http.get('*/api/v1/categoria', () => HttpResponse.json(categories)),
      http.get('*/api/v1/produto', ({ request }) => {
        urls.push(new URL(request.url).search)
        return HttpResponse.json(page)
      }),
    )

    const { user, queryClient } = renderIntegration(
      <>
        <AppRouter />
        <BackButton />
        <LocationProbe />
      </>,
    )

    const search = (
      await screen.findAllByRole('searchbox', { name: 'Buscar produtos' })
    )[0]

    await user.type(search, 'teclado')
    await user.keyboard('{Enter}')
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'URL atual' })).toHaveTextContent(
        '?searchword=teclado',
      ),
    )

    await user.click(screen.getByRole('button', { name: 'Página 2' }))
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'URL atual' })).toHaveTextContent(
        '?searchword=teclado&page=2',
      ),
    )
    expect(urls.at(-1)).toBe('?page=2&size=20&searchword=teclado')

    await user.click(screen.getByRole('button', { name: 'Voltar histórico' }))
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'URL atual' })).toHaveTextContent(
        '?searchword=teclado',
      ),
    )

    expect(
      screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0],
    ).toHaveValue('teclado')
    expect(
      queryClient.getQueryData(
        catalogQueryKeys.list({
          page: 1,
          size: 20,
          searchword: 'teclado',
        }),
      ),
    ).toEqual({
      products: [
        {
          id: 42,
          title: 'Teclado Mecânico',
          thumbnail: null,
          price: 199.9,
          stock: 8,
          category: { id: 5, title: 'Hardware' },
        },
      ],
      pagination: { pages: 2, size: 20, totalItems: 21 },
    })
    expect(
      screen.queryByRole('button', { name: 'Página 3' }),
    ).not.toBeInTheDocument()
  })

  it('uses only dedicated category endpoint', async () => {
    let general = 0
    let dedicated = 0

    server.use(
      http.get('*/api/v1/categoria', () => HttpResponse.json(categories)),
      http.get('*/api/v1/produto', () => {
        general += 1
        return HttpResponse.json(page)
      }),
      http.get('*/api/v1/produto/categoria/5', () => {
        dedicated += 1
        return HttpResponse.json(page)
      }),
    )

    renderIntegration(<AppRouter />, { initialEntries: ['/?categoriaId=5'] })

    expect(await screen.findByText('Teclado Mecânico')).toBeInTheDocument()
    expect(dedicated).toBe(1)
    expect(general).toBe(0)
  })

  it('canonicalizes invalid filters before the request', async () => {
    const urls: string[] = []

    server.use(
      http.get('*/api/v1/categoria', () => HttpResponse.json(categories)),
      http.get('*/api/v1/produto', ({ request }) => {
        urls.push(new URL(request.url).search)
        return HttpResponse.json(page)
      }),
    )

    renderIntegration(
      <>
        <AppRouter />
        <LocationProbe />
      </>,
      { initialEntries: ['/?page=abc&categoriaId=-2&searchword=%20%20'] },
    )

    expect(await screen.findByText('Teclado Mecânico')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'URL atual' })).toHaveTextContent(
        /^$/,
      ),
    )
    expect(urls).toEqual(['?page=1&size=20'])
  })

  it('renders product 404 after one request without retry', async () => {
    let calls = 0

    server.use(
      http.get('*/api/v1/categoria', () => HttpResponse.json(categories)),
      http.get('*/api/v1/produto/42', () => {
        calls += 1
        return HttpResponse.json(
          { error: { message: 'Produto ausente' } },
          { status: 404 },
        )
      }),
    )

    const { queryClient } = renderIntegration(<AppRouter />, {
      initialEntries: ['/produtos/42'],
    })

    expect(
      await screen.findByRole('heading', { name: 'Produto não encontrado' }),
    ).toBeInTheDocument()
    await new Promise((done) => setTimeout(done, 50))
    expect(calls).toBe(1)
    expect(queryClient.getQueryState(productQueryKeys.detail(42))?.status).toBe(
      'error',
    )
    expect(
      queryClient.getQueryData(productQueryKeys.detail(42)),
    ).toBeUndefined()
  })
})
