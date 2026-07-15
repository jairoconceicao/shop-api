# Fase 7 Pedidos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar lista, filtros, detalhe, hidratação de produtos e cancelamento de pedidos em rotas protegidas da SPA.

**Architecture:** A feature `orders` possuirá contratos, serviços, query keys, queries, mutations, routing, componentes e páginas. TanStack Query continuará sendo a fonte de estado remoto; perfil e produto serão reutilizados por suas interfaces canônicas, sem cópias em Zustand. Cada TASK-ID é uma unidade revisável, testada em RED/GREEN e concluída por commit próprio.

**Tech Stack:** React 19, TypeScript 5.7, React Router 7, TanStack Query 5, Zod 4, Tailwind CSS v4, Vitest, Testing Library e MSW.

## Global Constraints

- O `openapi.yaml` prevalece para rotas, autenticação, payloads e respostas.
- Rotas de pedidos são protegidas, privadas e carregadas sob demanda.
- Estado de servidor pertence ao TanStack Query; pedidos, produtos e CPF não são persistidos.
- Query keys privadas usam `clienteId`, filtros e IDs; token e CPF nunca entram na key, storage ou logs.
- A lista usa `size=20`; tamanho não é controle nem parâmetro de URL.
- Campos civis `YYYY-MM-DD` representam intervalo local inclusivo: início `00:00:00.000`, fim `23:59:59.999`, convertidos com `toISOString()`; validar início menor ou igual ao fim.
- `404` da lista é erro de recurso; somente resposta 200 com `pagination.data: []` é estado vazio.
- O cancelamento fica indisponível somente em `Cancelado` e `Devolvido`; a API decide as demais transições.
- Mutações usam `retry: false`; consultas oferecem retry manual e respeitam `AbortSignal`.
- Interface funcional de 320 px a 1920 px, sem overflow horizontal, com teclado, foco visível e regiões vivas proporcionais.
- Não adicionar filtro de status, frete, desconto, promoção, rastreamento, nota fiscal ou recompra.
- Antes de cada task: confirmar que ela está `READY`, dependências estão `DONE`, registrar BASE_COMMIT e usar um único agente com escrita no checkout.

## File Structure

- `frontend/src/features/orders/contracts/orders.ts`: modelos internos, schemas Zod e adapters de lista/detalhe/cancelamento.
- `frontend/src/features/orders/cache/orderQueryKeys.ts`: namespace privado compartilhado entre checkout, lista, detalhe e mutation.
- `frontend/src/features/orders/services/*.ts`: uma função HTTP por endpoint.
- `frontend/src/features/orders/queries/*.ts`: options/hooks de lista, detalhe e hidratação.
- `frontend/src/features/orders/routing/*.ts`: parser de ID e estado canônico da URL.
- `frontend/src/features/orders/components/*.tsx`: filtros, card, item hidratado e dialog.
- `frontend/src/features/orders/pages/*.tsx`: coordenação de dados e estados das duas rotas.
- Testes ficam ao lado do arquivo testado e usam os helpers existentes em `shared/testing`.

---

### Task 1: TASK-096 — Contratos de pedidos

**Files:**
- Create: `frontend/src/features/orders/contracts/orders.ts`
- Create: `frontend/src/features/orders/contracts/orders.test.ts`
- Create: `frontend/src/features/orders/cache/orderQueryKeys.ts`
- Modify: `frontend/src/features/checkout/contracts/order.ts`
- Modify: `frontend/src/features/checkout/cache/orderCache.ts`
- Test: `frontend/src/features/checkout/contracts/order.test.ts`

**Interfaces:**
- Consumes: `normalizeId(value): number`, `normalizeNumber(value): number`, contratos canônicos de endereço e pagamento já usados pelo customer/checkout.
- Produces: `OrderStatus`, `Order`, `OrderItem`, `OrdersPage`, `adaptOrdersPage(unknown)`, `adaptOrderResponse(unknown)`, `adaptCancelledOrderResponse(unknown)`, `createCancelOrderRequest(): { status: 'Cancelado' }`, `orderQueryKeys`.

- [ ] **Step 1: Write failing contract tests**

```ts
it('normalizes a paged order response and derives no transport total', () => {
  const page = adaptOrdersPage({ status: true, pagination: {
    pages: '2', size: '20', totalItems: '21', data: [{
      pedidoId: '41', carrinhoId: '9', clienteId: '7',
      enderecoEntrega: validAddress, dataPedido: '2026-07-15T12:00:00Z',
      formaPagamento: 'Pix', status: 'Criado',
      items: [{ itemId: '3', produtoId: '5', quantidade: '2', valorUnitario: '10.5' }],
    }],
  } })
  expect(page).toMatchObject({ pages: 2, size: 20, totalItems: 21 })
  expect(page.orders[0].items[0]).toEqual({ itemId: 3, productId: 5, quantity: 2, unitPrice: 10.5 })
})

it.each(['Pendente', '', null])('rejects unknown status %p', (status) => {
  expect(() => adaptOrderResponse(responseWith({ status }))).toThrow()
})

it('creates the only supported cancellation payload', () => {
  expect(createCancelOrderRequest()).toEqual({ status: 'Cancelado' })
  expect(Object.keys(createCancelOrderRequest())).toEqual(['status'])
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/features/orders/contracts/orders.test.ts src/features/checkout/contracts/order.test.ts`

Expected: FAIL because `features/orders/contracts/orders.ts` does not exist.

- [ ] **Step 3: Implement strict schemas, adapters, and keys**

```ts
export const orderStatuses = ['Criado', 'EmProcessamento', 'Processado', 'Cancelado', 'Devolvido'] as const
export type OrderStatus = (typeof orderStatuses)[number]
export type OrderItem = { itemId: number; productId: number; quantity: number; unitPrice: number }
export type Order = {
  id: number; cartId: number; customerId: number; deliveryAddress: DeliveryAddress
  createdAt: string; paymentMethod: PaymentMethod; status: OrderStatus; items: OrderItem[]
}
export type OrdersPage = { pages: number; size: number; totalItems: number; orders: Order[] }

export function createCancelOrderRequest() {
  return { status: 'Cancelado' } as const
}

export const orderQueryKeys = {
  all: ['private', 'orders'] as const,
  lists: (customerId: number) => ['private', 'orders', 'list', customerId] as const,
  list: (customerId: number, start: string | undefined, end: string | undefined, page: number, size: number) =>
    ['private', 'orders', 'list', customerId, start ?? null, end ?? null, page, size] as const,
  details: (customerId: number) => ['private', 'orders', 'detail', customerId] as const,
  detail: (customerId: number, orderId: number) => ['private', 'orders', 'detail', customerId, orderId] as const,
}
```

Implement Zod transport schemas with `.strict()`, require successful non-null envelopes, normalize every numeric field, require positive safe IDs/non-negative finite monetary values, and re-export the canonical status schema for checkout rather than maintaining two enums.

- [ ] **Step 4: Run focused and regression tests**

Run: `npm run test -- src/features/orders/contracts/orders.test.ts src/features/checkout/contracts/order.test.ts`

Expected: PASS with valid/string-number, null envelope, false status, enum, unsafe ID, non-finite value and strict request cases covered.

- [ ] **Step 5: Verify, update backlog, and commit**

Run: `npm run typecheck && npm run lint && npm run test -- src/features/orders src/features/checkout/contracts/order.test.ts`

Expected: all PASS. Mark TASK-096 `DONE`, add evidence, change TASK-097 to `READY`, then commit:

```bash
git add frontend/src/features/orders frontend/src/features/checkout/contracts/order.ts frontend/src/features/checkout/contracts/order.test.ts frontend/src/features/checkout/cache/orderCache.ts docs/frontend-tasks-v2.md
git commit -m "feat(TASK-096): Criar contratos de pedidos"
```

### Task 2: TASK-097 — Query paginada por CPF

**Files:**
- Create: `frontend/src/features/orders/services/listOrdersService.ts`
- Create: `frontend/src/features/orders/services/listOrdersService.test.ts`
- Create: `frontend/src/features/orders/queries/useOrdersQuery.ts`
- Create: `frontend/src/features/orders/queries/useOrdersQuery.test.tsx`

**Interfaces:**
- Consumes: `adaptOrdersPage`, `orderQueryKeys.list`, `customerProfileQueryOptions`, `privateCacheMeta`, `normalizeCpf`.
- Produces: `ListOrdersParams`, `listOrders(params, token, signal)`, `ordersQueryOptions(input)`, `useOrdersQuery(filters)`.

- [ ] **Step 1: Write failing service and query tests**

```ts
it('sends cpf, ISO period, page and fixed size with auth and signal', async () => {
  await listOrders({ cpf: '12345678901', start: START, end: END, page: 2, size: 20 }, 'token', signal)
  expect(client.request).toHaveBeenCalledWith('/api/v1/pedido?cpf=12345678901&dataInicio=' + encodeURIComponent(START) + '&dataFim=' + encodeURIComponent(END) + '&page=2&size=20', {
    method: 'GET', token: 'token', signal,
  })
})

it('does not expose cpf or token in the query key', () => {
  const options = ordersQueryOptions(validInput)
  expect(JSON.stringify(options.queryKey)).not.toContain('12345678901')
  expect(JSON.stringify(options.queryKey)).not.toContain('token')
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/features/orders/services/listOrdersService.test.ts src/features/orders/queries/useOrdersQuery.test.tsx`

Expected: FAIL because service/query modules do not exist.

- [ ] **Step 3: Implement the dependent query**

```ts
export type OrdersFilters = { start?: string; end?: string; page: number }

export function ordersQueryOptions(input: {
  customerId?: number; cpf?: string; token?: string; filters: OrdersFilters
}) {
  const enabled = isPositiveId(input.customerId) && Boolean(input.token?.trim()) && normalizeCpf(input.cpf ?? '').length === 11
  return queryOptions({
    queryKey: enabled
      ? orderQueryKeys.list(input.customerId!, input.filters.start, input.filters.end, input.filters.page, 20)
      : orderQueryKeys.list(0, undefined, undefined, 1, 20),
    enabled,
    queryFn: ({ signal }) => listOrders({
      cpf: normalizeCpf(input.cpf!), start: input.filters.start, end: input.filters.end,
      page: input.filters.page, size: 20,
    }, input.token!, signal),
    meta: privateCacheMeta,
  })
}
```

`useOrdersQuery` reads session and `useCustomerProfileQuery`; it passes confirmed profile CPF only and never creates a second profile request abstraction.

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- src/features/orders/services/listOrdersService.test.ts src/features/orders/queries/useOrdersQuery.test.tsx src/features/customer/queries/useCustomerProfileQuery.test.tsx`

Expected: PASS including disabled invalid sessions, AbortSignal, errors, page/filter key isolation and session changes.

- [ ] **Step 5: Verify, update backlog, and commit**

Run: `npm run typecheck && npm run lint && npm run test -- src/features/orders`

Expected: PASS. Mark TASK-097 DONE and TASK-098 READY, then commit:

```bash
git add frontend/src/features/orders docs/frontend-tasks-v2.md
git commit -m "feat(TASK-097): Consultar pedidos por CPF"
```

### Task 3: TASK-098 — Filtros de período na URL

**Files:**
- Create: `frontend/src/features/orders/routing/ordersUrl.ts`
- Create: `frontend/src/features/orders/routing/ordersUrl.test.ts`
- Create: `frontend/src/features/orders/components/OrdersPeriodFilter.tsx`
- Create: `frontend/src/features/orders/components/OrdersPeriodFilter.test.tsx`

**Interfaces:**
- Consumes: `localCivilDate` conventions and React Router search params.
- Produces: `OrdersUrlState`, `parseOrdersUrl(params)`, `serializeOrdersUrl(state)`, `toOrdersApiPeriod(state)`, `OrdersPeriodFilter`.

- [ ] **Step 1: Write failing date/URL tests**

```ts
it('round-trips valid civil dates and resets page after applying', () => {
  const state = parseOrdersUrl(new URLSearchParams('dataInicio=2026-07-01&dataFim=2026-07-15&page=3'))
  expect(state).toEqual({ startDate: '2026-07-01', endDate: '2026-07-15', page: 3 })
  expect(serializeOrdersUrl({ ...state, page: 1 }).toString()).toBe('dataInicio=2026-07-01&dataFim=2026-07-15')
})

it('converts inclusive local civil bounds to ISO instants', () => {
  const period = toOrdersApiPeriod({ startDate: '2026-07-01', endDate: '2026-07-15', page: 1 })
  expect(new Date(period.start!).getTime()).toBe(new Date(2026, 6, 1, 0, 0, 0, 0).getTime())
  expect(new Date(period.end!).getTime()).toBe(new Date(2026, 6, 15, 23, 59, 59, 999).getTime())
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/features/orders/routing/ordersUrl.test.ts src/features/orders/components/OrdersPeriodFilter.test.tsx`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement canonical URL and accessible filter**

```ts
export type OrdersUrlState = { startDate?: string; endDate?: string; page: number }

export function toOrdersApiPeriod(state: OrdersUrlState) {
  if (state.startDate && state.endDate && state.startDate > state.endDate) {
    throw new RangeError('A data inicial deve ser anterior ou igual à data final.')
  }
  return {
    start: state.startDate ? localBoundary(state.startDate, 'start').toISOString() : undefined,
    end: state.endDate ? localBoundary(state.endDate, 'end').toISOString() : undefined,
  }
}
```

Render two labeled `Input type="date"` controls, an apply button and a clear button. Submit serializes dates with page 1; invalid ranges render `InlineAlert` and do not navigate.

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- src/features/orders/routing/ordersUrl.test.ts src/features/orders/components/OrdersPeriodFilter.test.tsx`

Expected: PASS for invalid dates, unsafe pages, start-only/end-only, inclusive boundaries, apply, clear and browser history inputs.

- [ ] **Step 5: Verify, update backlog, and commit**

Run: `npm run typecheck && npm run lint && npm run test -- src/features/orders`

Expected: PASS. Mark TASK-098 DONE and TASK-099 READY, then commit:

```bash
git add frontend/src/features/orders docs/frontend-tasks-v2.md
git commit -m "feat(TASK-098): Sincronizar período de pedidos"
```

### Task 4: TASK-099 — OrderCard

**Files:**
- Create: `frontend/src/features/orders/components/OrderCard.tsx`
- Create: `frontend/src/features/orders/components/OrderCard.test.tsx`
- Create: `frontend/src/features/orders/formatting/orderPresentation.ts`
- Create: `frontend/src/features/orders/formatting/orderPresentation.test.ts`

**Interfaces:**
- Consumes: `Order`, `Card`, `Badge`, React Router `Link` and existing currency/date conventions.
- Produces: `calculateOrderTotal(items)`, `getOrderStatusLabel(status)`, `OrderCard({ order })`.

- [ ] **Step 1: Write failing presentation tests**

```tsx
it('renders an API status label and total derived from confirmed items', () => {
  render(<MemoryRouter><OrderCard order={orderWith({ status: 'EmProcessamento', items: [
    { itemId: 1, productId: 2, quantity: 2, unitPrice: 10.5 },
    { itemId: 2, productId: 3, quantity: 1, unitPrice: 4 },
  ] })} /></MemoryRouter>)
  expect(screen.getByText('Em processamento')).toBeInTheDocument()
  expect(screen.getByText('R$ 25,00')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /ver pedido 41/i })).toHaveAttribute('href', '/pedidos/41')
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/features/orders/components/OrderCard.test.tsx src/features/orders/formatting/orderPresentation.test.ts`

Expected: FAIL because card/formatting modules do not exist.

- [ ] **Step 3: Implement pure derivation and card**

```ts
const labels: Record<OrderStatus, string> = {
  Criado: 'Criado', EmProcessamento: 'Em processamento', Processado: 'Processado',
  Cancelado: 'Cancelado', Devolvido: 'Devolvido',
}
export const calculateOrderTotal = (items: readonly OrderItem[]) =>
  items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
```

Render an `article` in `Card`, semantic `dl`, status `Badge`, derived BRL total, and a minimum 44 px link target. Use mobile-first grid/stack classes with `min-w-0`.

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- src/features/orders/components/OrderCard.test.tsx src/features/orders/formatting/orderPresentation.test.ts`

Expected: PASS for all five labels, decimal total, empty items, accessible article/link and no unsupported copy.

- [ ] **Step 5: Verify, update backlog, and commit**

Run: `npm run typecheck && npm run lint && npm run test -- src/features/orders`

Expected: PASS. Mark TASK-099 DONE and TASK-100 READY, then commit:

```bash
git add frontend/src/features/orders docs/frontend-tasks-v2.md
git commit -m "feat(TASK-099): Exibir resumo de pedidos"
```

### Task 5: TASK-100 — Página Meus Pedidos

**Files:**
- Create: `frontend/src/features/orders/pages/OrdersPage.tsx`
- Create: `frontend/src/features/orders/pages/OrdersPage.test.tsx`
- Modify: `frontend/src/app/router/AppRouter.tsx`
- Modify: `frontend/src/app/router/AppRouter.lazy.test.tsx`
- Modify: `frontend/src/App.test.tsx`

**Interfaces:**
- Consumes: `parseOrdersUrl`, `serializeOrdersUrl`, `toOrdersApiPeriod`, `useOrdersQuery`, `OrdersPeriodFilter`, `OrderCard`, `Pagination`, `Skeleton`, `EmptyState`, `ErrorState`.
- Produces: lazy protected `/pedidos` page.

- [ ] **Step 1: Write failing page and lazy-route tests**

```tsx
it('renders loading, empty, error retry and paged success states', async () => {
  renderOrders('/pedidos?dataInicio=2026-07-01&page=2')
  expect(screen.getByRole('status', { name: /carregando pedidos/i })).toBeInTheDocument()
  await screen.findByRole('heading', { name: 'Meus pedidos' })
  expect(screen.getByRole('navigation', { name: 'Paginação de pedidos' })).toBeInTheDocument()
})

it('loads OrdersPage outside the entry chunk', async () => {
  expect(await routeSource()).toContain("lazy(() => import('../../features/orders/pages/OrdersPage')")
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/features/orders/pages/OrdersPage.test.tsx src/app/router/AppRouter.lazy.test.tsx src/App.test.tsx`

Expected: FAIL because `/pedidos` still renders `RoutePlaceholder`.

- [ ] **Step 3: Implement orchestration and lazy route**

```tsx
const OrdersPage = lazy(() => import('../../features/orders/pages/OrdersPage')
  .then(({ OrdersPage: Page }) => ({ default: Page })))

<Route path="pedidos" element={
  <Suspense fallback={<OrdersRouteFallback />}><OrdersPage /></Suspense>
} />
```

In the page, derive URL state on every `searchParams` change, convert it to API period, call `useOrdersQuery`, render `ErrorState` for any 404/network failure, `EmptyState` only for a successful empty page, map `OrderCard`, and serialize page changes without full reload.

- [ ] **Step 4: Run focused tests and build**

Run: `npm run test -- src/features/orders/pages/OrdersPage.test.tsx src/app/router/AppRouter.lazy.test.tsx src/App.test.tsx && npm run build`

Expected: PASS; build output contains a separate `OrdersPage-*.js` chunk.

- [ ] **Step 5: Verify, update backlog, and commit**

Run: `npm run typecheck && npm run lint && npm run test -- src/features/orders src/app/router src/App.test.tsx`

Expected: PASS. Mark TASK-100 DONE and TASK-101 READY, then commit:

```bash
git add frontend/src/features/orders frontend/src/app/router frontend/src/App.test.tsx docs/frontend-tasks-v2.md
git commit -m "feat(TASK-100): Criar página de pedidos"
```

### Task 6: TASK-101 — Query e página de detalhe

**Files:**
- Create: `frontend/src/features/orders/routing/orderId.ts`
- Create: `frontend/src/features/orders/routing/orderId.test.ts`
- Create: `frontend/src/features/orders/services/getOrderService.ts`
- Create: `frontend/src/features/orders/services/getOrderService.test.ts`
- Create: `frontend/src/features/orders/queries/useOrderDetailQuery.ts`
- Create: `frontend/src/features/orders/queries/useOrderDetailQuery.test.tsx`
- Create: `frontend/src/features/orders/pages/OrderDetailPage.tsx`
- Create: `frontend/src/features/orders/pages/OrderDetailPage.test.tsx`
- Modify: `frontend/src/app/router/AppRouter.tsx`
- Modify: `frontend/src/app/router/AppRouter.lazy.test.tsx`

**Interfaces:**
- Consumes: `adaptOrderResponse`, `orderQueryKeys.detail`, auth session, `calculateOrderTotal`, UI states.
- Produces: `parseOrderId(value)`, `getOrder(orderId, token, signal)`, `orderDetailQueryOptions`, `useOrderDetailQuery`, lazy `/pedidos/:pedidoId`.

- [ ] **Step 1: Write failing routing/query/page tests**

```ts
it.each(['0', '-1', '01', '1.5', '9007199254740992', undefined])('rejects invalid order id %p', (value) => {
  expect(parseOrderId(value)).toBeUndefined()
})
```

```tsx
it('renders confirmed address, payment, status, items and derived total', async () => {
  renderDetail('/pedidos/41')
  expect(await screen.findByRole('heading', { name: 'Pedido 41' })).toBeInTheDocument()
  expect(screen.getByText('Pix')).toBeInTheDocument()
  expect(screen.getByText('R$ 25,00')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/features/orders/routing/orderId.test.ts src/features/orders/services/getOrderService.test.ts src/features/orders/queries/useOrderDetailQuery.test.tsx src/features/orders/pages/OrderDetailPage.test.tsx`

Expected: FAIL because detail modules do not exist.

- [ ] **Step 3: Implement guarded detail flow**

```ts
export function parseOrderId(value: string | undefined) {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : undefined
}
```

The query key is `orderQueryKeys.detail(customerId, orderId)` only for a valid captured session; invalid routes stay disabled and render not-found without `/pedido/0`. The page renders a single `h1`, address `dl`, confirmed items, derived total, loading skeleton, explicit 404 and retryable error. Add a separate lazy route chunk.

- [ ] **Step 4: Run focused tests and build**

Run: `npm run test -- src/features/orders src/app/router/AppRouter.lazy.test.tsx && npm run build`

Expected: PASS and a separate `OrderDetailPage-*.js` chunk.

- [ ] **Step 5: Verify, update backlog, and commit**

Run: `npm run typecheck && npm run lint && npm run test -- src/features/orders src/app/router src/App.test.tsx`

Expected: PASS. Mark TASK-101 DONE and TASK-102 READY, then commit:

```bash
git add frontend/src/features/orders frontend/src/app/router frontend/src/App.test.tsx docs/frontend-tasks-v2.md
git commit -m "feat(TASK-101): Exibir detalhe do pedido"
```

### Task 7: TASK-102 — Hidratação paralela de produtos

**Files:**
- Create: `frontend/src/features/orders/queries/useOrderProductsQuery.ts`
- Create: `frontend/src/features/orders/queries/useOrderProductsQuery.test.tsx`
- Create: `frontend/src/features/orders/components/OrderItem.tsx`
- Create: `frontend/src/features/orders/components/OrderItem.test.tsx`
- Modify: `frontend/src/features/orders/pages/OrderDetailPage.tsx`
- Modify: `frontend/src/features/orders/pages/OrderDetailPage.test.tsx`

**Interfaces:**
- Consumes: `OrderItem`, `productDetailQueryOptions`, `QueryClient.ensureQueryData`, `ProductImage`.
- Produces: `OrderProductResult`, `orderProductsQueryOptions(productIds, queryClient)`, `useOrderProductsQuery(items)`, hydrated `OrderItem` visual.

- [ ] **Step 1: Write failing deduplication/fallback tests**

```ts
it('deduplicates product ids and starts unique lookups in parallel', async () => {
  const promise = queryClient.fetchQuery(orderProductsQueryOptions([3, 3, 2], queryClient))
  expect(requestedIds.sort()).toEqual([2, 3])
  resolveAllProducts()
  await expect(promise).resolves.toHaveLength(2)
})

it('keeps a failed product isolated', async () => {
  renderItem({ result: { status: 'error', productId: 3, error: new Error('gone') } })
  expect(screen.getByText('Produto indisponível')).toBeInTheDocument()
  expect(screen.getByText('Quantidade: 2')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/features/orders/queries/useOrderProductsQuery.test.tsx src/features/orders/components/OrderItem.test.tsx`

Expected: FAIL because hydration modules do not exist.

- [ ] **Step 3: Implement parallel isolated hydration**

```ts
const productIds = [...new Set(items.map((item) => item.productId))].sort((a, b) => a - b)
const results = await Promise.all(productIds.map(async (productId): Promise<OrderProductResult> => {
  try {
    const product = await queryClient.ensureQueryData(productDetailQueryOptions(String(productId)))
    return { status: 'success', productId, product }
  } catch (error) {
    return { status: 'error', productId, error }
  }
}))
```

Compose results by `productId`; render title/image when successful and a reserved ProductImage fallback plus confirmed quantity/unit price/subtotal when failed.

- [ ] **Step 4: Run focused and catalog-cache tests**

Run: `npm run test -- src/features/orders src/features/catalog/queries/useProductDetailQuery.test.ts`

Expected: PASS; duplicate product IDs make one detail request each and one failure does not hide siblings.

- [ ] **Step 5: Verify, update backlog, and commit**

Run: `npm run typecheck && npm run lint && npm run test -- src/features/orders`

Expected: PASS. Mark TASK-102 DONE and TASK-103 READY, then commit:

```bash
git add frontend/src/features/orders docs/frontend-tasks-v2.md
git commit -m "feat(TASK-102): Hidratar produtos do pedido"
```

### Task 8: TASK-103 — Ação de cancelamento

**Files:**
- Create: `frontend/src/features/orders/services/cancelOrderService.ts`
- Create: `frontend/src/features/orders/services/cancelOrderService.test.ts`
- Create: `frontend/src/features/orders/mutations/useCancelOrderMutation.ts`
- Create: `frontend/src/features/orders/mutations/useCancelOrderMutation.test.tsx`
- Create: `frontend/src/features/orders/components/CancelOrderDialog.tsx`
- Create: `frontend/src/features/orders/components/CancelOrderDialog.test.tsx`
- Modify: `frontend/src/features/orders/pages/OrderDetailPage.tsx`
- Modify: `frontend/src/features/orders/pages/OrderDetailPage.test.tsx`

**Interfaces:**
- Consumes: `createCancelOrderRequest`, `adaptCancelledOrderResponse`, auth session, `Dialog`, `Button`.
- Produces: `cancelOrder({ orderId, token, signal? })`, `useCancelOrderMutation()`, `CancelOrderDialog`.

- [ ] **Step 1: Write failing payload/concurrency/dialog tests**

```ts
it('PATCHes only Cancelado and disables retry', async () => {
  await cancelOrder({ orderId: 41, token: 'token' })
  expect(client.request).toHaveBeenCalledWith('/api/v1/pedido/41', {
    method: 'PATCH', token: 'token', body: { status: 'Cancelado' },
  })
})

it('blocks duplicate confirmation and closing while pending', async () => {
  renderDialogWithPendingMutation()
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
  expect(screen.getByRole('button', { name: 'Cancelando pedido...' })).toBeDisabled()
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/features/orders/services/cancelOrderService.test.ts src/features/orders/mutations/useCancelOrderMutation.test.tsx src/features/orders/components/CancelOrderDialog.test.tsx`

Expected: FAIL because cancellation modules do not exist.

- [ ] **Step 3: Implement strict mutation and confirmation**

```ts
export function useCancelOrderMutation() {
  return useMutation({
    mutationFn: (attempt: CancelOrderAttempt) => cancelOrder(attempt),
    retry: false,
    meta: privateCacheMeta,
  })
}
```

Capture `customerId`, `orderId` and token when opening/confirming. Accept result only if response order/customer match and current session is unchanged. Use `Dialog closeDisabled={pending}`, initial focus on safe “Voltar”, and show CTA only when status is neither `Cancelado` nor `Devolvido`.

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- src/features/orders`

Expected: PASS for exact body, 401/global path, 404/general error, mismatched envelope, late session, Escape/focus and duplicate click.

- [ ] **Step 5: Verify, update backlog, and commit**

Run: `npm run typecheck && npm run lint && npm run test -- src/features/orders`

Expected: PASS. Mark TASK-103 DONE and TASK-104 READY, then commit:

```bash
git add frontend/src/features/orders docs/frontend-tasks-v2.md
git commit -m "feat(TASK-103): Cancelar pedido confirmado"
```

### Task 9: TASK-104 — Recusa 422 e reconciliação

**Files:**
- Modify: `frontend/src/features/orders/mutations/useCancelOrderMutation.ts`
- Modify: `frontend/src/features/orders/mutations/useCancelOrderMutation.test.tsx`
- Modify: `frontend/src/features/orders/pages/OrderDetailPage.tsx`
- Modify: `frontend/src/features/orders/pages/OrderDetailPage.test.tsx`

**Interfaces:**
- Consumes: `orderQueryKeys.detail`, `AppError`, `QueryClient.fetchQuery/invalidateQueries`, `InlineAlert`.
- Produces: discriminated page feedback `cancel-rejected` without changing confirmed order optimistically.

- [ ] **Step 1: Write failing 422 integration tests**

```tsx
it('refetches detail and announces a rejected cancellation', async () => {
  server.use(http.patch('*/api/v1/pedido/41', () => HttpResponse.json(validationError, { status: 422 })))
  await confirmCancellation()
  expect(await screen.findByRole('alert')).toHaveTextContent('cancelamento não foi aceito')
  expect(detailRequests).toBe(2)
  expect(screen.getByText('Processado')).toBeInTheDocument()
})

it('keeps the rejection message if reconciliation fails', async () => {
  rejectRefetchAfter422()
  await confirmCancellation()
  expect(await screen.findByRole('alert')).toHaveTextContent('cancelamento não foi aceito')
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/features/orders/mutations/useCancelOrderMutation.test.tsx src/features/orders/pages/OrderDetailPage.test.tsx`

Expected: FAIL because 422 currently follows only the generic error path.

- [ ] **Step 3: Implement explicit best-effort rejection flow**

```ts
if (error instanceof AppError && error.status === 422) {
  try {
    await queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(customerId, orderId), exact: true })
  } catch {
    // The original server refusal remains the user-facing outcome.
  }
  return { kind: 'cancel-rejected' as const }
}
throw error
```

Render an assertive `InlineAlert` stating the API rejected the transition and the latest available state is shown. Never set `status: 'Cancelado'` before the server response.

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- src/features/orders/mutations/useCancelOrderMutation.test.tsx src/features/orders/pages/OrderDetailPage.test.tsx`

Expected: PASS for successful refetch, failed refetch, no automatic second PATCH, re-enabled dialog and generic non-422 error.

- [ ] **Step 5: Verify, update backlog, and commit**

Run: `npm run typecheck && npm run lint && npm run test -- src/features/orders`

Expected: PASS. Mark TASK-104 DONE and TASK-105 READY, then commit:

```bash
git add frontend/src/features/orders docs/frontend-tasks-v2.md
git commit -m "feat(TASK-104): Reconciliar cancelamento recusado"
```

### Task 10: TASK-105 — Invalidação de lista e detalhe

**Files:**
- Modify: `frontend/src/features/orders/cache/orderQueryKeys.ts`
- Modify: `frontend/src/features/orders/mutations/useCancelOrderMutation.ts`
- Modify: `frontend/src/features/orders/mutations/useCancelOrderMutation.test.tsx`
- Modify: `frontend/src/features/orders/pages/OrderDetailPage.test.tsx`
- Modify: `frontend/src/features/orders/pages/OrdersPage.test.tsx`

**Interfaces:**
- Consumes: `orderQueryKeys.detail`, `orderQueryKeys.lists`, validated cancellation result and captured session.
- Produces: successful mutation convergence across every list page/period and exact detail.

- [ ] **Step 1: Write failing cache-convergence tests**

```ts
it('reconciles exact detail and every list for the same customer after success', async () => {
  seedOrderListsForCustomer(7, [unfilteredPage, filteredPage, secondPage])
  await mutation.mutateAsync(attemptFor({ customerId: 7, orderId: 41 }))
  expect(invalidatedKeys).toContainEqual(orderQueryKeys.detail(7, 41))
  expect(invalidatedPrefixes).toContainEqual(orderQueryKeys.lists(7))
  expect(invalidatedPrefixes).not.toContainEqual(orderQueryKeys.lists(8))
})

it.each(['422', 'mismatch', 'late-session'])('does not run success effects for %s', async (scenario) => {
  await runScenario(scenario)
  expect(successInvalidations).toHaveLength(0)
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/features/orders/mutations/useCancelOrderMutation.test.tsx src/features/orders/pages/OrderDetailPage.test.tsx src/features/orders/pages/OrdersPage.test.tsx`

Expected: FAIL because accepted cancellation does not yet invalidate both namespaces.

- [ ] **Step 3: Implement guarded best-effort convergence**

```ts
if (!sameSession(attempt) || result.orderId !== attempt.orderId || result.customerId !== attempt.customerId) {
  throw staleOrderAttemptError()
}
queryClient.setQueryData(orderQueryKeys.detail(attempt.customerId, attempt.orderId), (current: Order | undefined) =>
  current ? { ...current, status: result.status } : current)
await Promise.allSettled([
  queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(attempt.customerId, attempt.orderId), exact: true }),
  queryClient.invalidateQueries({ queryKey: orderQueryKeys.lists(attempt.customerId) }),
])
```

Keep 422 reconciliation separate from accepted-success effects. Do not turn invalidation rejection into a second PATCH or erase the confirmed success feedback.

- [ ] **Step 4: Run focused and full verification**

Run: `npm run test -- src/features/orders src/features/checkout && npm run typecheck && npm run lint && npm run build && npm run test:e2e -- --list`

Expected: focused tests PASS; typecheck/lint/build PASS; order route chunks remain separate; E2E lists at least the existing smoke test.

- [ ] **Step 5: Complete backlog and commit**

Run: `npm run test`

Expected: full suite PASS with no regressions. Mark TASK-105 DONE, record test counts/commits/findings for TASK-096..105, and commit:

```bash
git add frontend/src/features/orders docs/frontend-tasks-v2.md
git commit -m "feat(TASK-105): Reconciliar caches de pedidos"
```

## Final Phase Review

- [ ] Generate `git diff <FASE_7_BASE_COMMIT>..HEAD` and delegate a read-only reviewer after all ten implementation commits.
- [ ] Resolve every CRITICAL or IMPORTANT finding with the originating implementer, rerun tests and request re-review.
- [ ] Confirm `git status --short` contains no unintended files and all TASK-096..105 are DONE with evidence.
- [ ] Run final gates: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, and `npm run test:e2e -- --list`; record exact counts and the non-blocking bundle warning if it persists.
- [ ] Present completed/blocked tasks, commits, tests, pending findings and backlog changes; do not merge to `main` implicitly.
