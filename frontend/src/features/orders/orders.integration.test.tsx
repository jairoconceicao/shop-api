import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRouter } from '../../app/router/AppRouter'
import { renderIntegration } from '../../shared/testing/renderIntegration'
import { server } from '../../shared/testing/server'
import { useAuthStore } from '../auth/store/authStore'
import { orderQueryKeys } from './cache/orderQueryKeys'

const address = {
  logradouro: 'Rua A',
  numero: '10',
  complemento: null,
  cep: '01001000',
  bairro: 'Centro',
  cidade: 'São Paulo',
  uf: 'SP',
} as const

const profile = {
  status: true,
  data: {
    clienteId: 7,
    cpf: '12345678901',
    nome: 'Ana Silva',
    dataNascimento: '1990-05-20',
    email: 'ana@example.com',
    endereco: address,
    celular: { ddd: '11', numero: '999999999', whatsApp: true },
  },
} as const

const order = {
  pedidoId: 900,
  carrinhoId: 70,
  clienteId: 7,
  enderecoEntrega: address,
  dataPedido: '2026-07-16T10:30:00Z',
  formaPagamento: 'Pix',
  status: 'Criado',
  items: [
    {
      itemId: 901,
      produtoId: 42,
      quantidade: 1,
      valorUnitario: 199.9,
    },
    {
      itemId: 902,
      produtoId: 42,
      quantidade: 2,
      valorUnitario: 199.9,
    },
  ],
} as const

const listResponse = {
  status: true,
  pagination: { pages: 2, size: 20, totalItems: 21, data: [order] },
} as const

const detailResponse = { status: true, data: order } as const

const cancelledDetailResponse = {
  status: true,
  data: { ...order, status: 'Cancelado' },
} as const

const cancelResponse = {
  status: true,
  data: {
    pedidoId: 900,
    clienteId: 7,
    dataPedido: '2026-07-16T10:30:00Z',
    status: 'Cancelado',
  },
} as const

const product = {
  status: true,
  data: {
    produtoId: 42,
    titulo: 'Teclado Mecânico',
    descricao: 'ABNT2',
    modelo: 'TK42',
    foto: null,
    preco: 199.9,
    estoque: 8,
    categoria: { categoriaId: 5, titulo: 'Hardware' },
  },
} as const

function seedSession() {
  useAuthStore.getState().setSession(
    {
      token: 'token-7',
      tipo: 'Bearer',
      expiraEm: '2099-07-17T12:00:00Z',
      usuarioId: 3,
      clienteId: 7,
      email: 'ana@example.com',
    },
    'session',
  )
}

describe('TASK-116 orders integration', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    localStorage.clear()
    sessionStorage.clear()
    useAuthStore.getState().clearSession()
    seedSession()
    server.use(
      http.get('*/api/v1/categoria', () =>
        HttpResponse.json({ status: true, data: [] }),
      ),
    )
  })

  it('sends CPF, local period boundaries, page and size 20', async () => {
    const urls: URL[] = []
    const authorization: Array<string | null> = []

    server.use(
      http.get('*/api/v1/cliente/7', () => HttpResponse.json(profile)),
      http.get('*/api/v1/pedido', ({ request }) => {
        urls.push(new URL(request.url))
        authorization.push(request.headers.get('authorization'))
        return HttpResponse.json(listResponse)
      }),
    )

    renderIntegration(<AppRouter />, {
      initialEntries: [
        '/pedidos?dataInicio=2026-07-01&dataFim=2026-07-15&page=2',
      ],
    })

    expect(
      await screen.findByRole('heading', { name: 'Pedido 900' }),
    ).toBeInTheDocument()

    const query = urls[0].searchParams
    expect(query.get('cpf')).toBe('12345678901')
    expect(query.get('dataInicio')).toBe(
      new Date(2026, 6, 1, 0, 0, 0, 0).toISOString(),
    )
    expect(query.get('dataFim')).toBe(
      new Date(2026, 6, 15, 23, 59, 59, 999).toISOString(),
    )
    expect(query.get('page')).toBe('2')
    expect(query.get('size')).toBe('20')
    expect(authorization).toEqual(['Bearer token-7'])
    expect(
      screen.queryByRole('button', { name: 'Página 3' }),
    ).not.toBeInTheDocument()
  })

  it('uses captured customer/order and fetches product 42 once', async () => {
    let details = 0
    let products = 0
    const detailRequests: Array<{
      pathname: string
      authorization: string | null
    }> = []

    server.use(
      http.get('*/api/v1/cliente/7', () => HttpResponse.json(profile)),
      http.get('*/api/v1/pedido/900', ({ request }) => {
        details += 1
        detailRequests.push({
          pathname: new URL(request.url).pathname,
          authorization: request.headers.get('authorization'),
        })
        return HttpResponse.json(detailResponse)
      }),
      http.get('*/api/v1/produto/42', () => {
        products += 1
        return HttpResponse.json(product)
      }),
    )

    const { queryClient } = renderIntegration(<AppRouter />, {
      initialEntries: ['/pedidos/900'],
    })

    expect(
      await screen.findByRole('heading', { name: 'Pedido 900' }),
    ).toBeInTheDocument()
    expect(await screen.findAllByText('Teclado Mecânico')).toHaveLength(2)
    expect(details).toBe(1)
    expect(products).toBe(1)
    expect(detailRequests).toEqual([
      {
        pathname: '/api/v1/pedido/900',
        authorization: 'Bearer token-7',
      },
    ])

    const detailEntries = queryClient.getQueriesData<{ status: string }>({
      queryKey: orderQueryKeys.detail(7, 900),
    })
    expect(detailEntries).toHaveLength(1)
    expect(detailEntries.every(([, data]) => data?.status === 'Criado')).toBe(
      true,
    )
    expect(
      queryClient.getQueryData(['orders', 'products', [42]]),
    ).toBeDefined()
  })

  it('sends only Cancelado, announces 422, keeps Criado and reloads detail', async () => {
    let details = 0
    const bodies: unknown[] = []
    const detailRequests: Array<{
      pathname: string
      authorization: string | null
    }> = []
    const patchRequests: Array<{
      pathname: string
      authorization: string | null
    }> = []

    server.use(
      http.get('*/api/v1/cliente/7', () => HttpResponse.json(profile)),
      http.get('*/api/v1/pedido/900', ({ request }) => {
        details += 1
        detailRequests.push({
          pathname: new URL(request.url).pathname,
          authorization: request.headers.get('authorization'),
        })
        return HttpResponse.json(detailResponse)
      }),
      http.get('*/api/v1/produto/42', () => HttpResponse.json(product)),
      http.patch('*/api/v1/pedido/900', async ({ request }) => {
        patchRequests.push({
          pathname: new URL(request.url).pathname,
          authorization: request.headers.get('authorization'),
        })
        bodies.push(await request.json())
        return HttpResponse.json(
          {
            error: {
              code: 'ORDER_NOT_CANCELLABLE',
              message: 'Pedido não pode ser cancelado.',
            },
          },
          { status: 422 },
        )
      }),
    )

    const { user, queryClient } = renderIntegration(<AppRouter />, {
      initialEntries: ['/pedidos/900'],
    })

    expect(await screen.findByText('Criado')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Cancelar pedido',
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Cancelar pedido' }),
    )

    const alert = await screen.findByRole('alert')
    expect(
      within(alert).getByText('O cancelamento não foi aceito'),
    ).toBeInTheDocument()
    expect(
      within(alert).getByText(
        'A API recusou a alteração. O estado mais recente disponível do pedido está sendo exibido.',
      ),
    ).toBeInTheDocument()
    await waitFor(() => expect(details).toBe(2))

    expect(bodies).toEqual([{ status: 'Cancelado' }])
    expect(detailRequests).toEqual([
      {
        pathname: '/api/v1/pedido/900',
        authorization: 'Bearer token-7',
      },
      {
        pathname: '/api/v1/pedido/900',
        authorization: 'Bearer token-7',
      },
    ])
    expect(patchRequests).toEqual([
      {
        pathname: '/api/v1/pedido/900',
        authorization: 'Bearer token-7',
      },
    ])
    expect(screen.getByText('Criado')).toBeInTheDocument()

    const detailEntries = queryClient.getQueriesData<{ status: string }>({
      queryKey: orderQueryKeys.detail(7, 900),
    })
    expect(detailEntries).toHaveLength(1)
    expect(detailEntries.every(([, data]) => data?.status === 'Criado')).toBe(
      true,
    )
  })

  it('reconciles detail and customer 7 lists after successful cancel', async () => {
    let details = 0
    const detailRequests: Array<{
      pathname: string
      authorization: string | null
    }> = []
    const patchRequests: Array<{
      pathname: string
      authorization: string | null
    }> = []

    server.use(
      http.get('*/api/v1/cliente/7', () => HttpResponse.json(profile)),
      http.get('*/api/v1/pedido/900', ({ request }) => {
        details += 1
        detailRequests.push({
          pathname: new URL(request.url).pathname,
          authorization: request.headers.get('authorization'),
        })
        return HttpResponse.json(
          details === 1 ? detailResponse : cancelledDetailResponse,
        )
      }),
      http.get('*/api/v1/produto/42', () => HttpResponse.json(product)),
      http.patch('*/api/v1/pedido/900', ({ request }) => {
        patchRequests.push({
          pathname: new URL(request.url).pathname,
          authorization: request.headers.get('authorization'),
        })
        return HttpResponse.json(cancelResponse)
      }),
    )

    const { user, queryClient } = renderIntegration(<AppRouter />, {
      initialEntries: ['/pedidos/900'],
    })
    const customer7ListKeys = [
      [
        ...orderQueryKeys.list(7, undefined, undefined, 1, 20),
        701,
      ] as const,
      [
        ...orderQueryKeys.list(
          7,
          '2026-06-01T03:00:00.000Z',
          '2026-07-01T02:59:59.999Z',
          3,
          20,
        ),
        702,
      ] as const,
    ]
    const customer8ListKeys = [
      [
        ...orderQueryKeys.list(8, undefined, undefined, 2, 20),
        801,
      ] as const,
      [
        ...orderQueryKeys.list(
          8,
          '2026-05-01T03:00:00.000Z',
          '2026-06-01T02:59:59.999Z',
          4,
          20,
        ),
        802,
      ] as const,
    ]
    customer7ListKeys.forEach((queryKey, index) => {
      queryClient.setQueryData(queryKey, {
        marker: `customer-7-list-${index + 1}`,
      })
    })
    customer8ListKeys.forEach((queryKey, index) => {
      queryClient.setQueryData(queryKey, {
        marker: `customer-8-list-${index + 1}`,
      })
    })

    expect(await screen.findByText('Criado')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Cancelar pedido',
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Cancelar pedido' }),
    )
    await waitFor(() => expect(details).toBe(2))

    expect(detailRequests).toEqual([
      {
        pathname: '/api/v1/pedido/900',
        authorization: 'Bearer token-7',
      },
      {
        pathname: '/api/v1/pedido/900',
        authorization: 'Bearer token-7',
      },
    ])
    expect(patchRequests).toEqual([
      {
        pathname: '/api/v1/pedido/900',
        authorization: 'Bearer token-7',
      },
    ])

    const detailEntries = queryClient.getQueriesData<{ status: string }>({
      queryKey: orderQueryKeys.detail(7, 900),
    })
    expect(detailEntries).toHaveLength(1)
    expect(
      detailEntries.every(([, data]) => data?.status === 'Cancelado'),
    ).toBe(true)
    const customer7Lists = queryClient.getQueriesData<{ marker: string }>({
      queryKey: orderQueryKeys.lists(7),
    })
    const customer8Lists = queryClient.getQueriesData<{ marker: string }>({
      queryKey: orderQueryKeys.lists(8),
    })

    expect(customer7Lists).toHaveLength(2)
    expect(customer7Lists.map(([, data]) => data?.marker)).toEqual([
      'customer-7-list-1',
      'customer-7-list-2',
    ])
    expect(
      customer7Lists.every(([queryKey]) =>
        queryClient.getQueryState(queryKey)?.isInvalidated === true),
    ).toBe(true)

    expect(customer8Lists).toHaveLength(2)
    expect(customer8Lists.map(([, data]) => data?.marker)).toEqual([
      'customer-8-list-1',
      'customer-8-list-2',
    ])
    expect(
      customer8Lists.every(([queryKey]) =>
        queryClient.getQueryState(queryKey)?.isInvalidated === false),
    ).toBe(true)
  })
})
