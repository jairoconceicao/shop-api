import { Profiler, type ProfilerOnRenderCallback } from 'react'
import { cleanup, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppRouter } from '../app/router/AppRouter'
import { useAuthStore } from '../features/auth/store/authStore'
import { useCartSessionStore } from '../features/cart/store/cartSessionStore'
import { clearCustomerPrivateSnapshots } from '../features/customer/cache/customerPrivateSnapshots'
import { renderIntegration } from '../shared/testing/renderIntegration'
import { server } from '../shared/testing/server'

type CommitSample = {
  phase: 'mount' | 'update' | 'nested-update'
  actualDuration: number
  baseDuration: number
  fingerprint: string
}

type ProfileSample = {
  commits: CommitSample[]
  requests: string[]
  visibleState: string
}

const SAMPLE_COUNT = 5
const WARMUP_COUNT = 1
const PERFORMANCE_FIXTURES = {
  home: { customerIds: [] },
  cart: { customerIds: [20], cartId: 900, productIds: [5, 5, 9] },
  order: { customerIds: [7], orderId: 41, productIds: [5, 5, 9] },
} as const
const measuredCustomerIds = [
  ...new Set(Object.values(PERFORMANCE_FIXTURES).flatMap(({ customerIds }) => customerIds)),
]

function median(values: readonly number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function normalizeDom(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function seedSession(customerId: number) {
  useAuthStore.getState().setSession({
    token: `token-${customerId}`,
    tipo: 'Bearer',
    expiraEm: '2099-07-17T12:00:00Z',
    usuarioId: customerId + 100,
    clienteId: customerId,
    email: `customer-${customerId}@example.com`,
  }, 'session')
}

const categories = { status: true, data: [{ categoriaId: 1, titulo: 'Hardware', descricao: 'Componentes' }] }
const catalog = {
  status: true,
  pagination: {
    pages: 1,
    size: 20,
    totalItems: 1,
    data: [{ produtoId: 5, titulo: 'Teclado mecânico', thumb: null, preco: 100, estoque: 10, categoria: { categoriaId: 1, titulo: 'Hardware' } }],
  },
}
const product = (id: number) => ({
  status: true,
  data: {
    produtoId: id,
    titulo: id === 5 ? 'Teclado mecânico' : 'Mouse óptico',
    descricao: 'Produto auditado',
    modelo: `M-${id}`,
    foto: null,
    preco: id === 5 ? 100 : 50,
    estoque: 10,
    categoria: { categoriaId: 1, titulo: 'Hardware' },
  },
})
const items = [
  { itemId: 1, produtoId: 5, quantidade: 1, valorUnitario: 100 },
  { itemId: 2, produtoId: 5, quantidade: 2, valorUnitario: 100 },
  { itemId: 3, produtoId: 9, quantidade: 1, valorUnitario: 50 },
]
const order = {
  pedidoId: 41,
  carrinhoId: 900,
  clienteId: 7,
  enderecoEntrega: {
    logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000',
    bairro: 'Centro', cidade: 'São Paulo', uf: 'SP',
  },
  dataPedido: '2026-07-16T10:30:00Z',
  formaPagamento: 'Pix',
  status: 'Criado',
  items,
}

async function resetAuditState(queryClient?: ReturnType<typeof renderIntegration>['queryClient']) {
  if (queryClient) {
    await queryClient.cancelQueries()
    queryClient.clear()
  }
  useAuthStore.getState().clearSession()
  useCartSessionStore.setState({ cartIdsByCustomer: {} })
  measuredCustomerIds.forEach(clearCustomerPrivateSnapshots)
  server.resetHandlers()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.clearAllMocks()
  cleanup()
}

async function runScenario(scenario: 'home' | 'cart' | 'order'): Promise<ProfileSample> {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
  const requests: string[] = []
  const commits: CommitSample[] = []
  const auditContext: {
    queryClient?: ReturnType<typeof renderIntegration>['queryClient']
    container?: HTMLElement
  } = {}
  const onRender: ProfilerOnRenderCallback = (_id, phase, actualDuration, baseDuration) => {
    const queryState = auditContext.queryClient?.getQueryCache().getAll().map((query) => ({
      key: query.queryKey,
      status: query.state.status,
      fetchStatus: query.state.fetchStatus,
      data: query.state.data,
    })).sort((a, b) => JSON.stringify(a.key).localeCompare(JSON.stringify(b.key))) ?? []
    commits.push({
      phase,
      actualDuration,
      baseDuration,
      fingerprint: JSON.stringify({
        phase,
        visibleDom: normalizeDom(auditContext.container?.textContent ?? ''),
        queryState,
        relevantProps: { scenario },
      }),
    })
  }

  server.use(
    http.get('*/api/v1/categoria', ({ request }) => {
      requests.push(`GET ${new URL(request.url).pathname}`)
      return HttpResponse.json(categories)
    }),
    http.get('*/api/v1/produto', ({ request }) => {
      const url = new URL(request.url)
      requests.push(`GET ${url.pathname}${url.search}`)
      return HttpResponse.json(catalog)
    }),
    http.get('*/api/v1/produto/:id', ({ params, request }) => {
      requests.push(`GET ${new URL(request.url).pathname}`)
      return HttpResponse.json(product(Number(params.id)))
    }),
    http.get('*/api/v1/carrinho/900', ({ request }) => {
      requests.push(`GET ${new URL(request.url).pathname}`)
      return HttpResponse.json({
        status: true,
        data: { clienteId: 20, carrinhoId: 900, dataCarrinho: '2026-07-16T10:00:00Z', items },
      })
    }),
    http.get('*/api/v1/pedido/41', ({ request }) => {
      requests.push(`GET ${new URL(request.url).pathname}`)
      return HttpResponse.json({ status: true, data: order })
    }),
  )

  if (scenario === 'cart') {
    seedSession(20)
    useCartSessionStore.getState().setCartId(20, 900)
  } else if (scenario === 'order') {
    seedSession(7)
  }

  const result = renderIntegration(
    <Profiler id={scenario} onRender={onRender}><AppRouter /></Profiler>,
    { initialEntries: [scenario === 'home' ? '/' : scenario === 'cart' ? '/carrinho' : '/pedidos/41'] },
  )
  auditContext.queryClient = result.queryClient
  auditContext.container = result.container

  if (scenario === 'home') {
    await waitFor(() => expect(requests).toEqual(expect.arrayContaining([
        'GET /api/v1/categoria',
        'GET /api/v1/produto?page=1&size=20',
      ])))
    await waitFor(() => expect(result.container).toHaveTextContent('Teclado mecânico'))
  } else {
    expect(await screen.findAllByText('Teclado mecânico')).toHaveLength(2)
    expect(await screen.findByText('Mouse óptico')).toBeInTheDocument()
    await waitFor(() => expect(requests.filter((request) => request.startsWith('GET /api/v1/produto/')).sort()).toEqual([
      'GET /api/v1/produto/5',
      'GET /api/v1/produto/9',
    ]))
  }

  const sample = {
    commits,
    requests: [...requests],
    visibleState: normalizeDom(result.container.textContent ?? ''),
  }
  await resetAuditState(auditContext.queryClient)
  return sample
}

function summarize(samples: readonly ProfileSample[]) {
  const durations = samples.map((sample) => sample.commits.reduce((sum, commit) => sum + commit.actualDuration, 0))
  const counts = samples.map((sample) => sample.commits.length)
  return {
    counts,
    durations,
    medianCommits: median(counts),
    medianDuration: median(durations),
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    redundant: samples.map((sample) => sample.commits.filter((commit, index) =>
      index > 0 && sample.commits[index - 1]?.fingerprint === commit.fingerprint).length),
    requests: samples.map((sample) => sample.requests),
  }
}

describe('TASK-125 render performance audit', () => {
  afterEach(() => resetAuditState())

  it('measures one discarded warmup and five rotated cold samples per scenario', async () => {
    const scenarios = ['home', 'cart', 'order'] as const
    const measured = new Map(scenarios.map((scenario) => [scenario, [] as ProfileSample[]]))

    for (let index = 0; index < WARMUP_COUNT; index += 1) {
      for (const scenario of scenarios) await runScenario(scenario)
    }

    for (let round = 0; round < SAMPLE_COUNT; round += 1) {
      const rotated = scenarios.map((_, index) => scenarios[(index + round) % scenarios.length])
      for (const scenario of rotated) measured.get(scenario)!.push(await runScenario(scenario))
    }

    for (const scenario of scenarios) {
      const samples = measured.get(scenario)!
      expect(samples).toHaveLength(SAMPLE_COUNT)
      expect(samples.every((sample) => sample.visibleState.length > 0)).toBe(true)
      console.info(`[performance:${scenario}] ${JSON.stringify(summarize(samples))}`)
    }
  }, 60_000)
})
