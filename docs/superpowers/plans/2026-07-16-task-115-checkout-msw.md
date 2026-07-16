# TASK-115 — Checkout MSW Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar contrato estrito, data ISO, itens confirmados, POST único e efeitos exatos de 201/409/422.

**Architecture:** guard/page/mutation reais carregam GET cart/profile. Um POST controlado mantém o botão pending; QueryClient e stores expõem operações exatas após resolução.

**Tech Stack:** Vitest, Testing Library, MSW, TanStack Query, React Router, Zustand.

**No product change planned.** Este plano cria somente a spec. Um RED sem patch literal muda TASK-115 para `BLOCKED` e retorna ao explorador.

## Global Constraints

- Execução proibida enquanto TASK-114 não estiver DONE e TASK-115 não estiver READY.
- Depois do desbloqueio: BASE, explorador, implementador, writer único, `server.listen({ onUnhandledRequest: 'error' })`, review e fix-loop.

### Task 1: integração checkout

**Files:**
- Create: `frontend/src/features/checkout/checkout.integration.test.tsx`

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
function baseHandlers() { return [http.get('*/api/v1/carrinho/70', () => HttpResponse.json(cartResponse)), http.get('*/api/v1/cliente/7', () => HttpResponse.json(profileResponse))] }

describe('TASK-115 checkout integration', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); vi.setSystemTime(new Date('2026-07-16T12:00:00.000Z')); localStorage.clear(); sessionStorage.clear(); useAuthStore.getState().clearSession(); useCartSessionStore.setState({ cartIdsByCustomer: {} }); seed() })
  afterEach(() => vi.useRealTimers())

  it('posts strict confirmed contract once and applies exact 201 effects', async () => {
    const gate = deferred<Response>(); const bodies: unknown[] = []
    server.use(...baseHandlers(), http.post('*/api/v1/pedido', async ({ request }) => { bodies.push(await request.json()); return gate.promise }))
    const { user, queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/checkout'] }); queryClient.setQueryData(orderQueryKeys.list(7, undefined, undefined, 1, 20), { marker: 'existing-orders' }); expect(await screen.findByRole('heading', { name: 'Checkout' })).toBeInTheDocument(); expect(screen.getByDisplayValue('Rua A')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Pix' })); await user.dblClick(screen.getByRole('button', { name: 'Confirmar pedido' })); await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({ enderecoEntrega: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, formaPagamento: 'Pix', dataPedido: '2026-07-16T12:00:00.000Z', items: [{ itemId: 701, produtoId: 42, quantidade: 2, valorUnitario: 199.9 }] }); expect(bodies[0]).not.toHaveProperty('clienteId'); expect(bodies[0]).not.toHaveProperty('carrinhoId')
    gate.resolve(HttpResponse.json(createdOrderResponse, { status: 201 })); expect(await screen.findByRole('heading', { name: 'Pedido criado' })).toBeInTheDocument(); expect(useCartSessionStore.getState().getCartId(7)).toBeUndefined(); expect(queryClient.getQueryData(cartQueryKeys.detail(7, 70))).toBeUndefined(); expect(queryClient.getQueryData(orderConfirmationKey(7, 900))).toEqual({ id: 900, customerId: 7, createdAt: '2026-07-16T12:00:00.000Z', paymentMethod: 'Pix', status: 'Criado', total: 399.8 }); expect(queryClient.getQueryState(orderQueryKeys.list(7, undefined, undefined, 1, 20))?.isInvalidated).toBe(true)
  })

  it.each([409, 422])('preserves checkout and skips success effects for HTTP %i', async (status) => {
    server.use(...baseHandlers(), http.post('*/api/v1/pedido', () => HttpResponse.json({ error: { code: 'ORDER_REJECTED', message: status === 409 ? 'Carrinho alterado.' : 'Pedido inválido.' } }, { status })))
    const expectedCopy = status === 409 ? 'Revise o carrinho antes de tentar novamente.' : 'Revise os dados do pedido e tente novamente.'
    const { user, queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/checkout'] }); queryClient.setQueryData(orderQueryKeys.list(7, undefined, undefined, 1, 20), { marker: 'existing-orders' }); expect(await screen.findByRole('heading', { name: 'Checkout' })).toBeInTheDocument(); await user.click(screen.getByRole('button', { name: 'Confirmar pedido' })); expect(await screen.findByRole('alert')).toHaveTextContent(`Não foi possível confirmar o pedido${expectedCopy}`); expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument(); expect(screen.getByDisplayValue('Rua A')).toBeInTheDocument(); expect(screen.getByRole('radio', { name: 'Pix' })).toBeChecked(); expect(useCartSessionStore.getState().getCartId(7)).toBe(70); expect(queryClient.getQueryData(cartQueryKeys.detail(7, 70))).toEqual(cart); expect(queryClient.getQueryData(orderConfirmationKey(7, 900))).toBeUndefined(); expect(queryClient.getQueryState(orderQueryKeys.list(7, undefined, undefined, 1, 20))?.isInvalidated).toBe(false)
  })
})
```

- [ ] **Step 2: criar imports, fixtures e helpers**

Copie o início do listing até antes de `describe`.

- [ ] **Step 3: adicionar setup determinístico**

Copie `beforeEach` e `afterEach`; execute `npm --prefix frontend run typecheck`. Expected: exit `0`.

- [ ] **Step 4: adicionar contrato e efeitos 201**

Copie o primeiro teste.

- [ ] **Step 5: adicionar branches 409/422**

Copie o teste parametrizado e feche `describe`.

- [ ] **Step 6: RED/GREEN/review**

RED focused expected literals: `expected bodies to have a length of 1 but got 2`, `expected 70 to be undefined` ou failure branch `expected 70`. Esse resultado muda TASK-115 para `BLOCKED` e retorna ao explorador.

GREEN focused + typecheck + lint exit `0`. Commit `test(TASK-115): integrar criação de pedido com MSW`. Execute `git diff $BASE_COMMIT..HEAD`, review e DONE.

## Self-review

- Response 201 contém somente `pedidoId`, `clienteId`, `dataPedido`, `formaPagamento`, `status`, `valorTotal`.
- Itens POST são exatamente o snapshot confirmado pelo GET do carrinho: item 701, produto 42, quantidade 2 e preço 199.9.
- Keys e operações pós-201 são literais.
