# TASK-115 — Checkout MSW Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar contrato estrito, data ISO, itens confirmados, POST único e efeitos exatos de 201/409/422.

**Architecture:** guard/page/mutation reais carregam GET cart/profile. Um POST controlado mantém o botão pending; QueryClient e stores expõem operações exatas após resolução.

**Tech Stack:** Vitest, Testing Library, MSW, TanStack Query, React Router, Zustand.

Este plano inclui o patch literal de navegação após `201`. Outros REDs mudam TASK-115 para `BLOCKED` e retornam ao explorador.

## Global Constraints

- Execução proibida enquanto TASK-114 não estiver DONE e TASK-115 não estiver READY.
- Depois do desbloqueio: BASE, explorador, implementador, writer único, `server.listen({ onUnhandledRequest: 'error' })`, review e fix-loop.

### Task 1: integração checkout

**Files:**
- Create: `frontend/src/features/checkout/checkout.integration.test.tsx`
- Modify: `frontend/src/features/checkout/pages/CheckoutPage.tsx`
- Create test: `frontend/src/features/checkout/pages/CheckoutPage.navigation.test.tsx`

**Interfaces:** exact keys `cartQueryKeys.detail(7,70)`, `orderQueryKeys.all`, `orderConfirmationKey(7,900)`; POST `/api/v1/pedido`.

- [ ] **Step 1: workflow**

Verifique TASK-114 DONE e TASK-115 READY; registre BASE_COMMIT; relatório do explorador; implementador; IN_PROGRESS.

#### Complete target listing

```tsx
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRouter } from '../../app/router/AppRouter'
import { renderIntegration } from '../../shared/testing/renderIntegration'
import { server } from '../../shared/testing/server'
import { useAuthStore } from '../auth/store/authStore'
import type { Cart } from '../cart/contracts/cart'
import { cartQueryKeys } from '../cart/queries/useCartQuery'
import { useCartSessionStore } from '../cart/store/cartSessionStore'
import { orderConfirmationKey } from './cache/orderConfirmationCache'
import { orderQueryKeys } from './cache/orderCache'

const cart: Cart = { customerId: 7, id: 70, createdAt: '2026-07-16T10:00:00Z', items: [{ id: 701, productId: 42, quantity: 2, unitPrice: 199.9 }] }
const cartResponse = { status: true, data: { clienteId: 7, carrinhoId: 70, dataCarrinho: '2026-07-16T10:00:00Z', items: [{ itemId: 701, produtoId: 42, quantidade: 2, valorUnitario: 199.9 }] } } as const
const profileResponse = { status: true, data: { clienteId: 7, cpf: '12345678901', nome: 'Ana Silva', dataNascimento: '1990-05-20', email: 'ana@example.com', endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, celular: { ddd: '11', numero: '999999999', whatsApp: true } } } as const
const createdOrderResponse = { status: true, data: { pedidoId: 900, clienteId: 7, dataPedido: '2026-07-16T12:00:00.000Z', formaPagamento: 'Pix', status: 'Criado', valorTotal: 399.8 } } as const
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done }); return { promise, resolve } }
function seed() { useAuthStore.getState().setSession({ token: 'token-7', tipo: 'Bearer', expiraEm: '2099-07-17T12:00:00Z', usuarioId: 3, clienteId: 7, email: 'ana@example.com' }, 'session'); useCartSessionStore.getState().setCartId(7, 70) }
type ConfirmedLoadCounts = { cart: number; profile: number }
function baseHandlers(counts: ConfirmedLoadCounts) {
  return [
    http.get('*/api/v1/carrinho/70', () => { counts.cart += 1; return HttpResponse.json(cartResponse) }),
    http.get('*/api/v1/cliente/7', () => { counts.profile += 1; return HttpResponse.json(profileResponse) }),
  ]
}

describe('TASK-115 checkout integration', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-07-16T12:00:00.000Z')); localStorage.clear(); sessionStorage.clear(); useAuthStore.getState().clearSession(); useCartSessionStore.setState({ cartIdsByCustomer: {} }); seed() })
  afterEach(() => vi.useRealTimers())

  it('posts strict confirmed contract once and applies exact 201 effects', async () => {
    const gate = deferred<Response>(); const bodies: unknown[] = []; const loads = { cart: 0, profile: 0 }
    server.use(...baseHandlers(loads), http.post('*/api/v1/pedido', async ({ request }) => { bodies.push(await request.json()); return gate.promise }))
    const { user, queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/checkout'] }); queryClient.setQueryData(orderQueryKeys.list(7, undefined, undefined, 1, 20), { marker: 'existing-orders' }); expect(await screen.findByRole('heading', { name: 'Checkout' })).toBeInTheDocument(); expect(screen.getByDisplayValue('Rua A')).toBeInTheDocument(); expect(loads).toEqual({ cart: 1, profile: 1 }); expect(bodies).toHaveLength(0)
    await user.click(screen.getByRole('radio', { name: 'Pix' })); await user.dblClick(screen.getByRole('button', { name: 'Confirmar pedido' })); await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({ enderecoEntrega: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, formaPagamento: 'Pix', dataPedido: '2026-07-16T12:00:00.000Z', items: [{ itemId: 701, produtoId: 42, quantidade: 2, valorUnitario: 199.9 }] }); expect(bodies[0]).not.toHaveProperty('clienteId'); expect(bodies[0]).not.toHaveProperty('carrinhoId')
    gate.resolve(HttpResponse.json(createdOrderResponse, { status: 201 })); expect(await screen.findByRole('heading', { name: 'Pedido criado' })).toBeInTheDocument(); expect(useCartSessionStore.getState().getCartId(7)).toBeUndefined(); expect(queryClient.getQueryData(cartQueryKeys.detail(7, 70))).toBeUndefined(); expect(queryClient.getQueryData(orderConfirmationKey(7, 900))).toEqual({ id: 900, customerId: 7, createdAt: '2026-07-16T12:00:00.000Z', paymentMethod: 'Pix', status: 'Criado', total: 399.8 }); expect(queryClient.getQueryState(orderQueryKeys.list(7, undefined, undefined, 1, 20))?.isInvalidated).toBe(true)
  })

  it.each([409, 422])('preserves checkout and skips success effects for HTTP %i', async (status) => {
    const loads = { cart: 0, profile: 0 }; let posts = 0
    server.use(...baseHandlers(loads), http.post('*/api/v1/pedido', () => { posts += 1; return HttpResponse.json({ error: { code: 'ORDER_REJECTED', message: status === 409 ? 'Carrinho alterado.' : 'Pedido inválido.' } }, { status }) }))
    const expectedCopy = status === 409 ? 'Revise o carrinho antes de tentar novamente.' : 'Revise os dados do pedido e tente novamente.'
    const { user, queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/checkout'] }); queryClient.setQueryData(orderQueryKeys.list(7, undefined, undefined, 1, 20), { marker: 'existing-orders' }); expect(await screen.findByRole('heading', { name: 'Checkout' })).toBeInTheDocument(); expect(loads).toEqual({ cart: 1, profile: 1 }); expect(posts).toBe(0); await user.click(screen.getByRole('button', { name: 'Confirmar pedido' })); expect(await screen.findByRole('alert')).toHaveTextContent(`Não foi possível confirmar o pedido${expectedCopy}`); expect(posts).toBe(1); expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument(); expect(screen.getByDisplayValue('Rua A')).toBeInTheDocument(); expect(screen.getByRole('radio', { name: 'Pix' })).toBeChecked(); expect(useCartSessionStore.getState().getCartId(7)).toBe(70); expect(queryClient.getQueryData(cartQueryKeys.detail(7, 70))).toEqual(cart); expect(queryClient.getQueryData(orderConfirmationKey(7, 900))).toBeUndefined(); expect(queryClient.getQueryState(orderQueryKeys.list(7, undefined, undefined, 1, 20))?.isInvalidated).toBe(false)
  })
})
```

- [ ] **Step 2: criar imports, fixtures e helpers**

Copie o início do listing até antes de `describe`.

- [ ] **Step 3: adicionar setup determinístico**

Copie `beforeEach` e `afterEach`; execute `npm --prefix frontend run typecheck`. Expected: exit `0`.

- [ ] **Step 4: adicionar contrato e efeitos 201**

Copie o primeiro teste.

Run: `npm --prefix frontend test -- src/features/checkout/checkout.integration.test.tsx -t "posts strict confirmed contract once"`. Expected RED reproduzido: `Unable to find role="heading" and name "Pedido criado"`; a árvore termina em `/carrinho`, embora o POST `201`, body, snapshot, remoção do vínculo/cache e invalidação tenham ocorrido.

Diagnóstico: o callback global de `useCreateOrderMutation` remove o vínculo do carrinho antes do callback local `onSuccess` passado a `mutate`. O `CheckoutGuard` observa `hasCart=false`, redireciona para `/carrinho` e desmonta o `MutationObserver`. O TanStack Query só dispara callbacks locais de `mutate` enquanto o observer tem listeners; após a desmontagem, a navegação local é suprimida.

- [ ] **Step 5: escrever regressão isolada completa**

Crie um arquivo separado para que os mocks não substituam a mutation real usada pelos testes HTTP existentes em `CheckoutPage.test.tsx`:

```tsx
// frontend/src/features/checkout/pages/CheckoutPage.navigation.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreatedOrder } from '../contracts/order'
import { CheckoutPage } from './CheckoutPage'

const { mutateAsync, navigate, reset, mutationState } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  navigate: vi.fn(),
  reset: vi.fn(),
  mutationState: {
    error: null as Error | null,
    isPending: false,
  },
}))

vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => navigate,
  useOutletContext: () => undefined,
}))

vi.mock('../mutations/useCreateOrderMutation', () => ({
  useCreateOrderMutation: () => ({
    error: mutationState.error,
    isPending: mutationState.isPending,
    mutateAsync,
    reset,
  }),
}))

const cart = {
  customerId: 7,
  id: 70,
  createdAt: '2026-07-16T10:00:00Z',
  items: [{ id: 701, productId: 42, quantity: 2, unitPrice: 199.9 }],
}

const profile = {
  customerId: 7,
  address: {
    logradouro: 'Rua A',
    numero: '10',
    complemento: null,
    cep: '01001000',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
  },
}

const createdOrder: CreatedOrder = {
  id: 900,
  customerId: 7,
  createdAt: '2026-07-16T12:00:00.000Z',
  paymentMethod: 'Pix',
  status: 'Criado',
  total: 399.8,
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })
  return { promise, reject, resolve }
}

function renderPage() {
  return render(<CheckoutPage cart={cart} profile={profile} />)
}

describe('CheckoutPage mutation Promise navigation', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    navigate.mockReset()
    reset.mockReset()
    mutationState.error = null
    mutationState.isPending = false
  })

  it('navigates from the mutateAsync result after the checkout observer unmounts', async () => {
    const order = deferred<CreatedOrder>()
    mutateAsync.mockReturnValueOnce(order.promise)
    const view = renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    expect(reset).toHaveBeenCalledOnce()
    expect(mutateAsync).toHaveBeenCalledOnce()
    view.unmount()
    order.resolve(createdOrder)
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/pedido-confirmado/900'))
  })

  it('unlocks submission after mutateAsync rejects', async () => {
    const first = deferred<CreatedOrder>()
    mutateAsync.mockReturnValueOnce(first.promise).mockResolvedValueOnce(createdOrder)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    expect(mutateAsync).toHaveBeenCalledOnce()
    first.reject(new Error('pedido recusado'))
    await first.promise.catch(() => undefined)
    await Promise.resolve()
    expect(navigate).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2))
    expect(reset).toHaveBeenCalledTimes(2)
    expect(navigate).toHaveBeenCalledWith('/pedido-confirmado/900')
  })
})
```

O mock retorna exatamente a superfície usada pela página: `mutateAsync`, `isPending`, `error` e `reset`. `CreatedOrder` é importado do contrato real e a fixture contém somente seus campos.

Run: `npm --prefix frontend test -- src/features/checkout/pages/CheckoutPage.navigation.test.tsx --reporter=verbose`. Expected RED antes do patch: dois testes falham porque `mutateAsync` não é chamado; a implementação ainda usa `mutate`.

- [ ] **Step 6: aplicar patch literal em CheckoutPage**

Substitua o bloco `createOrderMutation.mutate(..., { onError, onSuccess })` por:

```tsx
submissionInFlightRef.current = true
createOrderMutation.reset()
void createOrderMutation
  .mutateAsync({ values: parsed.data, cart })
  .then((createdOrder) => {
    navigate(`/pedido-confirmado/${createdOrder.id}`)
  })
  .catch(() => {
    submissionInFlightRef.current = false
  })
```

Esse patch preserva o guard de single-submit (`submissionInFlightRef` + `isPending`), o erro já exposto por `createOrderMutation.error` e o unlock somente em rejeição. A Promise de `mutateAsync` resolve mesmo após a desmontagem do observer local.

Run regressão isolada do Step 5. Expected GREEN: `2 passed`; resolução navega após unmount e rejeição permite uma segunda submissão.

Run integração `201` do Step 4. Expected GREEN: heading `Pedido criado`, rota `/pedido-confirmado/900`, snapshot presente, vínculo/cache removidos e pedidos invalidados.

- [ ] **Step 7: adicionar branches 409/422**

Copie o teste parametrizado e feche `describe`.

Run: `npm --prefix frontend test -- src/features/checkout/checkout.integration.test.tsx -t "preserves checkout"`. Expected GREEN: `2 passed`; RED inesperado → `BLOCKED`.

- [ ] **Step 8: gate final e review**

Execute:

```powershell
npm --prefix frontend test -- src/features/checkout/checkout.integration.test.tsx --reporter=verbose
npm --prefix frontend test -- src/features/checkout/pages/CheckoutPage.test.tsx src/features/checkout/pages/CheckoutPage.navigation.test.tsx src/features/checkout/mutations/useCreateOrderMutation.test.tsx --reporter=verbose
npm --prefix frontend run typecheck
npm --prefix frontend run lint
```

Expected: quatro exit codes `0`. Commits: `test(TASK-115): integrar criação de pedido com MSW`; `fix(TASK-115): navegar após reconciliação do pedido`. Execute `git diff $BASE_COMMIT..HEAD`, review e DONE.

## Self-review

- Response 201 contém somente `pedidoId`, `clienteId`, `dataPedido`, `formaPagamento`, `status`, `valorTotal`.
- Itens POST são exatamente o snapshot confirmado pelo GET do carrinho: item 701, produto 42, quantidade 2 e preço 199.9.
- Keys e operações pós-201 são literais.
- Fake timers falsificam somente `Date`; timers usados por `userEvent`, React e Testing Library permanecem reais.
- Cada branch exige exatamente um GET do carrinho e um GET do perfil antes do primeiro POST.
- O RED `201` reproduzido não é falha de contrato: o observer desmontado suprime o callback local de `mutate`; `mutateAsync` remove essa dependência.
