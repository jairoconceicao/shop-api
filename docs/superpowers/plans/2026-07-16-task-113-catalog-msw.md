# TASK-113 — Catálogo MSW Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar paralelismo, URL/request, categoria dedicada, metadata, histórico, canonicalização e produto 404 sem retry.

**Architecture:** AppRouter real recebe handlers controlados. Ledgers de URL e gates independentes tornam o início paralelo e o número de retries mensuráveis.

**Tech Stack:** Vitest, Testing Library, MSW, TanStack Query, React Router.

**No product change planned.** Este plano cria somente a spec. Um RED sem patch literal muda TASK-113 para `BLOCKED` e retorna ao explorador.

## Global Constraints

- TASK-113 READY, dependências DONE, BASE registrado, writer único, `server.listen({ onUnhandledRequest: 'error' })` e zero mocks de produto.

### Task 1: integração catalog

**Files:**
- Create: `frontend/src/features/catalog/catalog.integration.test.tsx`

**Interfaces:** consumes `renderIntegration`, AppRouter; requests `/api/v1/categoria`, `/api/v1/produto`, `/api/v1/produto/categoria/5`, `/api/v1/produto/42`; catalog size literal `20`.

- [ ] **Step 1: workflow**

BASE_COMMIT → relatório do explorador dos quatro arquivos → implementador → IN_PROGRESS.

#### Complete target listing

```tsx
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRouter } from '../../app/router/AppRouter'
import { renderIntegration } from '../../shared/testing/renderIntegration'
import { server } from '../../shared/testing/server'
import { catalogQueryKeys } from './queries/useCatalogQuery'
import { productQueryKeys } from './queries/useProductDetailQuery'

const categories = { status: true, data: [{ categoriaId: 5, titulo: 'Hardware', descricao: 'Componentes' }] } as const
const page = { status: true, pagination: { pages: 2, size: 20, totalItems: 21, data: [{ produtoId: 42, titulo: 'Teclado Mecânico', thumb: null, preco: 199.9, estoque: 8, categoria: { categoriaId: 5, titulo: 'Hardware' } }] } } as const
const product = { status: true, data: { produtoId: 42, titulo: 'Teclado Mecânico', descricao: 'ABNT2', modelo: 'TK42', foto: null, preco: 199.9, estoque: 8, categoria: { categoriaId: 5, titulo: 'Hardware' } } } as const
function deferred() { let resolve!: () => void; const promise = new Promise<void>((done) => { resolve = done }); return { promise, resolve } }
function BackButton() { const navigate = useNavigate(); return <button onClick={() => navigate(-1)}>Voltar histórico</button> }
function LocationProbe() { const location = useLocation(); return <output aria-label="URL atual">{location.search}</output> }

describe('TASK-113 catalog integration', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); window.history.replaceState(null, '', '/') })

  it('starts categories and first catalog page before either response resolves', async () => {
    const categoryGate = deferred(); const catalogGate = deferred(); const started: string[] = []
    server.use(http.get('*/api/v1/categoria', async () => { started.push('categories'); await categoryGate.promise; return HttpResponse.json(categories) }), http.get('*/api/v1/produto', async ({ request }) => { started.push(new URL(request.url).search); await catalogGate.promise; return HttpResponse.json(page) }))
    renderIntegration(<AppRouter />); await waitFor(() => expect(started).toEqual(expect.arrayContaining(['categories', '?page=1&size=20']))); categoryGate.resolve(); catalogGate.resolve(); expect(await screen.findByRole('link', { name: /Teclado Mecânico/i })).toBeInTheDocument()
  })

  it('serializes search and page in URL/request and restores history', async () => {
    const urls: string[] = []
    server.use(http.get('*/api/v1/categoria', () => HttpResponse.json(categories)), http.get('*/api/v1/produto', ({ request }) => { urls.push(new URL(request.url).search); return HttpResponse.json(page) }))
    const { user, queryClient } = renderIntegration(<><AppRouter /><BackButton /><LocationProbe /></>)
    const search = (await screen.findAllByRole('searchbox', { name: 'Buscar produtos' }))[0]; await user.type(search, 'teclado'); await user.keyboard('{Enter}'); await waitFor(() => expect(screen.getByRole('status', { name: 'URL atual' })).toHaveTextContent('?searchword=teclado')); await user.click(screen.getByRole('button', { name: 'Página 2' })); await waitFor(() => expect(screen.getByRole('status', { name: 'URL atual' })).toHaveTextContent('?searchword=teclado&page=2')); expect(urls.at(-1)).toBe('?page=2&size=20&searchword=teclado'); await user.click(screen.getByRole('button', { name: 'Voltar histórico' })); await waitFor(() => expect(screen.getByRole('status', { name: 'URL atual' })).toHaveTextContent('?searchword=teclado')); expect(screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]).toHaveValue('teclado'); expect(queryClient.getQueryData(catalogQueryKeys.list({ page: 1, size: 20, searchword: 'teclado' }))).toEqual({ products: [{ id: 42, title: 'Teclado Mecânico', thumbnail: null, price: 199.9, stock: 8, category: { id: 5, title: 'Hardware' } }], pagination: { pages: 2, size: 20, totalItems: 21 } }); expect(screen.queryByRole('button', { name: 'Página 3' })).not.toBeInTheDocument()
  })

  it('uses only dedicated category endpoint', async () => {
    let general = 0; let dedicated = 0
    server.use(http.get('*/api/v1/categoria', () => HttpResponse.json(categories)), http.get('*/api/v1/produto', () => { general += 1; return HttpResponse.json(page) }), http.get('*/api/v1/produto/categoria/5', () => { dedicated += 1; return HttpResponse.json(page) }))
    renderIntegration(<AppRouter />, { initialEntries: ['/?categoriaId=5'] }); expect(await screen.findByText('Teclado Mecânico')).toBeInTheDocument(); expect(dedicated).toBe(1); expect(general).toBe(0)
  })

  it('canonicalizes invalid filters before the request', async () => {
    const urls: string[] = []
    server.use(http.get('*/api/v1/categoria', () => HttpResponse.json(categories)), http.get('*/api/v1/produto', ({ request }) => { urls.push(new URL(request.url).search); return HttpResponse.json(page) }))
    renderIntegration(<><AppRouter /><LocationProbe /></>, { initialEntries: ['/?page=abc&categoriaId=-2&searchword=%20%20'] }); expect(await screen.findByText('Teclado Mecânico')).toBeInTheDocument(); await waitFor(() => expect(screen.getByRole('status', { name: 'URL atual' })).toHaveTextContent(/^$/)); expect(urls).toEqual(['?page=1&size=20'])
  })

  it('renders product 404 after one request without retry', async () => {
    let calls = 0
    server.use(http.get('*/api/v1/produto/42', () => { calls += 1; return HttpResponse.json({ error: { message: 'Produto ausente' } }, { status: 404 }) }))
    const { queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/produtos/42'] }); expect(await screen.findByRole('heading', { name: 'Produto não encontrado' })).toBeInTheDocument(); await new Promise((done) => setTimeout(done, 50)); expect(calls).toBe(1); expect(queryClient.getQueryState(productQueryKeys.detail(42))?.status).toBe('error'); expect(queryClient.getQueryData(productQueryKeys.detail(42))).toBeUndefined()
  })
})
```

- [ ] **Step 2: criar imports, fixtures e probes**

Copie do listing o início até antes de `describe`.

- [ ] **Step 3: adicionar paralelismo e histórico**

Copie `beforeEach` e os dois primeiros testes.

- [ ] **Step 4: adicionar categoria e canonicalização**

Copie os testes do endpoint dedicado e filtros inválidos.

- [ ] **Step 5: adicionar 404 sem stale**

Copie o teste 404 e feche `describe`.

- [ ] **Step 6: RED/GREEN/review**

RED: focused command. Expected literals: canonical test `expected '?page=abc...' to be ''`; history test `expected '?searchword=teclado&page=2'`; 404 test `expected 3 to be 1`. Esse resultado muda TASK-113 para `BLOCKED` e retorna ao explorador.

Commands: `npm --prefix frontend test -- src/features/catalog/catalog.integration.test.tsx --reporter=verbose`; typecheck; lint. GREEN = exit `0` nos três.

Commit: `test(TASK-113): integrar catálogo com MSW`. Execute `git diff $BASE_COMMIT..HEAD`, review e DONE.

## Self-review

- Todos os requests gerais usam `size=20`.
- Paralelismo é observado antes de liberar responses.
- Categoria dedicada impede chamada geral.
