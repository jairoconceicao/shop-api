# TASK-119 — Ciclo Completo do Carrinho E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar em Chromium que um cliente autenticado adiciona um produto, vê badge, lista e totais confirmados, altera a quantidade, remove o item após confirmação e termina com carrinho vazio e badge zero.

**Architecture:** evoluir o backend Playwright em memória da `TASK-117` para manter um carrinho determinístico e mutável por teste. A jornada autentica pela UI usando `seedCustomer()`, exercita os serviços e caches reais do produto/carrinho e exige métodos, autorização, bodies, ausência de body e contagens brutas exatas.

**Tech Stack:** React 19, TypeScript 5.7, Zustand 5, TanStack Query 5, Playwright 1.61, Vite 6.

## Global Constraints

- Escopo exclusivo: frontend E2E e documentação da `TASK-119`; não alterar código de produto nem backend ASP.NET.
- Registrar `BASE_COMMIT=$(git rev-parse HEAD)` antes de qualquer alteração.
- O agente principal apenas orquestra: explorador, implementador e revisor são agentes distintos.
- Não executar dois agentes com permissão de escrita simultaneamente no mesmo checkout.
- Reutilizar `frontend/e2e/fixtures.ts` e `frontend/e2e/support/authApi.ts`; não instalar outra interceptação.
- Autenticar pela UI com `authApi.seedCustomer()`; não escrever uma sessão autenticada diretamente em storage.
- Cada contexto começa e termina sem cookies, storages ou estado do backend em memória.
- Requests não declarados, método incorreto, token ausente, body divergente ou body inesperado devem falhar.
- Usar seletores semânticos; não usar CSS, XPath, `data-testid`, `nth`, `first`, `last` ou `waitForTimeout`.
- O item entra com quantidade `3`, muda para `4` e usa preço unitário `3499.9`.
- As mutações brutas esperadas são exatamente uma de cada: `cartCreate=1`, `cartAdd=1`, `cartUpdate=1`, `cartDelete=1`.
- Os GETs brutos esperados são `product=2` e `cartGet=4`: badge após `setCartId`, reconciliação do POST, reconciliação do PATCH e reconciliação do DELETE.
- Totais esperados: antes do PATCH `R$ 10.499,70`; após o PATCH `R$ 13.999,60`. Nas assertions, usar regex com espaço normal ou não separável.
- Commits de implementação: `test(TASK-119): Tornar carrinho E2E mutável` e `test(TASK-119): Cobrir ciclo completo do carrinho`.
- Gate mínimo: spec isolada, repetição dupla, suíte Chromium, suíte Chromium repetida, typecheck, lint, build e `git diff --check`.

---

## File Map

- Modify: `frontend/e2e/support/authApi.ts` — adicionar ledger de PATCH/DELETE e estado mutável do item confirmado.
- Create: `frontend/e2e/cart-lifecycle.spec.ts` — autenticação pela UI e jornada adicionar → alterar → remover.
- Modify: `docs/superpowers/plans/2026-07-15-fase-8-testes-hardening.md` — ligar a `TASK-119` a este plano.
- Do not modify: `frontend/e2e/fixtures.ts` — o isolamento e a validação no `finally` já são suficientes.
- Do not modify: `frontend/src/features/cart/**` — mutations, cache, dialog, badge e totais reais são o objeto do E2E.
- Do not modify: `docs/frontend-tasks-v2.md` durante a implementação — somente o orquestrador atualiza o backlog após implementação e revisão aprovadas.

## Inspected Interfaces and Exact Traffic

```ts
// addCartItemService.ts
POST /api/v1/carrinho/items
{ produtoId: 42, quantidade: 3, valorUnitario: 3499.9 }

// updateCartItemService.ts
PATCH /api/v1/carrinho/items/:itemId
{ quantidade: 4 }

// deleteCartItemService.ts
DELETE /api/v1/carrinho/items/:itemId
// no request body
```

```text
login=1
categories=1
product=2
cartCreate=1
cartAdd=1
cartGet=4
cartUpdate=1
cartDelete=1
register=0
profile=0
logout=0
```

As quatro leituras do carrinho são intencionais e devem permanecer visíveis na evidência. O critério de uma emissão por request aplica-se a cada comando de mutação; as reconciliações GET canônicas são afirmadas pela contagem bruta real, sem deduplicação artificial na fixture.

---

### Task 1: Register Baseline and Confirm Eligibility

**Files:**
- Read: `docs/frontend-tasks-v2.md`
- Read: `docs/superpowers/specs/2026-07-15-fase-8-testes-hardening-design.md`
- Read: `frontend/e2e/support/authApi.ts`

**Interfaces:**
- Consumes: `TASK-117` and every dependency of `TASK-119` in `DONE`, `TASK-119` in `READY`.
- Produces: immutable `BASE_COMMIT` for review.

- [ ] **Step 1: Confirm the isolated branch and clean checkout**

Run:

```bash
git status --short --branch
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Expected: branch `codex/phase-8-hardening`, clean worktree, SHA saved as `BASE_COMMIT`.

- [ ] **Step 2: Confirm backlog eligibility**

Run:

```bash
rg -n -A 30 "TASK-117:|TASK-118:|TASK-119:" docs/frontend-tasks-v2.md
```

Expected: `TASK-117` and `TASK-118` are `DONE`; `TASK-119` is `READY`; all `Depends on` entries are `DONE`.

---

### Task 2: Write the Complete Journey Against the Missing Mutable API

**Files:**
- Create: `frontend/e2e/cart-lifecycle.spec.ts`
- Test: `frontend/e2e/cart-lifecycle.spec.ts`

**Interfaces:**
- Consumes: `test`, `expect`, `AuthApi.seedCustomer()` and deterministic `authApi.data`.
- Produces: typed requirements for `cartUpdate`, `cartDelete` and mutable cart responses.

- [ ] **Step 1: Create the E2E spec**

Create `frontend/e2e/cart-lifecycle.spec.ts`:

```ts
import { expect, test } from './fixtures'

test('adiciona, altera a quantidade e remove o item do carrinho', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  const productPath = `/produtos/${data.product.id}`

  authApi.seedCustomer()
  authApi.expectRequestCounts({
    login: 1,
    categories: 1,
    product: 2,
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 4,
    cartUpdate: 1,
    cartDelete: 1,
  })

  await page.goto('/carrinho')
  await expect(page).toHaveURL('/entrar')
  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page).toHaveURL('/carrinho')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Carrinho' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Seu carrinho está vazio' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Carrinho' })).toBeVisible()

  await page.goto(productPath)
  await expect(
    page.getByRole('heading', { level: 1, name: data.product.title }),
  ).toBeVisible()
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
  await expect(
    page.getByRole('link', { name: 'Carrinho com 3 itens' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Carrinho com 3 itens' }).click()

  await expect(page).toHaveURL('/carrinho')
  await expect(
    page.getByRole('link', { name: data.product.title }),
  ).toBeVisible()
  await expect(
    page.getByRole('spinbutton', {
      name: `Quantidade de ${data.product.title}`,
    }),
  ).toHaveValue('3')
  await expect(page.getByText(/R\$\s10\.499,70/, { exact: true })).toHaveCount(3)

  await page
    .getByRole('button', { name: 'Aumentar quantidade' })
    .click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Quantidade atualizada' }),
  ).toBeVisible()
  await expect(
    page.getByRole('spinbutton', {
      name: `Quantidade de ${data.product.title}`,
    }),
  ).toHaveValue('4')
  await expect(
    page.getByRole('link', { name: 'Carrinho com 4 itens' }),
  ).toBeVisible()
  await expect(page.getByText(/R\$\s13\.999,60/, { exact: true })).toHaveCount(3)

  await page
    .getByRole('button', { name: `Remover ${data.product.title}` })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Remover item do carrinho?',
  })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(
    `Você deseja remover ${data.product.title}?`,
  )
  await dialog.getByRole('button', { name: 'Remover item' }).click()

  await expect(
    page.getByRole('heading', { name: 'Seu carrinho está vazio' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Carrinho' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Carrinho com \d+ itens?/ }),
  ).toHaveCount(0)
  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 4,
    cartUpdate: 1,
    cartDelete: 1,
  })
})
```

- [ ] **Step 2: Run the RED typecheck**

Run:

```bash
npm --prefix frontend run typecheck
```

Expected: FAIL because `cartUpdate` and `cartDelete` are not members of `RequestName`.

- [ ] **Step 3: Apply the exact temporary RED patch**

Apply exactly:

```diff
diff --git a/frontend/e2e/support/authApi.ts b/frontend/e2e/support/authApi.ts
--- a/frontend/e2e/support/authApi.ts
+++ b/frontend/e2e/support/authApi.ts
@@
   | 'cartAdd'
   | 'cartGet'
+  | 'cartUpdate'
+  | 'cartDelete'
@@
     cartAdd: 0,
     cartGet: 0,
+    cartUpdate: 0,
+    cartDelete: 0,
   }
```

This is a deliberately incomplete intermediate state: it makes the new spec compile while leaving PATCH and DELETE unhandled. Do not commit it separately and do not revert it; Task 3 transforms these exact additions into the complete GREEN state.

- [ ] **Step 4: Run the RED journey**

```bash
npm --prefix frontend run test:e2e -- cart-lifecycle.spec.ts --project=chromium
```

Expected: FAIL when the first PATCH reaches the unexpected-request fallback. Keep the spec and temporary ledger additions unchanged for Task 3.

---

### Task 3: Make the Shared Cart Backend Deterministically Mutable

**Files:**
- Modify: `frontend/e2e/support/authApi.ts`
- Test: `frontend/e2e/cart-lifecycle.spec.ts`

**Interfaces:**
- Consumes: the single `context.route(API_PATTERN, ...)`, `requireMethod`, `requireAuthorization`, `readJson`, `json`.
- Produces:

```ts
type RequestName =
  | 'register' | 'login' | 'categories' | 'profile' | 'logout'
  | 'product' | 'cartCreate' | 'cartAdd' | 'cartGet'
  | 'cartUpdate' | 'cartDelete'
```

- [ ] **Step 1: Apply the complete GREEN patch**

Starting from the temporary RED state in Task 2, apply exactly this patch to `frontend/e2e/support/authApi.ts`:

```diff
diff --git a/frontend/e2e/support/authApi.ts b/frontend/e2e/support/authApi.ts
--- a/frontend/e2e/support/authApi.ts
+++ b/frontend/e2e/support/authApi.ts
@@
   let expected: ExpectedRequestCounts = {}
   let registeredCustomer: RegistrationRequest | null = null
+  let cartItem: {
+    itemId: number
+    productId: number
+    quantity: number
+    unitPrice: number
+  } | null = null
@@
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
+      cartItem = {
+        itemId: data.cartItemId,
+        productId: body.produtoId,
+        quantity: body.quantidade,
+        unitPrice: body.valorUnitario,
+      }
       await json(
         route,
         {
           status: true,
           data: { itemId: data.cartItemId },
         },
         201,
       )
       return
     }
+
+    if (url.pathname === `/api/v1/carrinho/items/${data.cartItemId}`) {
+      requireAuthorization(route)
+
+      if (request.method() === 'PATCH') {
+        increment('cartUpdate')
+        const body = readJson<{ quantidade: number }>(route)
+        const expectedBody = { quantidade: 4 }
+        if (JSON.stringify(body) !== JSON.stringify(expectedBody)) {
+          throw new Error(
+            `Unexpected cart update body: ${JSON.stringify(body)}`,
+          )
+        }
+        if (cartItem === null) {
+          throw new Error('Cannot update a cart item before it is added')
+        }
+        cartItem = { ...cartItem, quantity: body.quantidade }
+        await json(route, {
+          status: true,
+          data: {
+            itemId: data.cartItemId,
+            produtoId: data.product.id,
+          },
+        })
+        return
+      }
+
+      if (request.method() === 'DELETE') {
+        increment('cartDelete')
+        if (request.postData() !== null) {
+          throw new Error(
+            `Expected empty cart delete body, received ${request.postData()}`,
+          )
+        }
+        if (cartItem === null) {
+          throw new Error('Cannot delete a cart item before it is added')
+        }
+        cartItem = null
+        await json(route, {
+          status: true,
+          data: {
+            itemId: data.cartItemId,
+            produtoId: data.product.id,
+          },
+        })
+        return
+      }
+
+      throw new Error(
+        `Expected PATCH or DELETE ${request.url()}, received ${request.method()}`,
+      )
+    }
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
-          items: [
-            {
-              itemId: data.cartItemId,
-              produtoId: data.product.id,
-              quantidade: 3,
-              valorUnitario: data.product.price,
-            },
-          ],
+          items: cartItem === null
+            ? []
+            : [{
+                itemId: cartItem.itemId,
+                produtoId: cartItem.productId,
+                quantidade: cartItem.quantity,
+                valorUnitario: cartItem.unitPrice,
+              }],
         },
       })
       return
@@
     reset() {
+      cartItem = null
       registeredCustomer = null
       expected = {}
       ;(Object.keys(counts) as RequestName[]).forEach((name) => {
         counts[name] = 0
       })
     },
```

After applying it, the complete affected item-route block must render as:

```ts
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
  cartItem = {
    itemId: data.cartItemId,
    productId: body.produtoId,
    quantity: body.quantidade,
    unitPrice: body.valorUnitario,
  }
  await json(
    route,
    {
      status: true,
      data: { itemId: data.cartItemId },
    },
    201,
  )
  return
}

if (url.pathname === `/api/v1/carrinho/items/${data.cartItemId}`) {
  requireAuthorization(route)

  if (request.method() === 'PATCH') {
    increment('cartUpdate')
    const body = readJson<{ quantidade: number }>(route)
    const expectedBody = { quantidade: 4 }
    if (JSON.stringify(body) !== JSON.stringify(expectedBody)) {
      throw new Error(
        `Unexpected cart update body: ${JSON.stringify(body)}`,
      )
    }
    if (cartItem === null) {
      throw new Error('Cannot update a cart item before it is added')
    }
    cartItem = { ...cartItem, quantity: body.quantidade }
    await json(route, {
      status: true,
      data: {
        itemId: data.cartItemId,
        produtoId: data.product.id,
      },
    })
    return
  }

  if (request.method() === 'DELETE') {
    increment('cartDelete')
    if (request.postData() !== null) {
      throw new Error(
        `Expected empty cart delete body, received ${request.postData()}`,
      )
    }
    if (cartItem === null) {
      throw new Error('Cannot delete a cart item before it is added')
    }
    cartItem = null
    await json(route, {
      status: true,
      data: {
        itemId: data.cartItemId,
        produtoId: data.product.id,
      },
    })
    return
  }

  throw new Error(
    `Expected PATCH or DELETE ${request.url()}, received ${request.method()}`,
  )
}
```

- [ ] **Step 2: Verify the final declarations and reset function**

The complete final ledger declaration must be:

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
```

The complete final `reset` method must be:

```ts
reset() {
  cartItem = null
  registeredCustomer = null
  expected = {}
  ;(Object.keys(counts) as RequestName[]).forEach((name) => {
    counts[name] = 0
  })
},
```

This is required because the fixture invokes `reset()` before and after every test, including failed tests.

- [ ] **Step 3: Run GREEN typecheck and focused journey**

Run:

```bash
npm --prefix frontend run typecheck
npm --prefix frontend run test:e2e -- cart-lifecycle.spec.ts --project=chromium
```

Expected: typecheck PASS and journey 1/1 PASS with exact raw counts.

- [ ] **Step 4: Prove the previous guest journey remains compatible**

Run:

```bash
npm --prefix frontend run test:e2e -- guest-cart.spec.ts cart-lifecycle.spec.ts --project=chromium
```

Expected: 2/2 PASS; the existing guest journey still receives quantity `3` and two cart GETs.

- [ ] **Step 5: Commit the shared backend**

Run:

```bash
git add frontend/e2e/support/authApi.ts
git commit -m "test(TASK-119): Tornar carrinho E2E mutável"
```

Expected: commit contains only the shared Playwright backend.

---

### Task 4: Lock the User-Visible Lifecycle Assertions

**Files:**
- Create: `frontend/e2e/cart-lifecycle.spec.ts`
- Test: `frontend/e2e/cart-lifecycle.spec.ts`

**Interfaces:**
- Consumes: mutable handlers and exact ledger from Task 3.
- Produces: E2E proof for badge, list, quantity, subtotal, total, confirmation dialog, empty state and badge zero.

- [ ] **Step 1: Verify semantic selectors**

Run:

```bash
rg -n "locator\\(|data-testid|waitForTimeout|nth\\(|\\.first\\(|\\.last\\(|xpath|css=" frontend/e2e/cart-lifecycle.spec.ts
```

Expected: no matches.

- [ ] **Step 2: Verify that only assertions account for repeated currency text**

Run:

```bash
rg -n "10\\.499,70|13\\.999,60|toHaveCount\\(3\\)" frontend/e2e/cart-lifecycle.spec.ts
```

Expected: each amount is asserted exactly three times collectively: item subtotal, summary subtotal and summary total.

- [ ] **Step 3: Run the spec twice**

Run:

```bash
npm --prefix frontend run test:e2e -- cart-lifecycle.spec.ts --project=chromium --repeat-each=2
```

Expected: 2/2 PASS with independent numeric seeds and reset backend state.

- [ ] **Step 4: Commit the journey**

Run:

```bash
git add frontend/e2e/cart-lifecycle.spec.ts
git commit -m "test(TASK-119): Cobrir ciclo completo do carrinho"
```

Expected: commit contains only the new spec.

---

### Task 5: Run Gates and Prepare Independent Review

**Files:**
- Verify: `frontend/e2e/support/authApi.ts`
- Verify: `frontend/e2e/cart-lifecycle.spec.ts`

**Interfaces:**
- Consumes: `BASE_COMMIT` and the two implementation commits.
- Produces: reproducible gate evidence and review diff.

- [ ] **Step 1: Run the complete Chromium suite**

Run:

```bash
npm --prefix frontend run test:e2e -- --project=chromium
```

Expected: all specs PASS.

- [ ] **Step 2: Run the complete Chromium suite twice**

Run:

```bash
npm --prefix frontend run test:e2e -- --project=chromium --repeat-each=2
```

Expected: all journeys PASS twice without order, worker or storage dependency.

- [ ] **Step 3: Run static and build gates**

Run:

```bash
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build
git diff --check "$BASE_COMMIT"..HEAD
```

Expected: every command exits `0`. The pre-existing Vite chunk warning may be recorded but is not a failure.

- [ ] **Step 4: Produce the review package**

Run:

```bash
git log --oneline "$BASE_COMMIT"..HEAD
git diff --stat "$BASE_COMMIT"..HEAD
git diff "$BASE_COMMIT"..HEAD -- frontend/e2e/support/authApi.ts frontend/e2e/cart-lifecycle.spec.ts
```

Expected: only the mutable E2E backend and lifecycle spec, in commits identified by `TASK-119`.

- [ ] **Step 5: Delegate independent review**

The reviewer must verify:

1. Authentication is performed through the login UI after `seedCustomer()`.
2. POST, PATCH and DELETE each occur exactly once.
3. POST body is exactly `{ produtoId: 42, quantidade: 3, valorUnitario: 3499.9 }`.
4. PATCH body is exactly `{ quantidade: 4 }`; DELETE has no body.
5. The GET handler returns empty, quantity `3`, quantity `4`, then empty according to backend state.
6. Badge and cart list use confirmed server data, not only optimistic UI.
7. Subtotal and total are checked before and after PATCH.
8. Removal requires the accessible confirmation dialog.
9. Final empty state and the absence of a positive badge are both asserted.
10. `reset()` clears `cartItem`, counts and customer state after success or failure.
11. Existing `auth.spec.ts` and `guest-cart.spec.ts` remain green.
12. No product code, ASP.NET backend or backlog was changed.

Expected: no `CRITICAL` or `IMPORTANT` finding. Any such finding returns to the same implementer, reruns affected gates and receives a new review.

---

### Task 6: Handoff Completion to the Orchestrator

**Files:**
- Later modify, only after approvals: `docs/frontend-tasks-v2.md`

**Interfaces:**
- Consumes: implementation approval, review approval, green gates and real SHAs.
- Produces: evidence required to mark only `TASK-119` as `DONE`.

- [ ] **Step 1: Report evidence without editing the backlog**

Report:

- `BASE_COMMIT`;
- both `TASK-119` implementation SHAs;
- focused 1/1 and repeated 2/2 results;
- full Chromium and repeated full Chromium results;
- typecheck, lint, build and diff-check;
- exact raw request counts;
- pending findings or explicit absence of `CRITICAL`/`IMPORTANT`.

- [ ] **Step 2: Let the orchestrator update status after both approvals**

The orchestrator marks only `TASK-119` as `DONE`, records evidence and commits, and changes `TASK-120` to `READY` only if every dependency is `DONE` and no component conflict exists.

---

## Self-Review

- **Spec coverage:** authenticated isolated start, add, confirmed badge/list, PATCH, subtotal/total, confirmed DELETE, empty state, badge zero, exact raw traffic and repeatability are mapped.
- **Placeholder scan:** no placeholder marker, deferred implementation, implicit repetition, unspecified test or unspecified error handling remains.
- **Type consistency:** `RequestName`, handler paths, payload property names, response fields and quantities match inspected production contracts.
- **Regression safety:** the fixed add payload remains quantity `3`, so `guest-cart.spec.ts` retains its existing contract; mutable state is reset per fixture.
- **Scope:** only shared E2E support, the new E2E spec and the orchestration-plan link are planned.
