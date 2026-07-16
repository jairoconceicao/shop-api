# Fase 8 — Lote 2: Integrações MSW Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar, com MSW e providers reais, o wiring HTTP, os efeitos visíveis, as rotas e a reconciliação de cache de autenticação, cadastro/perfil, catálogo, carrinho, checkout e pedidos.

**Architecture:** cada feature recebe uma spec de integração focada que monta páginas e hooks reais sobre `QueryClientProvider`, router em memória, providers de feedback/autorização e o servidor MSW global. Handlers são declarados dentro da spec proprietária; somente a montagem comum e fixtures canônicas nascem na primeira task e são reutilizadas sem esconder requests ou assertions.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library + user-event, TanStack Query 5, React Router 7, MSW 2, Zustand, Zod.

## Global Constraints

- Executar somente task com `Status: READY`, dependências `DONE`, critérios definidos e componentes sem writer concorrente.
- O agente principal atua somente como orquestrador: registrar `BASE_COMMIT`, delegar exploração, aguardar relatório, delegar implementação, testar, gerar `git diff BASE_COMMIT..HEAD`, delegar revisão e aguardar aprovação.
- Um writer por checkout. Findings `CRITICAL` ou `IMPORTANT` voltam ao implementador, repetem testes e revisão.
- Não alterar produto antes de um RED que demonstre a lacuna; testes usam serviços, mutations, queries, stores e providers reais, sem `vi.mock` desses módulos.
- `frontend/src/shared/testing/setup.ts` preserva `server.listen({ onUnhandledRequest: 'error' })`; nenhum handler-curinga, passthrough ou downgrade para `warn`.
- Cada caso afirma endpoint, método, `Authorization`, query/body, efeito visível, rota e cache aplicáveis; request inesperado deve falhar.
- Todos os comandos partem da raiz e usam `npm --prefix frontend`.
- Commits funcionais seguem `test(TASK-ID): descrição` e `fix(TASK-ID): descrição`; atualização de backlog ocorre somente após revisão aprovada.
- `TASK-111`, `TASK-112`, `TASK-113`, `TASK-114` e `TASK-116` estão `READY`; `TASK-115` permanece `BLOCKED` até `TASK-114` ficar `DONE`.

## File map locked for this lot

| File | Responsibility |
| --- | --- |
| `frontend/src/shared/testing/renderIntegration.tsx` | criar QueryClient isolado e montar router/providers reais |
| `frontend/src/shared/testing/integrationFixtures.ts` | respostas HTTP canônicas, estritas e reutilizáveis |
| `frontend/src/features/auth/auth.integration.test.tsx` | login, returnTo, logout, 401 e resposta tardia |
| `frontend/src/features/customer/customer.integration.test.tsx` | cadastro, 409/422, GET/PUT de perfil |
| `frontend/src/features/catalog/catalog.integration.test.tsx` | paralelismo, URL/request, categoria, histórico e 404 |
| `frontend/src/features/cart/cart.integration.test.tsx` | criação/leitura, PATCH/DELETE, rollback, 404 e badge |
| `frontend/src/features/checkout/checkout.integration.test.tsx` | carrinho/perfil confirmados, POST único e efeitos pós-resposta |
| `frontend/src/features/orders/orders.integration.test.tsx` | filtros, detalhe, produtos únicos e cancelamento |

---

### Task 111: TASK-111 — autenticação integrada

**Eligibility:** `READY`; antes de escrever confirme `TASK-009`, `035`–`040`, `061`, `106`–`110` como `DONE`.

**Files:**
- Create: `frontend/src/shared/testing/renderIntegration.tsx`
- Create: `frontend/src/shared/testing/integrationFixtures.ts`
- Create: `frontend/src/features/auth/auth.integration.test.tsx`
- Modify after demonstrated RED only: `frontend/src/features/auth/context/UnauthorizedHandlerProvider.tsx`
- Modify after demonstrated RED only: `frontend/src/features/auth/mutations/useLogoutMutation.ts`

**Interfaces:**
- Consumes: `server.use(...RequestHandler[])`, `createQueryClient(): QueryClient`, `useAuthStore`, `useCartSessionStore`, `AppRouter`, `UnauthorizedHandlerProvider`, `AuthSessionInitializer`, `FeedbackProvider`.
- Produces: `renderIntegration(initialEntries: InitialEntry[]): { user: UserEvent; queryClient: QueryClient }`, `authSessionFixture`, `customerProfileResponseFixture`, `cartResponseFixture`, `catalogPageResponseFixture`, `productResponseFixture`, `orderResponseFixture`.

- [ ] **Step 1: workflow e exploração**

Registre `BASE_COMMIT=$(git rev-parse HEAD)`. O explorador deve listar as chaves privadas existentes, o formato Zustand persistido, a ordem de limpeza de logout/401, os query keys e a proteção contra callbacks tardios. Marque `IN_PROGRESS` somente após o relatório; não altere o backlog nesta etapa.

- [ ] **Step 2: criar helper compartilhado completo**

Crie `renderIntegration.tsx` com este conteúdo; não importe o singleton `queryClient`:

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, type InitialEntry } from 'react-router-dom'
import { UnauthorizedHandlerProvider } from '../../features/auth/context/UnauthorizedHandlerProvider'
import { AuthSessionInitializer } from '../../features/auth/store/AuthSessionInitializer'
import { createQueryClient } from '../query/queryClient'
import { FeedbackProvider } from '../../app/providers/FeedbackProvider'

export function renderIntegration(ui: ReactNode, initialEntries: InitialEntry[] = ['/']) {
  const queryClient = createQueryClient()
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <UnauthorizedHandlerProvider>
          <AuthSessionInitializer />
          <FeedbackProvider>{ui}</FeedbackProvider>
        </UnauthorizedHandlerProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
  return { user, queryClient }
}
```

Crie fixtures estritas em `integrationFixtures.ts`:

```ts
export const authSessionFixture = {
  status: true,
  data: { token: 'token-7', tipo: 'Bearer', expiraEm: '2026-07-17T12:00:00Z', usuarioId: 3, clienteId: 7, email: 'ana@example.com' },
} as const

export const customerProfileResponseFixture = { status: true, data: { clienteId: 7, cpf: '12345678901', nome: 'Ana Silva', dataNascimento: '1990-05-20', email: 'ana@example.com', endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, celular: { ddd: '11', numero: '999999999', whatsApp: true } } } as const
export const cartResponseFixture = { status: true, data: { clienteId: 7, carrinhoId: 70, dataCarrinho: '2026-07-16T10:00:00Z', items: [{ itemId: 701, produtoId: 42, quantidade: 2, valorUnitario: 199.9 }] } } as const
export const categoryResponseFixture = { status: true, data: [{ categoriaId: 5, titulo: 'Hardware', descricao: 'Componentes' }] } as const
export const catalogPageResponseFixture = { status: true, pagination: { pages: 2, size: 12, totalItems: 13, data: [{ produtoId: 42, titulo: 'Teclado Mecânico', thumb: null, preco: 199.9, estoque: 8, categoria: { categoriaId: 5, titulo: 'Hardware' } }] } } as const
export const productResponseFixture = { status: true, data: { produtoId: 42, titulo: 'Teclado Mecânico', descricao: 'ABNT2', modelo: 'TK42', foto: null, preco: 199.9, estoque: 8, categoria: { categoriaId: 5, titulo: 'Hardware' } } } as const
export const orderResponseFixture = { status: true, data: { pedidoId: 900, carrinhoId: 70, clienteId: 7, enderecoEntrega: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, dataPedido: '2026-07-16T10:30:00Z', formaPagamento: 'Pix', status: 'Criado', items: [{ itemId: 901, produtoId: 42, quantidade: 2, valorUnitario: 199.9 }] } } as const
```

- [ ] **Step 3: escrever RED de login e retorno seguro**

Em `auth.integration.test.tsx`, use `http`, `HttpResponse`, `delay`, `server`, `AppRouter`, stores e helper reais. `beforeEach` limpa storages, stores e arrays de requests. Implemente estes testes completos:

```tsx
it.each([
  [{ pathname: '/entrar', state: { returnTo: '/pedidos?pagina=2' } }, '/pedidos?pagina=2'],
  [{ pathname: '/entrar', state: { returnTo: 'https://evil.example/roubo' } }, '/'],
  [{ pathname: '/entrar', state: { returnTo: '//evil.example/roubo' } }, '/'],
])('persists login and accepts only internal returnTo', async (entry, expectedPath) => {
  let requestBody: unknown
  server.use(http.post('/api/v1/auth/login', async ({ request }) => {
    requestBody = await request.json()
    return HttpResponse.json(authSessionFixture)
  }))
  const { user } = renderIntegration(<><AppRouter /><LocationProbe /></>, [entry])
  await user.type(screen.getByRole('textbox', { name: 'E-mail' }), ' ana@example.com ')
  await user.type(screen.getByLabelText('Senha'), 'segredo123')
  await user.click(screen.getByRole('checkbox', { name: /manter/i }))
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
  expect(await screen.findByTestId('location')).toHaveTextContent(expectedPath)
  expect(requestBody).toEqual({ email: 'ana@example.com', senha: 'segredo123' })
  expect(localStorage.getItem('shop-api:auth')).toContain('token-7')
  expect(sessionStorage.getItem('shop-api:auth')).toBeNull()
})
```

`LocationProbe` deve retornar `<output data-testid="location">{location.pathname}{location.search}</output>`. Ajuste o nome literal do checkbox ao texto encontrado pelo explorador; registre-o no relatório, não use `getByTestId` para controles.

- [ ] **Step 4: RED de logout, 401 único e resposta tardia**

Monte uma rota protegida que executa `apiClient.request('/api/v1/cliente/7')` através de query real. Capture `logoutCalls` e `protectedCalls`. Os testes obrigatórios são:

```tsx
it.each([500, 401])('clears private state and cache when logout returns %s', async (status) => {
  server.use(http.post('/api/v1/auth/logout', () => new HttpResponse(null, { status })))
  seedAuthenticatedState()
  const { user, queryClient } = renderIntegration(<AppRouter />, ['/pedidos'])
  queryClient.getQueryCache().build(queryClient, {
    queryKey: ['private-probe'],
    queryFn: async () => ({ cpf: '12345678901' }),
    meta: { private: true },
  }).setData({ cpf: '12345678901' })
  await user.click(await screen.findByRole('button', { name: /sair/i }))
  expect(await screen.findByRole('heading', { name: 'Entrar na sua conta' })).toBeInTheDocument()
  expect(useAuthStore.getState().session).toBeNull()
  expect(useCartSessionStore.getState().getCartId(7)).toBeUndefined()
  expect(queryClient.getQueryData(['private-probe'])).toBeUndefined()
})
```

Para 401, o handler GET incrementa `protectedCalls`, espera uma `Promise` controlada e retorna `401`; um segundo GET protegido tardio retorna `200` somente após a limpeza. Afirme `protectedCalls === 2`, uma única navegação para `/entrar`, auth/cart/cache vazios e ausência do CPF tardio no cache após liberar ambas as respostas. Não use fake do service.

- [ ] **Step 5: confirmar RED e corrigir minimamente**

Run: `npm --prefix frontend test -- src/features/auth/auth.integration.test.tsx --reporter=verbose`

Expected RED: falha exclusivamente na limpeza única/late response ou no efeito de logout remoto identificado; requests e render devem funcionar via MSW. Se todos passarem, não modifique produto e registre cobertura existente. Sob RED, centralize uma operação idempotente de limpeza no provider/mutation e cancele/remova queries privadas antes de navegar; callbacks resolvidos depois da limpeza não podem reinserir cache.

- [ ] **Step 6: GREEN, gates, commits e revisão**

Run: `npm --prefix frontend test -- src/features/auth/auth.integration.test.tsx --reporter=verbose`; expected todos PASS e zero unhandled request. Run: `npm --prefix frontend run typecheck`; `npm --prefix frontend run lint`; expected exit `0`.

Commit teste/helper: `git add frontend/src/shared/testing/renderIntegration.tsx frontend/src/shared/testing/integrationFixtures.ts frontend/src/features/auth/auth.integration.test.tsx && git commit -m "test(TASK-111): integrar autenticação com MSW"`. Se houve RED de produto: `git add frontend/src/features/auth/context/UnauthorizedHandlerProvider.tsx frontend/src/features/auth/mutations/useLogoutMutation.ts && git commit -m "fix(TASK-111): impedir restauração de dados privados"`.

Gere `git diff $BASE_COMMIT..HEAD`, delegue revisão. Após aprovação e gates verdes, atualize TASK-111 para `DONE` com comandos, contagens e SHAs; commit administrativo separado. Não avance com finding `CRITICAL`/`IMPORTANT`.

---

### Task 112: TASK-112 — cadastro e perfil integrados

**Files:**
- Create: `frontend/src/features/customer/customer.integration.test.tsx`
- Modify after RED: `frontend/src/features/customer/pages/RegistrationPage.tsx`
- Modify after RED: `frontend/src/features/customer/pages/CustomerDataPage.tsx`
- Modify after RED: `frontend/src/features/customer/errors/customerProfileErrors.ts`

**Interfaces:** consumes `renderIntegration`, `customerProfileResponseFixture`, `AppRouter`, `customerProfileQueryKeys.detail(7)`, real registration/profile services and mutations.

- [ ] **Step 1: workflow/explorer**

Confirme elegibilidade, registre BASE, delegue exploração. O relatório fixa o shape de `errors` HTTP, texto do dialog de CPF, feedback de sucesso e query key. Só então `IN_PROGRESS`.

- [ ] **Step 2: cadastro 201/409/422 com body literal**

Crie `fillRegistration(user)` que preenche por labels: Nome ` Ana Silva `, CPF `123.456.789-01`, nascimento `1990-05-20`, email ` ana@example.com `, senha `segredo123`, CEP `01001-000`, logradouro ` Rua A `, número ` 10 `, bairro ` Centro `, cidade ` São Paulo `, UF `sp`, celular `(11) 99999-9999`, WhatsApp marcado. No handler POST capture JSON e responda por variável `registrationResponse`.

No 201 afirme body exato:

```ts
expect(body).toEqual({ senha: 'segredo123', cpf: '12345678901', nome: 'Ana Silva', dataNascimento: '1990-05-20', email: 'ana@example.com', endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, celular: { ddd: '11', numero: '999999999', whatsApp: true } })
expect(await screen.findByRole('heading', { name: 'Entrar na sua conta' })).toBeInTheDocument()
expect(screen.getByRole('status')).toHaveTextContent(/cadastro/i)
```

No 409 retorne `{ error:{ code:'CUSTOMER_CONFLICT', message:'CPF já cadastrado', details:[{ propertyName:'Cpf', message:'Já existe um cliente cadastrado com este CPF.' }] } }`, afirme a mensagem do detalhe e valores CPF/email preservados. No 422 retorne `{ error:{ code:'VALIDATION_ERROR', message:'Revise os dados', details:[{ propertyName:'Cpf', message:'CPF inválido' }, { propertyName:'Endereco.Cep', message:'CEP inválido' }, { propertyName:'CampoNovo', message:'Falha futura' }] } }`; afirme mensagens conhecidas junto aos campos, desconhecida no resumo e ausência de feedback/navegação de sucesso.

- [ ] **Step 3: GET/PUT perfil e cache confirmado**

Seed auth; GET `/api/v1/cliente/7` afirma Bearer e retorna fixture. Espere `Meus dados` e valores formatados. Altere CPF para `987.654.321-00`, nome para `Ana Atualizada`, clique Salvar, confirme no dialog semântico e capture PUT. Afirme body completo normalizado, não parcial. Antes de resolver PUT, `queryClient.getQueryData(customerProfileQueryKeys.detail(7))` ainda deve ser o perfil confirmado antigo; depois de `{status:true,data:{clienteId:7}}`, aguarde refetch GET e afirme UI/cache novos. PUT 422/500 não mostra sucesso e mantém cache confirmado.

- [ ] **Step 4: RED/GREEN e commits**

Run RED: `npm --prefix frontend test -- src/features/customer/customer.integration.test.tsx --reporter=verbose`. Expected: cada branch falha pelo comportamento específico ausente, nunca por handler não declarado. Corrija apenas mapping/feedback/reconciliação demonstrados.

Run GREEN focado; depois typecheck e lint, todos exit `0`. Commit `test(TASK-112): integrar cadastro e perfil com MSW`; eventual `fix(TASK-112): reconciliar erros e perfil confirmado`. Diff/review/fix-loop/DONE seguem o workflow global.

---

### Task 113: TASK-113 — catálogo integrado

**Files:**
- Create: `frontend/src/features/catalog/catalog.integration.test.tsx`
- Modify after RED: `frontend/src/features/catalog/pages/HomePage.tsx`
- Modify after RED: `frontend/src/features/catalog/queries/useCatalogQuery.ts`
- Modify after RED: `frontend/src/features/catalog/pages/ProductDetailPage.tsx`

**Interfaces:** consumes fixtures, `catalogQueryKeys`, `categoryQueryKeys.all`, `productQueryKeys.detail(42)`, `AppRouter` and real catalog services/queries.

- [ ] **Step 1: workflow e harness de requests**

Após BASE/explorer/IN_PROGRESS, declare arrays `started: string[]`, `catalogUrls: URL[]`, `categoryUrls: URL[]`; os handlers GET de categorias e produtos chamam `started.push(...)`, aguardam resolvers independentes e retornam fixtures. Render `/`, espere ambos em `started` antes de liberar qualquer resolver e então afirme cards/categorias: isso prova início paralelo.

- [ ] **Step 2: URL, request, categoria, metadata e histórico**

Teste busca digitando no campo semântico e submetendo: location `/?searchword=teclado` e GET `/api/v1/produto?page=1&size=12&searchword=teclado`. Navegue página 2 e afirme location `/?searchword=teclado&page=2` e request `page=2`; resposta `pages:2` não renderiza página 3.

Selecione categoria 5 e afirme uma chamada exclusiva a `/api/v1/produto/categoria/5`, zero chamada adicional a `/api/v1/produto` para esse filtro. Use botão Back de um `HistoryProbe` e afirme restauração do campo, página e query cache correspondente.

- [ ] **Step 3: canonicalização e produto 404 sem retry**

Renderize `/?page=abc&categoriaId=-2&searchword=%20%20`; espere location `/`, request de página 1 sem filtro inválido e remoção dos parâmetros inválidos. Para `/produtos/42`, handler retorna 404 e incrementa contador; afirme heading `Produto não encontrado`, `count === 1`, ausência de retry após `await new Promise(resolve => setTimeout(resolve, 50))`, e cache detail em error sem produto stale.

- [ ] **Step 4: RED/GREEN/gates**

Run: `npm --prefix frontend test -- src/features/catalog/catalog.integration.test.tsx --reporter=verbose`; expected RED somente em wiring real ausente. Corrija minimamente. GREEN + typecheck + lint exit `0`. Commits: `test(TASK-113): integrar catálogo com MSW`; eventual `fix(TASK-113): canonicalizar navegação do catálogo`. Execute diff/review/fix-loop e registre DONE.

---

### Task 114: TASK-114 — carrinho integrado

**Files:**
- Create: `frontend/src/features/cart/cart.integration.test.tsx`
- Modify after RED: `frontend/src/features/cart/hooks/useAddProductToCart.ts`
- Modify after RED: `frontend/src/features/cart/mutations/useUpdateCartItemMutation.ts`
- Modify after RED: `frontend/src/features/cart/mutations/useDeleteCartItemMutation.ts`
- Modify after RED: `frontend/src/features/cart/queries/useCartQuery.ts`

**Interfaces:** consumes `cartQueryKeys.detail(7,70)`, `cartProductsQueryKeys.list([42])`, stores, real pages/hooks/services, fixtures. Produces TASK-114 `DONE`, prerequisite for TASK-115.

- [ ] **Step 1: workflow e request ledger**

BASE/explorer/IN_PROGRESS. Crie ledger `{ method, url, body }[]`; handlers literais: POST `/api/v1/carrinho/criar`, POST `/api/v1/carrinho/items`, GET `/api/v1/carrinho/70`, GET `/api/v1/produto/42`, PATCH `/api/v1/carrinho/items/701`, DELETE `/api/v1/carrinho/items/701`. Todos validam Bearer.

- [ ] **Step 2: criar sem body, adicionar e ler existente**

Estado sem vínculo: render produto 42 autenticado, clique Adicionar. Afirme ordem `[POST criar, POST item, GET carrinho]`, body da criação `undefined`/request sem `content-length`, body item `{ produtoId:42, quantidade:1, valorUnitario:199.9 }`, vínculo 7→70, badge 1 e cache igual à resposta GET confirmada. Estado com vínculo: abrir `/carrinho`, afirmar zero POST criar e um GET carrinho.

- [ ] **Step 3: PATCH/DELETE e convergência**

No carrinho, altere `Quantidade de Teclado Mecânico` para 3. PATCH exato `{ quantidade:3 }`, uma chamada; libere resposta e refetch retornando quantidade 3; afirme input, subtotal, total, badge e `cartQueryKeys.detail(7,70)` convergentes. Clique Remover, confirme no dialog, DELETE uma vez, responda e refetch vazio; afirme lista vazia e badge zero somente depois da confirmação.

- [ ] **Step 4: rollback alvo, concorrência e 404**

Fixture com itens 701/produto42 e 702/produto43. Dispare PATCH 701 otimista; enquanto pendente altere cache confirmado do 702 para quantidade 4; retorne 500. Afirme 701 restaurado para 2 e 702 preservado em 4. Repita DELETE 701 com 500 e mesma assertion. GET carrinho 404 deve chamar `removeCartId(7)`, remover apenas query detail 7/70 e manter vínculo/cache de cliente 8.

- [ ] **Step 5: RED/GREEN/review**

Run RED focado; expected falha específica em rollback/404/convergência. Correção mínima nos arquivos listados. Run GREEN, typecheck, lint. Commits `test(TASK-114): integrar ciclo do carrinho com MSW` e eventual `fix(TASK-114): preservar estado confirmado do carrinho`. Após review aprovada, marque DONE; só então uma operação administrativa pode mudar TASK-115 de BLOCKED para READY.

---

### Task 115: TASK-115 — checkout integrado

**Eligibility:** manter `BLOCKED` até TASK-114 `DONE`; não registrar BASE nem escrever antes da mudança formal para `READY`.

**Files:**
- Create: `frontend/src/features/checkout/checkout.integration.test.tsx`
- Modify after RED: `frontend/src/features/checkout/mutations/useCreateOrderMutation.ts`
- Modify after RED: `frontend/src/features/checkout/pages/CheckoutPage.tsx`

**Interfaces:** consumes confirmed cart/profile caches, `orderQueryKeys.all`, `orderConfirmationKey(7,900)`, cart store and real checkout guard/page/mutation.

- [ ] **Step 1: desbloqueio e workflow**

Confirme backlog TASK-114 DONE e TASK-115 READY, depois BASE/explorer/IN_PROGRESS. Explorer fixa labels das opções de pagamento, query keys e shape 409/422.

- [ ] **Step 2: carga confirmada e contrato POST estrito**

Handlers GET cart/profile retornam fixtures. POST `/api/v1/pedido` captura body e aguarda resolver. Render `/checkout`, espere heading e endereço, selecione Pix e clique finalizar duas vezes. Afirme POST count 1 e:

```ts
expect(body).toEqual({ enderecoEntrega: { logradouro:'Rua A', numero:'10', complemento:null, cep:'01001000', bairro:'Centro', cidade:'São Paulo', uf:'SP' }, formaPagamento:'Pix', dataPedido: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/), items:[{ itemId:701, produtoId:42, quantidade:2, valorUnitario:199.9 }] })
expect(body).not.toHaveProperty('clienteId')
expect(body).not.toHaveProperty('carrinhoId')
```

Altere otimisticamente qualquer cache local de item antes do clique; afirme que body usa `cartResponseFixture` confirmado, não estado visual não confirmado.

- [ ] **Step 3: 201, 409 e 422**

201 retorna pedido 900: afirme vínculo 7 removido, cart cache removido, `orderQueryKeys.all` invalidada, confirmação cacheada e location `/pedido-confirmado/900` com heading `Pedido criado`. Em `it.each([409,422])`, retorne mensagem de domínio; afirme location `/checkout`, formulário/endereço/pagamento preservados, vínculo/cache do carrinho intactos, sem confirmation cache e sem invalidação de pedidos.

- [ ] **Step 4: RED/GREEN/review**

Run focused RED, correção mínima, focused GREEN, typecheck, lint. Commits `test(TASK-115): integrar criação de pedido com MSW` e eventual `fix(TASK-115): tornar checkout idempotente`. Diff/review/fix-loop/DONE.

---

### Task 116: TASK-116 — pedidos integrados

**Files:**
- Create: `frontend/src/features/orders/orders.integration.test.tsx`
- Modify after RED: `frontend/src/features/orders/queries/useOrdersQuery.ts`
- Modify after RED: `frontend/src/features/orders/queries/useOrderProductsQuery.ts`
- Modify after RED: `frontend/src/features/orders/mutations/useCancelOrderMutation.ts`

**Interfaces:** consumes `orderQueryKeys.detail(7,900)`, `orderQueryKeys.lists(7)`, auth profile CPF, real orders routes/queries/mutation, fixtures.

- [ ] **Step 1: workflow e fixtures locais**

BASE/explorer/IN_PROGRESS. Defina orders page com dois items do produto 42 para provar deduplicação. Ledger cobre GET `/api/v1/pedido`, GET `/api/v1/pedido/900`, GET `/api/v1/produto/42`, PATCH `/api/v1/pedido/900`.

- [ ] **Step 2: lista e filtros exatos**

Render `/pedidos?dataInicio=2026-07-01&dataFim=2026-07-15&page=2` autenticado; GET profile fornece CPF. Afirme request com `cpf=12345678901`, `dataInicio` igual ao ISO do início civil local de 2026-07-01, `dataFim` igual ao ISO do fim civil local de 2026-07-15, `page=2`, `size` literal de `useOrdersQuery.ts`, Bearer e card Pedido 900. Alterar filtro deve atualizar URL com `dataInicio`, `dataFim` e `page` e emitir request correspondente; metadata limita paginação.

- [ ] **Step 3: detalhe captura IDs e produto único**

Render `/pedidos/900`; handler detail afirma path 900 e resposta cliente 7. Afirme somente um GET `/api/v1/produto/42` apesar de dois items, títulos e totais visíveis, e caches detail/produtos preenchidos sob keys reais.

- [ ] **Step 4: PATCH exclusivo, 422 e sucesso**

Abra dialog Cancelar. Capture body e afirme igualdade estrita `{ status:'Cancelado' }`, sem outras propriedades. No 422, anuncie mensagem em alert/status, mantenha `Criado` durante request, invalide/recarregue detail uma vez e preserve resposta confirmada `Criado`. No 200 com payload Cancelado, afirme detail reconciliado e invalidação `orderQueryKeys.detail(7,900)` + `orderQueryKeys.lists(7)`, sem tocar listas do cliente 8.

- [ ] **Step 5: RED/GREEN e gate do lote**

Run: `npm --prefix frontend test -- src/features/orders/orders.integration.test.tsx --reporter=verbose`; corrija só RED demonstrado. GREEN + typecheck + lint.

Commits `test(TASK-116): integrar pedidos com MSW` e eventual `fix(TASK-116): reconciliar cancelamento de pedido`. Diff/review/fix-loop/DONE.

Quando TASK-111–116 estiverem DONE: `npm --prefix frontend test -- src/features/auth/auth.integration.test.tsx src/features/customer/customer.integration.test.tsx src/features/catalog/catalog.integration.test.tsx src/features/cart/cart.integration.test.tsx src/features/checkout/checkout.integration.test.tsx src/features/orders/orders.integration.test.tsx --reporter=verbose`; depois `npm --prefix frontend run typecheck`, `npm --prefix frontend run lint`, `npm --prefix frontend test`. Todos exit `0`, sem unhandled request/rejection. Só após revisão do lote, libere TASK-117 pela condição registrada no backlog.

## Self-review

- Spec coverage: TASK-111 cobre persistência/returnTo/logout/401/late response; 112 cobre 201/409/422/GET/PUT; 113 cobre paralelismo/URL/categoria/metadata/histórico/canonicalização/404; 114 cobre POST/GET/PATCH/DELETE/rollback/404/convergência; 115 cobre contrato/duplicidade/201/409/422; 116 cobre filtros/detalhe/deduplicação/PATCH/422/sucesso.
- Placeholder scan: nenhum marcador pendente, glob de edição ou decisão aberta; cada alteração de produto depende de RED explícito.
- Type consistency: endpoints, bodies e nomes de fixtures correspondem aos contracts/services inspecionados; helper retorna `UserEvent` e `QueryClient`; IDs 7/42/70/701/900 são estáveis em todo o lote.
- Isolation: cada render cria QueryClient; setup global reseta handlers e preserva `onUnhandledRequest: 'error'`; beforeEach de cada spec limpa stores/storage/ledgers.
- Workflow: toda task contém elegibilidade, BASE/explorer, implementação, RED/GREEN, commits, diff, review, fix-loop e DONE; TASK-115 não pode começar antes de TASK-114.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-16-fase-8-lote-2-integracoes-msw.md`. Execute com `superpowers:subagent-driven-development`, uma task por vez, com writers sequenciais e dupla aprovação exigida por `AGENTS.md`.
