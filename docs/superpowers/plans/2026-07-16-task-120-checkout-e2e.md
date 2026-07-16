# TASK-120 — Carrinho, Checkout e Confirmação E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar em Chromium que um cliente autenticado leva um carrinho confirmado e não vazio ao checkout, altera o endereço somente no pedido, escolhe pagamento, cria exatamente um pedido, vê a confirmação retornada pelo servidor e termina sem vínculo ou itens de carrinho.

**Architecture:** estender o backend Playwright determinístico da `TASK-117`/`TASK-119` com um endpoint estrito de criação de pedido e dados determinísticos de confirmação. A jornada monta o carrinho exclusivamente pela UI, navega ao checkout pelo link real do resumo, usa o perfil servido pelo helper, valida o POST no interceptador e comprova consumo do carrinho reabrindo a rota protegida de carrinho.

**Tech Stack:** React 19, TypeScript 5.7, Zustand 5, TanStack Query 5, React Hook Form 7, Zod 4, Playwright 1.61, Vite 6.

## Global Constraints

- Escopo exclusivo: frontend E2E e documentação da `TASK-120`; não alterar código de produto nem backend ASP.NET.
- Registrar `BASE_COMMIT=$(git rev-parse HEAD)` antes de qualquer alteração.
- O agente principal apenas orquestra: explorador, implementador e revisor são agentes distintos.
- Não executar dois agentes com permissão de escrita simultaneamente no mesmo checkout.
- Reutilizar `frontend/e2e/fixtures.ts` e `frontend/e2e/support/authApi.ts`; não criar nova fixture, interceptador ou sessão injetada em storage.
- Autenticar pela UI com `authApi.seedCustomer()` e montar o carrinho pela UI; não chamar serviços diretamente nem semear `localStorage`.
- Requests não declarados, rota ou método incorreto, token ausente, body extra/ausente ou ordem de domínio inválida devem falhar.
- Usar seletores semânticos; não usar CSS, XPath, `data-testid`, `nth`, `first`, `last` ou `waitForTimeout`.
- O item confirmado tem quantidade `3`, preço unitário `3499.9` e total `10499.7`.
- Editar `Logradouro` de `data.street` para `${data.street} — somente pedido`; o perfil em memória permanece com `data.street`.
- Selecionar `Cartão`, cujo valor transportado exato é `Cartao`.
- O body do pedido contém somente `enderecoEntrega`, `formaPagamento`, `dataPedido` e `items`; nunca contém `clienteId` ou `carrinhoId`.
- `dataPedido` deve ser string ISO 8601 válida com offset e deve ser devolvida pelo servidor como `dataPedido` da confirmação.
- O POST `/api/v1/pedido` ocorre exatamente uma vez, mesmo após dois cliques deliberados em “Confirmar pedido”.
- Contagens brutas esperadas: `login=1`, `categories=4`, `product=2`, `cartCreate=1`, `cartAdd=1`, `cartGet=2`, `profile=1`, `orderCreate=1`; todas as demais são zero.
- As quatro categorias correspondem às cargas completas de `/carrinho` visitante, `/carrinho` autenticado, produto e `/carrinho` após confirmação. As duas leituras de carrinho correspondem ao vínculo criado e à reconciliação do item adicionado; checkout reutiliza o cache confirmado.
- O consumo do carrinho deve ser provado pela UI: badge positivo ausente e `/carrinho` exibe “Seu carrinho está vazio” sem novo GET do carrinho antigo.
- Commits de implementação permitidos: `test(TASK-120): Estender backend E2E para pedidos` e `test(TASK-120): Cobrir jornada E2E do checkout`.
- Gate mínimo: spec isolada, repetição dupla, suíte Chromium, suíte Chromium repetida, typecheck, lint, build e `git diff --check`.

---

## File Map

- Modify: `frontend/e2e/support/authApi.ts` — adicionar dados do pedido, ledger `orderCreate`, validação estrita do POST e resposta canônica.
- Create: `frontend/e2e/checkout.spec.ts` — jornada UI carrinho → checkout → confirmação → carrinho consumido.
- Modify: `docs/superpowers/plans/2026-07-15-fase-8-testes-hardening.md` — ligar `TASK-120` a este plano.
- Do not modify: `frontend/e2e/fixtures.ts` — isolamento, assert no `finally` e limpeza já cobrem o novo estado.
- Do not modify: `frontend/src/features/checkout/**`, `frontend/src/features/cart/**` ou `frontend/src/features/customer/**` — o produto real é o objeto do E2E.
- Do not modify: `docs/frontend-tasks-v2.md` durante implementação — somente o orquestrador atualiza o backlog após implementação e revisão aprovadas.

## Inspected Interfaces and Exact Traffic

```ts
// createOrderService.ts + adaptCreateOrderRequest()
POST /api/v1/pedido
Authorization: Bearer task-117.header.payload
{
  enderecoEntrega: {
    logradouro: `${data.street} — somente pedido`,
    numero: data.number,
    complemento: null,
    cep: data.postalCode,
    bairro: data.district,
    cidade: data.city,
    uf: data.state,
  },
  formaPagamento: 'Cartao',
  dataPedido: '<ISO 8601 com offset>',
  items: [{
    itemId: data.cartItemId,
    produtoId: data.product.id,
    quantidade: 3,
    valorUnitario: data.product.price,
  }],
}
```

```ts
// resposta criada pelo backend E2E
{
  status: true,
  data: {
    pedidoId: data.orderId,
    clienteId: data.customerId,
    dataPedido: body.dataPedido,
    formaPagamento: 'Cartao',
    status: 'Criado',
    valorTotal: 10499.7,
  },
}
```

```text
register=0 login=1 categories=4 profile=1 logout=0 product=2
cartCreate=1 cartAdd=1 cartGet=2 cartUpdate=0 cartDelete=0 orderCreate=1
```

---

### Task 1: Register Baseline and Confirm Eligibility

**Files:**
- Read: `docs/frontend-tasks-v2.md`
- Read: `docs/superpowers/specs/2026-07-15-fase-8-testes-hardening-design.md`
- Read: `frontend/e2e/support/authApi.ts`

**Interfaces:**
- Consumes: `TASK-117` and `TASK-119` in `DONE`, every dependency of `TASK-120` in `DONE`, `TASK-120` in `READY`.
- Produces: immutable `BASE_COMMIT` for review.

- [ ] **Step 1: Confirm branch, cleanliness and baseline**

Run:

```bash
git status --short --branch
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Expected: branch `codex/phase-8-hardening`, clean worktree, SHA recorded as `BASE_COMMIT`.

- [ ] **Step 2: Confirm backlog eligibility**

Run:

```bash
rg -n -A 46 "TASK-117:|TASK-119:|TASK-120:" docs/frontend-tasks-v2.md
```

Expected: `TASK-117` and `TASK-119` are `DONE`; `TASK-120` is `READY`; every `Depends on` entry is `DONE`.

---

### Task 2: Write the Complete Journey Against the Missing Order API

**Files:**
- Create: `frontend/e2e/checkout.spec.ts`
- Test: `frontend/e2e/checkout.spec.ts`

**Interfaces:**
- Consumes: `test`, `expect`, `AuthApi.seedCustomer()`, mutable cart handlers from `TASK-119`, semantic checkout controls.
- Produces: typed requirements for `data.orderId` and request counter `orderCreate`.

- [ ] **Step 1: Create the E2E spec**

Create `frontend/e2e/checkout.spec.ts`:

```ts
import { expect, test } from './fixtures'

test('cria e confirma um pedido consumindo o carrinho', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  const editedStreet = `${data.street} — somente pedido`

  authApi.seedCustomer()
  authApi.expectRequestCounts({
    login: 1,
    categories: 4,
    product: 2,
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 2,
    profile: 1,
    orderCreate: 1,
  })

  await page.goto('/carrinho')
  await expect(page).toHaveURL('/entrar')
  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL('/carrinho')

  await page.goto(`/produtos/${data.product.id}`)
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(
    page.getByRole('spinbutton', { name: 'Quantidade' }),
  ).toHaveValue('3')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(
    page.getByRole('status').filter({
      hasText: 'Produto adicionado ao carrinho',
    }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Carrinho com 3 itens' }).click()

  await expect(page).toHaveURL('/carrinho')
  await expect(
    page.getByRole('spinbutton', {
      name: `Quantidade de ${data.product.title}`,
    }),
  ).toHaveValue('3')
  await page.getByRole('link', { name: 'Ir para checkout' }).click()

  await expect(page).toHaveURL('/checkout')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Checkout' }),
  ).toBeVisible()
  await expect(page.getByLabel('Logradouro')).toHaveValue(data.street)
  await expect(page.getByText(
    'As alterações valem somente para este pedido.',
  )).toBeVisible()
  await page.getByLabel('Logradouro').fill(editedStreet)
  await page.getByRole('radio', { name: 'Cartão' }).check()
  await expect(page.getByRole('radio', { name: 'Cartão' })).toBeChecked()
  await expect(page.getByText(/R\$\s10\.499,70/, { exact: true })).toHaveCount(2)

  const confirm = page.getByRole('button', { name: 'Confirmar pedido' })
  await confirm.dblclick()

  await expect(page).toHaveURL(`/pedido-confirmado/${data.orderId}`)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Pedido criado' }),
  ).toBeVisible()
  const confirmation = page.getByRole('main')
  await expect(confirmation).toContainText(String(data.orderId))
  await expect(confirmation).toContainText('Criado')
  await expect(confirmation).toContainText('Cartao')
  await expect(confirmation).toContainText(/R\$\s10\.499,70/)
  await expect(page.getByLabel('Carrinho', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Carrinho com \d+ itens?/ }),
  ).toHaveCount(0)

  await page.goto('/carrinho')
  await expect(page).toHaveURL('/carrinho')
  await expect(
    page.getByRole('heading', { name: 'Seu carrinho está vazio' }),
  ).toBeVisible()
  await expect(page.getByLabel('Carrinho', { exact: true })).toBeVisible()
  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 2,
    profile: 1,
    orderCreate: 1,
  })
})
```

- [ ] **Step 2: Run the RED typecheck**

Run:

```bash
npm --prefix frontend run typecheck
```

Expected: FAIL because `orderId` is absent from `RegistrationData` and `orderCreate` is absent from `RequestName`.

- [ ] **Step 3: Apply the exact temporary RED declarations**

Apply to `frontend/e2e/support/authApi.ts`:

```diff
@@
   | 'cartDelete'
+  | 'orderCreate'
@@
   cartItemId: number
+  orderId: number
@@
     cartItemId: 40_000 + seed,
+    orderId: 50_000 + seed,
@@
     cartDelete: 0,
+    orderCreate: 0,
```

Do not commit this incomplete state.

- [ ] **Step 4: Run the RED journey**

Run:

```bash
npm --prefix frontend run test:e2e -- checkout.spec.ts --project=chromium
```

Expected: FAIL when `POST /api/v1/pedido` reaches the unexpected-request fallback; prior UI steps pass.

---

### Task 3: Add the Strict Order Endpoint to the Shared Backend

**Files:**
- Modify: `frontend/e2e/support/authApi.ts`
- Test: `frontend/e2e/checkout.spec.ts`

**Interfaces:**
- Consumes: `cartItem`, `registeredCustomer`, `requireMethod`, `requireAuthorization`, `readJson`, `json`.
- Produces: deterministic `orderCreate` ledger, exact request validation and canonical created-order response.

- [ ] **Step 1: Add request types beside `LoginRequest`**

```ts
type DeliveryAddressRequest = {
  logradouro: string
  numero: string
  complemento: string | null
  cep: string
  bairro: string
  cidade: string
  uf: string
}

type CreateOrderRequest = {
  enderecoEntrega: DeliveryAddressRequest
  formaPagamento: string
  dataPedido: string
  items: Array<{
    itemId: number | null
    produtoId: number
    quantidade: number
    valorUnitario: number
  }>
}
```

- [ ] **Step 2: Add the endpoint before the profile route**

```ts
if (url.pathname === '/api/v1/pedido') {
  requireMethod(route, 'POST')
  requireAuthorization(route)
  increment('orderCreate')

  if (registeredCustomer === null || cartItem === null) {
    throw new Error('Cannot create an order without customer and cart item')
  }

  const body = readJson<CreateOrderRequest>(route)
  const expectedBody = {
    enderecoEntrega: {
      ...registeredCustomer.endereco,
      logradouro: `${data.street} — somente pedido`,
    },
    formaPagamento: 'Cartao',
    items: [{
      itemId: cartItem.itemId,
      produtoId: cartItem.productId,
      quantidade: cartItem.quantity,
      valorUnitario: cartItem.unitPrice,
    }],
  }
  const { dataPedido, ...bodyWithoutDate } = body

  if (JSON.stringify(bodyWithoutDate) !== JSON.stringify(expectedBody)) {
    throw new Error(`Unexpected order body: ${JSON.stringify(body)}`)
  }
  if (
    typeof dataPedido !== 'string'
    || Number.isNaN(Date.parse(dataPedido))
    || !/(?:Z|[+-]\d{2}:\d{2})$/.test(dataPedido)
  ) {
    throw new Error(`Expected ISO order date with offset, received ${dataPedido}`)
  }
  if ('clienteId' in body || 'carrinhoId' in body) {
    throw new Error(`Forbidden order identifiers: ${JSON.stringify(body)}`)
  }

  const total = cartItem.quantity * cartItem.unitPrice
  cartItem = null
  await json(route, {
    status: true,
    data: {
      pedidoId: data.orderId,
      clienteId: data.customerId,
      dataPedido,
      formaPagamento: 'Cartao',
      status: 'Criado',
      valorTotal: total,
    },
  }, 201)
  return
}
```

The destructuring plus exact `JSON.stringify` comparison rejects missing and extra top-level fields; nested address and item objects are also exact. The route consumes `cartItem` only after complete validation.

- [ ] **Step 3: Verify the final declarations**

The final ledger includes:

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
  | 'cartUpdate'
  | 'cartDelete'
  | 'orderCreate'
```

`RegistrationData` and `buildRegistrationData()` include `orderId`, and the `counts` object includes `orderCreate: 0`. Existing generic `reset()` clears the new counter automatically; `cartItem = null` already clears mutable order input.

- [ ] **Step 4: Run GREEN typecheck and focused journey**

Run:

```bash
npm --prefix frontend run typecheck
npm --prefix frontend run test:e2e -- checkout.spec.ts --project=chromium
```

Expected: typecheck PASS and journey 1/1 PASS with exactly one order POST.

- [ ] **Step 5: Prove previous cart journeys remain compatible**

Run:

```bash
npm --prefix frontend run test:e2e -- guest-cart.spec.ts cart-lifecycle.spec.ts checkout.spec.ts --project=chromium
```

Expected: 3/3 PASS; unmentioned `orderCreate` remains zero in prior specs.

- [ ] **Step 6: Commit shared backend**

Run:

```bash
git add frontend/e2e/support/authApi.ts
git commit -m "test(TASK-120): Estender backend E2E para pedidos"
```

Expected: commit contains only deterministic E2E support.

---

### Task 4: Lock Checkout, Confirmation and Consumption Assertions

**Files:**
- Create: `frontend/e2e/checkout.spec.ts`
- Test: `frontend/e2e/checkout.spec.ts`

**Interfaces:**
- Consumes: strict order endpoint from Task 3.
- Produces: E2E proof of the complete accepted journey.

- [ ] **Step 1: Verify forbidden selectors and direct state manipulation**

Run:

```bash
rg -n "locator\\(|data-testid|waitForTimeout|nth\\(|\\.first\\(|\\.last\\(|xpath|css=|localStorage|sessionStorage|fetch\\(" frontend/e2e/checkout.spec.ts
```

Expected: no matches.

- [ ] **Step 2: Verify the double-submit and server confirmation assertions**

Run:

```bash
rg -n "dblclick|pedido-confirmado|orderId|Criado|Cartao|10\\.499,70|orderCreate: 1|Seu carrinho está vazio" frontend/e2e/checkout.spec.ts
```

Expected: every criterion is present; `dblclick()` is the only submission action and ledger expects `orderCreate: 1`.

- [ ] **Step 3: Run twice**

Run:

```bash
npm --prefix frontend run test:e2e -- checkout.spec.ts --project=chromium --repeat-each=2
```

Expected: 2/2 PASS with independent IDs, cleared storage and fresh backend state.

- [ ] **Step 4: Commit journey**

Run:

```bash
git add frontend/e2e/checkout.spec.ts
git commit -m "test(TASK-120): Cobrir jornada E2E do checkout"
```

Expected: commit contains only the new spec.

---

### Task 5: Run Gates and Prepare Independent Review

**Files:**
- Verify: `frontend/e2e/support/authApi.ts`
- Verify: `frontend/e2e/checkout.spec.ts`

**Interfaces:**
- Consumes: `BASE_COMMIT` and both implementation commits.
- Produces: reproducible evidence and bounded review diff.

- [ ] **Step 1: Run complete Chromium suite**

```bash
npm --prefix frontend run test:e2e -- --project=chromium
```

Expected: every spec PASS.

- [ ] **Step 2: Run complete Chromium suite twice**

```bash
npm --prefix frontend run test:e2e -- --project=chromium --repeat-each=2
```

Expected: every journey PASS twice without order, worker or prior-state dependency.

- [ ] **Step 3: Run static and build gates**

```bash
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build
git diff --check "$BASE_COMMIT"..HEAD
```

Expected: exit code `0` for every command. The pre-existing Vite chunk warning may be recorded but is not a failure.

- [ ] **Step 4: Produce review package**

```bash
git log --oneline "$BASE_COMMIT"..HEAD
git diff --stat "$BASE_COMMIT"..HEAD
git diff "$BASE_COMMIT"..HEAD -- frontend/e2e/support/authApi.ts frontend/e2e/checkout.spec.ts
```

Expected: only the order-capable E2E backend and checkout spec, in commits identified by `TASK-120`.

- [ ] **Step 5: Delegate independent review**

Reviewer checklist:

1. Login and cart construction occur only through visible UI.
2. Checkout opens from a confirmed nonempty cart using `/checkout`.
3. Profile is requested once and initially fills the exact stored address.
4. The street edit is sent in the order, while no customer PUT exists and unexpected requests fail.
5. Payment label `Cartão` transports exact value `Cartao`.
6. POST path, method, authorization and all body keys/values are exact.
7. `dataPedido` is ISO with offset; `clienteId` and `carrinhoId` are absent.
8. A deliberate double-click produces `orderCreate=1`.
9. Confirmation route and visible ID, status, payment and total come from the mocked server response.
10. Successful creation consumes server cart state and client cart binding.
11. Positive badge disappears and revisiting `/carrinho` renders the empty state without GET of the old cart.
12. Fixture reset clears order count and cart state after success or failure.
13. Existing auth, guest-cart and cart-lifecycle specs remain green.
14. No product, ASP.NET backend or backlog file changed.

Expected: no `CRITICAL` or `IMPORTANT`. Any such finding returns to the implementer, reruns affected gates and receives a new review.

---

### Task 6: Handoff Completion to the Orchestrator

**Files:**
- Later modify, only after approvals: `docs/frontend-tasks-v2.md`

**Interfaces:**
- Consumes: implementation approval, review approval, green gates and actual SHAs.
- Produces: evidence required to mark only `TASK-120` as `DONE`.

- [ ] **Step 1: Report evidence without editing backlog**

Report:

- `BASE_COMMIT`;
- both `TASK-120` implementation SHAs;
- focused 1/1 and repeated 2/2 results;
- full Chromium and repeated full Chromium results;
- typecheck, lint, build and diff-check;
- exact raw request counts and accepted order body;
- explicit absence or list of pending `CRITICAL`/`IMPORTANT`.

- [ ] **Step 2: Let orchestrator update status**

The orchestrator marks only `TASK-120` as `DONE`, records evidence and commits, and changes dependent tasks only when every dependency and component-conflict gate permits.

---

## Self-Review

- **Spec coverage:** nonempty cart, checkout, order-only address edit, payment, single POST, server-backed confirmation and consumed cart each map to a visible assertion plus strict traffic validation.
- **Placeholder scan:** no placeholder, deferred implementation, implicit repetition, unspecified test or generic error-handling instruction remains.
- **Type consistency:** endpoint, Portuguese transport keys, address fields, item fields, payment enum, response fields and route parameter match inspected production contracts.
- **Isolation:** existing fixture clears storage and state; the new counter participates in generic assertion/reset; order consumes only per-test `cartItem`.
- **Scope:** only shared E2E support, one E2E spec and the orchestration-plan link are planned.
