# TASK-118 — Visitante, Login e Adição Explícita ao Carrinho Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar em Chromium que um visitante escolhe a quantidade, é enviado ao login com o retorno interno exato, volta automaticamente ao mesmo produto sem qualquer POST de carrinho e somente adiciona o item após um novo clique explícito.

**Architecture:** estender o backend em memória criado pela `TASK-117`, preservando uma única interceptação estrita de `http://localhost:5228/api/v1/**`, isolamento por contexto e contadores exatos. A nova spec usa apenas seletores semânticos, observa os contadores antes e durante o login e valida os contratos reais de produto, criação de carrinho, adição de item e reconciliação.

**Tech Stack:** React 19, TypeScript 5.7, Zustand 5, TanStack Query 5, Playwright 1.61, Vite 6.

## Global Constraints

- Escopo exclusivo: frontend E2E e documentação da `TASK-118`; não alterar código de produto, backend ASP.NET ou backlog durante a implementação.
- Registrar `BASE_COMMIT=$(git rev-parse HEAD)` antes de qualquer alteração.
- O agente principal apenas orquestra: explorador, implementador e revisor são agentes distintos.
- Não executar dois agentes com permissão de escrita simultaneamente no mesmo checkout.
- Reutilizar `frontend/e2e/fixtures.ts` e `frontend/e2e/support/authApi.ts`; não criar uma segunda camada de interceptação.
- Cada contexto inicia sem cookies, `localStorage`, `sessionStorage` ou estado do backend em memória e é limpo no `finally` da fixture.
- Requests não declarados continuam abortando e causando falha.
- Usar somente `getByRole`, `getByLabel` e assertions de URL/storage; não usar CSS, XPath, `data-testid`, texto posicional ou `waitForTimeout`.
- A rota de retorno esperada é literalmente `/produtos/42?origem=task-118#comprar`.
- A quantidade esperada no POST é `3`; o preço esperado é `3499.9`.
- Antes e durante o login, `cartCreate`, `cartAdd` e `cartGet` devem permanecer em zero.
- O retorno após login não pode repetir automaticamente a intenção anterior; um segundo clique em `Adicionar ao carrinho` é obrigatório.
- Commits de implementação: `test(TASK-118): estender backend E2E para carrinho` e `test(TASK-118): cobrir visitante antes de adicionar produto`.
- Gate mínimo: spec isolada, suíte Chromium completa, repetição dupla, typecheck, lint, build e `git diff --check`.

---

## File Map

- Modify: `frontend/e2e/support/authApi.ts` — acrescentar dados determinísticos de produto/carrinho, seed explícito de cliente, handlers estritos e leitura instantânea dos contadores.
- Create: `frontend/e2e/guest-cart.spec.ts` — jornada única da `TASK-118`, incluindo checkpoints de zero POST antes/durante login e adição após novo clique.
- Modify: `docs/superpowers/plans/2026-07-15-fase-8-testes-hardening.md` — substituir a instrução de criação futura pelo link físico deste plano.
- Do not modify: `frontend/src/features/catalog/pages/ProductDetailPage.tsx` — o comportamento já existe e deve ser apenas exercitado.
- Do not modify: `frontend/src/features/auth/pages/LoginPage.tsx` — `getInternalReturnTo(location.state)` já realiza o retorno seguro.
- Do not modify: `frontend/src/features/cart/**` — os contratos e mutations reais são parte da jornada, não doubles.

## Inspected Production Interfaces

```ts
// ProductDetailPage.tsx
const returnTo = `${location.pathname}${location.search}${location.hash}`
navigate('/entrar', { replace: true, state: { returnTo } })
```

```ts
// LoginPage.tsx
setSession(session, values.manterConectado ? 'local' : 'session')
navigate(getInternalReturnTo(location.state), { replace: true })
```

```ts
// Requests reais exercitados depois do segundo clique
GET  /api/v1/produto/42
POST /api/v1/carrinho/criar                  // body vazio
POST /api/v1/carrinho/items                  // { produtoId, quantidade, valorUnitario }
GET  /api/v1/carrinho/:carrinhoId            // reconciliação confirmada
```

---

### Task 1: Registrar a linha de base e confirmar elegibilidade

**Files:**
- Read: `docs/frontend-tasks-v2.md`
- Read: `docs/superpowers/specs/2026-07-15-fase-8-testes-hardening-design.md`
- Read: `frontend/e2e/support/authApi.ts`
- Read: `frontend/e2e/fixtures.ts`

**Interfaces:**
- Consumes: `TASK-117` em `DONE`, `TASK-118` em `READY`, checkout limpo.
- Produces: `BASE_COMMIT` imutável para diff e revisão.

- [ ] **Step 1: Confirmar branch, limpeza e elegibilidade**

Run:

```bash
git status --short --branch
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Expected: branch `codex/phase-8-hardening`, nenhum arquivo pendente e SHA registrado como `BASE_COMMIT`.

- [ ] **Step 2: Confirmar dependências no backlog**

Run:

```bash
rg -n -A 13 "TASK-117|TASK-118" docs/frontend-tasks-v2.md
```

Expected: `TASK-117` está `DONE`; `TASK-118` está `READY`; todos os IDs de `Depends on` da `TASK-118` estão `DONE`.

---

### Task 2: Escrever a jornada contra a interface ainda ausente

**Files:**
- Create: `frontend/e2e/guest-cart.spec.ts`
- Test: `frontend/e2e/guest-cart.spec.ts`

**Interfaces:**
- Consumes: `test` e `expect` de `./fixtures`.
- Produces: exigência tipada por `authApi.seedCustomer()`, `authApi.requestCounts` e `authApi.data.product`.

- [ ] **Step 1: Criar a spec completa**

Create `frontend/e2e/guest-cart.spec.ts`:

```ts
import { expect, test } from './fixtures'

test('exige login e um novo clique antes de adicionar o produto ao carrinho', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  const returnTo = `/produtos/${data.product.id}?origem=task-118#comprar`

  authApi.seedCustomer()
  authApi.expectRequestCounts({
    login: 1,
    categories: 1,
    product: 2,
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 1,
  })

  await page.goto(returnTo)
  await expect(
    page.getByRole('heading', { level: 1, name: data.product.title }),
  ).toBeVisible()

  const quantity = page.getByLabel('Quantidade')
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(quantity).toHaveValue('3')

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()

  await expect(page).toHaveURL('/entrar')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Entrar na sua conta' }),
  ).toBeVisible()
  expect(authApi.requestCounts()).toMatchObject({
    cartCreate: 0,
    cartAdd: 0,
    cartGet: 0,
  })

  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page).toHaveURL(returnTo)
  await expect(
    page.getByRole('heading', { level: 1, name: data.product.title }),
  ).toBeVisible()
  await expect(page.getByLabel('Quantidade')).toHaveValue('1')
  expect(authApi.requestCounts()).toMatchObject({
    login: 1,
    cartCreate: 0,
    cartAdd: 0,
    cartGet: 0,
  })

  await expect
    .poll(async () =>
      page.evaluate(() => ({
        local: localStorage.getItem('shop-api:auth'),
        session: sessionStorage.getItem('shop-api:auth'),
        cart: localStorage.getItem('shop-api:cart-session'),
      })),
    )
    .toEqual({
      local: null,
      session: expect.stringContaining(data.email),
      cart: null,
    })

  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()

  await expect(
    page.getByRole('status').filter({
      hasText: 'Produto adicionado ao carrinho',
    }),
  ).toBeVisible()
  await expect
    .poll(() => authApi.requestCounts())
    .toMatchObject({
      cartCreate: 1,
      cartAdd: 1,
      cartGet: 1,
    })
})
```

- [ ] **Step 2: Executar o RED de tipagem**

Run:

```bash
npm --prefix frontend run typecheck
```

Expected: FAIL somente porque `AuthApi` ainda não possui `seedCustomer`, `requestCounts` e `data.product`.

---

### Task 3: Estender o backend em memória com produto e carrinho estritos

**Files:**
- Modify: `frontend/e2e/support/authApi.ts`
- Test: `frontend/e2e/guest-cart.spec.ts`

**Interfaces:**
- Consumes: `BrowserContext`, `Route`, `TestInfo` e a interceptação única já instalada.
- Produces:

```ts
type RequestName =
  | 'register' | 'login' | 'categories' | 'profile' | 'logout'
  | 'product' | 'cartCreate' | 'cartAdd' | 'cartGet'

type ProductData = {
  id: number
  title: string
  description: string
  model: string
  price: number
  stock: number
  categoryId: number
  categoryTitle: string
}

type RequestCounts = Readonly<Record<RequestName, number>>

type AuthApi = {
  data: RegistrationData & { product: ProductData; cartId: number; cartItemId: number }
  expectRequestCounts(expected: ExpectedRequestCounts): void
  requestCounts(): RequestCounts
  seedCustomer(): void
  assertRequestCounts(): void
  reset(): void
}
```

- [ ] **Step 1: Ampliar os tipos e dados determinísticos**

In `frontend/e2e/support/authApi.ts`, replace `RequestName`, extend `RegistrationData`, and initialize the new data:

```ts
export type RequestName =
  | 'register'
  | 'login'
  | 'categories'
  | 'profile'
  | 'logout'
  | 'product'
  | 'cartCreate'
  | 'cartAdd'
  | 'cartGet'

export type RequestCounts = Readonly<Record<RequestName, number>>

export type ProductData = {
  id: number
  title: string
  description: string
  model: string
  price: number
  stock: number
  categoryId: number
  categoryTitle: string
}
```

Add to `RegistrationData`:

```ts
product: ProductData
cartId: number
cartItemId: number
```

Add to the returned value of `buildRegistrationData`:

```ts
product: {
  id: 42,
  title: `Notebook TASK-118 ${suffix}`,
  description: 'Produto determinístico para a jornada visitante.',
  model: 'TASK-118',
  price: 3499.9,
  stock: 8,
  categoryId: 118,
  categoryTitle: 'Informática',
},
cartId: 30_000 + seed,
cartItemId: 40_000 + seed,
```

Replace the `counts` initializer with:

```ts
const counts: Record<RequestName, number> = {
  register: 0,
  login: 0,
  categories: 0,
  profile: 0,
  logout: 0,
  product: 0,
  cartCreate: 0,
  cartAdd: 0,
  cartGet: 0,
}
```

- [ ] **Step 2: Criar o seed explícito sem fabricar uma chamada de cadastro**

Inside `installAuthApi`, before the route handler, add:

```ts
const seededCustomer = (): RegistrationRequest => ({
  senha: data.password,
  cpf: data.cpf,
  nome: data.name,
  dataNascimento: data.birthDate,
  email: data.email,
  endereco: {
    logradouro: data.street,
    numero: data.number,
    complemento: null,
    cep: data.postalCode,
    bairro: data.district,
    cidade: data.city,
    uf: data.state,
  },
  celular: {
    ddd: data.areaCode,
    numero: data.phone,
    whatsApp: true,
  },
})
```

This method must only prepare backend state; it must not increment `register`.

- [ ] **Step 3: Impedir requests de carrinho antes ou durante o login no próprio handler**

In the existing `/api/v1/auth/login` branch, insert this block after `requireMethod(route, 'POST')` and before `increment('login')`:

```ts
for (const name of ['cartCreate', 'cartAdd', 'cartGet'] as const) {
  if (counts[name] !== 0) {
    throw new Error(
      `Cart request ${name} occurred before or during login`,
    )
  }
}
```

This backend invariant complements the browser checkpoints and fails even if navigation becomes too fast to observe an intermediate UI state.

- [ ] **Step 4: Adicionar os handlers estritos antes do fallback inesperado**

Insert before the `await route.abort('blockedbyclient')` fallback:

```ts
if (url.pathname === `/api/v1/produto/${data.product.id}`) {
  requireMethod(route, 'GET')
  increment('product')
  await json(route, {
    status: true,
    data: {
      produtoId: data.product.id,
      titulo: data.product.title,
      descricao: data.product.description,
      modelo: data.product.model,
      foto: null,
      preco: data.product.price,
      estoque: data.product.stock,
      categoria: {
        categoriaId: data.product.categoryId,
        titulo: data.product.categoryTitle,
      },
    },
  })
  return
}

if (url.pathname === '/api/v1/carrinho/criar') {
  requireMethod(route, 'POST')
  requireAuthorization(route)
  increment('cartCreate')
  if (request.postData() !== null) {
    throw new Error(`Expected empty cart creation body, received ${request.postData()}`)
  }
  await json(route, {
    status: true,
    data: {
      carrinhoId: data.cartId,
      dataCarrinho: '2026-07-16T12:00:00-03:00',
    },
  }, 201)
  return
}

if (url.pathname === '/api/v1/carrinho/items') {
  requireMethod(route, 'POST')
  requireAuthorization(route)
  increment('cartAdd')
  const body = readJson<{
    produtoId: number
    quantidade: number
    valorUnitario: number
  }>(route)
  const expectedBody = {
    produtoId: data.product.id,
    quantidade: 3,
    valorUnitario: data.product.price,
  }
  if (JSON.stringify(body) !== JSON.stringify(expectedBody)) {
    throw new Error(`Unexpected cart item body: ${JSON.stringify(body)}`)
  }
  await json(route, {
    status: true,
    data: { itemId: data.cartItemId },
  }, 201)
  return
}

if (url.pathname === `/api/v1/carrinho/${data.cartId}`) {
  requireMethod(route, 'GET')
  requireAuthorization(route)
  increment('cartGet')
  await json(route, {
    status: true,
    data: {
      clienteId: data.customerId,
      carrinhoId: data.cartId,
      dataCarrinho: '2026-07-16T12:00:00-03:00',
      items: [{
        itemId: data.cartItemId,
        produtoId: data.product.id,
        quantidade: 3,
        valorUnitario: data.product.price,
      }],
    },
  })
  return
}
```

- [ ] **Step 5: Expor seed e snapshot defensivo dos contadores**

Extend `AuthApi`:

```ts
requestCounts(): RequestCounts
seedCustomer(): void
```

Add to the returned object:

```ts
requestCounts() {
  return { ...counts }
},
seedCustomer() {
  registeredCustomer = seededCustomer()
},
```

Keep `reset()` clearing `registeredCustomer`, expectations and every key of `counts`.

- [ ] **Step 6: Executar o GREEN de tipagem e a spec**

Run:

```bash
npm --prefix frontend run typecheck
npm --prefix frontend run test:e2e -- guest-cart.spec.ts --project=chromium
```

Expected: typecheck PASS; `guest-cart.spec.ts` 1/1 PASS; contagens finais `login=1`, `categories=1`, `product=2`, `cartCreate=1`, `cartAdd=1`, `cartGet=1`; todas as demais iguais a zero.

- [ ] **Step 7: Commitar a extensão compartilhada**

Run:

```bash
git add frontend/e2e/support/authApi.ts
git commit -m "test(TASK-118): estender backend E2E para carrinho"
```

Expected: commit contém somente o backend Playwright compartilhado.

---

### Task 4: Fixar os checkpoints comportamentais da jornada

**Files:**
- Create: `frontend/e2e/guest-cart.spec.ts`
- Test: `frontend/e2e/guest-cart.spec.ts`

**Interfaces:**
- Consumes: `AuthApi.seedCustomer`, `AuthApi.requestCounts`, `data.product`, handlers estritos.
- Produces: evidência E2E do redirecionamento, retorno, ausência de replay e clique explícito.

- [ ] **Step 1: Confirmar que a spec não usa seletores frágeis nem espera temporal**

Run:

```bash
rg -n "locator\\(|data-testid|waitForTimeout|nth\\(|\\.first\\(|\\.last\\(|xpath|css=" frontend/e2e/guest-cart.spec.ts
```

Expected: nenhuma ocorrência.

- [ ] **Step 2: Executar a spec isolada duas vezes**

Run:

```bash
npm --prefix frontend run test:e2e -- guest-cart.spec.ts --project=chromium --repeat-each=2
```

Expected: 2/2 PASS, independentemente do worker e do `repeatEachIndex`.

- [ ] **Step 3: Commitar a jornada**

Run:

```bash
git add frontend/e2e/guest-cart.spec.ts
git commit -m "test(TASK-118): cobrir visitante antes de adicionar produto"
```

Expected: commit contém somente a spec da `TASK-118`.

---

### Task 5: Executar gates e preparar revisão

**Files:**
- Verify: `frontend/e2e/support/authApi.ts`
- Verify: `frontend/e2e/guest-cart.spec.ts`

**Interfaces:**
- Consumes: `BASE_COMMIT` e os dois commits da implementação.
- Produces: diff revisável e evidência completa de qualidade.

- [ ] **Step 1: Executar a suíte Chromium completa**

Run:

```bash
npm --prefix frontend run test:e2e -- --project=chromium
```

Expected: todas as specs, incluindo `smoke.spec.ts`, `auth.spec.ts` e `guest-cart.spec.ts`, PASS.

- [ ] **Step 2: Executar a suíte completa com repetição**

Run:

```bash
npm --prefix frontend run test:e2e -- --project=chromium --repeat-each=2
```

Expected: todas as jornadas PASS duas vezes, sem dependência de ordem, worker ou storage anterior.

- [ ] **Step 3: Executar gates estáticos e build**

Run:

```bash
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build
git diff --check "$BASE_COMMIT"..HEAD
```

Expected: todos retornam exit code `0`. O warning preexistente de chunk acima de 500 kB pode ser registrado, mas não autoriza falha.

- [ ] **Step 4: Gerar o pacote de revisão**

Run:

```bash
git log --oneline "$BASE_COMMIT"..HEAD
git diff --stat "$BASE_COMMIT"..HEAD
git diff "$BASE_COMMIT"..HEAD -- frontend/e2e/support/authApi.ts frontend/e2e/guest-cart.spec.ts
```

Expected: somente a extensão E2E compartilhada e a nova jornada, com commits claramente identificados por `TASK-118`.

- [ ] **Step 5: Delegar revisão independente**

O revisor deve verificar:

1. URL de retorno contém pathname, query e hash exatos.
2. A quantidade escolhida como visitante não é reaplicada automaticamente após login.
3. `cartCreate`, `cartAdd` e `cartGet` são zero após o primeiro clique e após o login.
4. O segundo clique usa quantidade `3` e preço confirmado `3499.9`.
5. O backend exige token, método e body estritos.
6. `requestCounts()` retorna cópia e não permite mutar o ledger interno.
7. `reset()` e o `finally` da fixture preservam isolamento após falha.
8. Nenhum código de produto ou backlog foi alterado.

Expected: nenhum finding `CRITICAL` ou `IMPORTANT`. Se houver, devolver ao mesmo implementador, repetir todos os gates afetados e reenviar ao revisor.

---

### Task 6: Handoff para conclusão pelo orquestrador

**Files:**
- Later modify, only after approvals: `docs/frontend-tasks-v2.md`

**Interfaces:**
- Consumes: implementação aprovada, testes verdes e SHAs reais.
- Produces: autorização para o orquestrador marcar a task como concluída.

- [ ] **Step 1: Entregar evidências sem editar o backlog**

Reportar ao agente principal:

- `BASE_COMMIT`;
- SHAs dos commits `test(TASK-118): ...`;
- spec isolada e repetição dupla;
- suíte Chromium e repetição dupla;
- typecheck, lint, build e diff-check;
- contagens finais;
- findings pendentes ou declaração explícita de nenhum finding.

Expected: este agente de implementação não altera `docs/frontend-tasks-v2.md`.

- [ ] **Step 2: Permitir atualização final somente após as duas aprovações**

O orquestrador, após aprovação do implementador e do revisor, deve marcar apenas `TASK-118` como `DONE`, registrar evidências/commits reais e atualizar os status desbloqueados de acordo com as dependências.

Expected: nenhuma task posterior é marcada `DONE` por antecipação.

---

## Self-Review

- **Spec coverage:** quantidade como visitante, retorno interno exato, login, retorno automático ao produto, zero POST antes/durante login, ausência de replay, novo clique, contratos estritos, contadores, storage e repetição estão mapeados.
- **Placeholder scan:** todas as ações possuem código, comando e resultado esperado completos.
- **Type consistency:** `RequestName`, `RequestCounts`, `ProductData`, `AuthApi`, paths, payloads e respostas correspondem aos contratos inspecionados.
- **Scope:** nenhum arquivo de produto, backend ASP.NET ou backlog faz parte dos commits de implementação.
