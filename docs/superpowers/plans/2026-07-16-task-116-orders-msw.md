# TASK-116 — Pedidos MSW Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar filtros/paginação, cliente/pedido, produtos únicos e cancelamento 422/sucesso com caches privados exatos.

**Architecture:** AppRouter real carrega perfil, lista/detalhe e produto. Ledgers verificam query/body/auth; fixtures repetem produto 42 em dois itens para medir deduplicação.

**Tech Stack:** Vitest, Testing Library, MSW, TanStack Query, React Router, Zustand.

**No product change planned.** Este plano cria somente a spec. Um RED sem patch literal muda TASK-116 para `BLOCKED` e retorna ao explorador.

## Global Constraints

- TASK-116 READY; dependências DONE; BASE antes da escrita; `server.listen({ onUnhandledRequest: 'error' })`; zero mocks de produto; writer único.

### Task 1: integração orders

**Files:**
- Create: `frontend/src/features/orders/orders.integration.test.tsx`

**Interfaces:** exact keys `orderQueryKeys.detail(7,900)`, `orderQueryKeys.lists(7)`, `['orders','products',[42]]`; list size `20`.

- [ ] **Step 1: workflow**

BASE_COMMIT → relatório do explorador → implementador → IN_PROGRESS.

#### Complete target listing

```tsx
import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRouter } from '../../app/router/AppRouter'
import { renderIntegration } from '../../shared/testing/renderIntegration'
import { server } from '../../shared/testing/server'
import { useAuthStore } from '../auth/store/authStore'
import { orderQueryKeys } from './cache/orderQueryKeys'

const address = { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' } as const
const profile = { status: true, data: { clienteId: 7, cpf: '12345678901', nome: 'Ana Silva', dataNascimento: '1990-05-20', email: 'ana@example.com', endereco: address, celular: { ddd: '11', numero: '999999999', whatsApp: true } } } as const
const order = { pedidoId: 900, carrinhoId: 70, clienteId: 7, enderecoEntrega: address, dataPedido: '2026-07-16T10:30:00Z', formaPagamento: 'Pix', status: 'Criado', items: [{ itemId: 901, produtoId: 42, quantidade: 1, valorUnitario: 199.9 }, { itemId: 902, produtoId: 42, quantidade: 2, valorUnitario: 199.9 }] } as const
const listResponse = { status: true, pagination: { pages: 2, size: 20, totalItems: 21, data: [order] } } as const
const detailResponse = { status: true, data: order } as const
const cancelledDetailResponse = { status: true, data: { ...order, status: 'Cancelado' } } as const
const cancelResponse = { status: true, data: { pedidoId: 900, clienteId: 7, dataPedido: '2026-07-16T10:30:00Z', status: 'Cancelado' } } as const
const product = { status: true, data: { produtoId: 42, titulo: 'Teclado Mecânico', descricao: 'ABNT2', modelo: 'TK42', foto: null, preco: 199.9, estoque: 8, categoria: { categoriaId: 5, titulo: 'Hardware' } } } as const
function seed() { useAuthStore.getState().setSession({ token: 'token-7', tipo: 'Bearer', expiraEm: '2099-07-17T12:00:00Z', usuarioId: 3, clienteId: 7, email: 'ana@example.com' }, 'session') }

describe('TASK-116 orders integration', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); useAuthStore.getState().clearSession(); seed() })

  it('sends CPF, local period boundaries, page and size 20', async () => {
    const urls: URL[] = []; const auth: Array<string | null> = []
    server.use(http.get('*/api/v1/cliente/7', () => HttpResponse.json(profile)), http.get('*/api/v1/pedido', ({ request }) => { urls.push(new URL(request.url)); auth.push(request.headers.get('authorization')); return HttpResponse.json(listResponse) }))
    renderIntegration(<AppRouter />, { initialEntries: ['/pedidos?dataInicio=2026-07-01&dataFim=2026-07-15&page=2'] }); expect(await screen.findByText(/Pedido 900/i)).toBeInTheDocument(); const query = urls[0].searchParams; expect(query.get('cpf')).toBe('12345678901'); expect(query.get('dataInicio')).toBe(new Date(2026, 6, 1, 0, 0, 0, 0).toISOString()); expect(query.get('dataFim')).toBe(new Date(2026, 6, 15, 23, 59, 59, 999).toISOString()); expect(query.get('page')).toBe('2'); expect(query.get('size')).toBe('20'); expect(auth).toEqual(['Bearer token-7']); expect(screen.queryByRole('button', { name: 'Página 3' })).not.toBeInTheDocument()
  })

  it('uses captured customer/order and fetches product 42 once', async () => {
    let details = 0; let products = 0
    server.use(http.get('*/api/v1/cliente/7', () => HttpResponse.json(profile)), http.get('*/api/v1/pedido/900', () => { details += 1; return HttpResponse.json(detailResponse) }), http.get('*/api/v1/produto/42', () => { products += 1; return HttpResponse.json(product) }))
    const { queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/pedidos/900'] }); expect(await screen.findByRole('heading', { name: 'Pedido 900' })).toBeInTheDocument(); expect(await screen.findAllByText('Teclado Mecânico')).toHaveLength(2); expect(details).toBe(1); expect(products).toBe(1); expect(queryClient.getQueryData(orderQueryKeys.detail(7, 900))).toBeDefined(); expect(queryClient.getQueryData(['orders', 'products', [42]])).toBeDefined()
  })

  it('sends only Cancelado, announces 422, keeps Criado and reloads detail', async () => {
    let details = 0; const bodies: unknown[] = []
    server.use(http.get('*/api/v1/cliente/7', () => HttpResponse.json(profile)), http.get('*/api/v1/pedido/900', () => { details += 1; return HttpResponse.json(detailResponse) }), http.get('*/api/v1/produto/42', () => HttpResponse.json(product)), http.patch('*/api/v1/pedido/900', async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json({ error: { code: 'ORDER_NOT_CANCELLABLE', message: 'Pedido não pode ser cancelado.' } }, { status: 422 }) }))
    const { user, queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/pedidos/900'] }); expect(await screen.findByText('Criado')).toBeInTheDocument(); await user.click(screen.getByRole('button', { name: 'Cancelar pedido' })); const dialog = await screen.findByRole('dialog', { name: 'Cancelar pedido' }); await user.click(within(dialog).getByRole('button', { name: 'Cancelar pedido' })); expect(await screen.findByRole('alert')).toHaveTextContent('O cancelamento não foi aceitoA API recusou a alteração. O estado mais recente disponível do pedido está sendo exibido.'); await waitFor(() => expect(details).toBe(2)); expect(bodies).toEqual([{ status: 'Cancelado' }]); expect(screen.getByText('Criado')).toBeInTheDocument(); expect(queryClient.getQueryData<{ status: string }>(orderQueryKeys.detail(7, 900))?.status).toBe('Criado')
  })

  it('reconciles detail and customer 7 lists after successful cancel', async () => {
    let details = 0; server.use(http.get('*/api/v1/cliente/7', () => HttpResponse.json(profile)), http.get('*/api/v1/pedido/900', () => { details += 1; return HttpResponse.json(details === 1 ? detailResponse : cancelledDetailResponse) }), http.get('*/api/v1/produto/42', () => HttpResponse.json(product)), http.patch('*/api/v1/pedido/900', () => HttpResponse.json(cancelResponse)))
    const { user, queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/pedidos/900'] }); queryClient.setQueryData(orderQueryKeys.list(7, undefined, undefined, 1, 20), { marker: 'customer-7' }); queryClient.setQueryData(orderQueryKeys.list(8, undefined, undefined, 1, 20), { marker: 'customer-8' }); await screen.findByText('Criado'); await user.click(screen.getByRole('button', { name: 'Cancelar pedido' })); const dialog = await screen.findByRole('dialog', { name: 'Cancelar pedido' }); await user.click(within(dialog).getByRole('button', { name: 'Cancelar pedido' })); await waitFor(() => expect(details).toBe(2)); expect(queryClient.getQueryData<{ status: string }>(orderQueryKeys.detail(7, 900))?.status).toBe('Cancelado'); expect(queryClient.getQueryState(orderQueryKeys.list(7, undefined, undefined, 1, 20))?.isInvalidated).toBe(true); expect(queryClient.getQueryState(orderQueryKeys.list(8, undefined, undefined, 1, 20))?.isInvalidated).toBe(false)
  })
})
```

- [ ] **Step 2: criar imports, fixtures e helper de sessão**

Copie o início do listing até antes de `describe`.

- [ ] **Step 3: adicionar lista e detalhe**

Copie `beforeEach` e os dois primeiros testes.

- [ ] **Step 4: adicionar cancelamento 422**

Copie o terceiro teste com dialog/copy reais.

- [ ] **Step 5: adicionar cancelamento bem-sucedido**

Copie o teste final e feche `describe`.

- [ ] **Step 6: RED/GREEN/review**

RED focused expected literals: product count `expected 2 to be 1`; 422 refresh `expected 1 to be 2`; success customer scope `expected false to be true`. Esse resultado muda TASK-116 para `BLOCKED` e retorna ao explorador.

GREEN focused + typecheck + lint exit `0`. Commit `test(TASK-116): integrar pedidos com MSW`. Execute `git diff $BASE_COMMIT..HEAD`, review e DONE.

## Self-review

- Lista/detalhe/cancelamento usam fixtures strict completas.
- Key de produtos é literalmente `['orders','products',[42]]`.
- PATCH body possui somente status Cancelado; cliente 8 permanece não invalidado.
