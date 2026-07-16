# TASK-123 Expired Session E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Garantir que uma sessão restaurada já expirada ou que expire durante o uso nunca exponha rota privada, remova todo estado privado do cliente e permaneça bloqueada após voltar ou recarregar.

**Architecture:** Manter `ProtectedRoute` como negação síncrona e mover os efeitos para uma rotina única de limpeza privada, parametrizada pela identidade capturada do cliente e pelo `QueryClient`. O inicializador de sessão chamará essa rotina tanto imediatamente após reidratação quanto no timeout; testes de integração provarão limpeza de memória e caches, enquanto Playwright provará as duas jornadas reais e o histórico de navegação.

**Tech Stack:** React 19, React Router 7, Zustand 5, TanStack Query 5, Vitest/Testing Library/MSW e Playwright 1.61.

## Global Constraints

- Trabalhar somente no frontend da TASK-123.
- Reutilizar a infraestrutura determinística da TASK-117 e `timezoneId: 'America/Sao_Paulo'`.
- Aplicar TDD estrito: escrever e executar cada RED antes de alterar produção.
- Limpar auth em `localStorage` e `sessionStorage`, associação/storage do carrinho, queries e mutations privadas e snapshots privados do cliente expirado.
- `ProtectedRoute` deve negar conteúdo privado sincronamente; limpeza com efeitos ocorre fora do render.
- Preservar somente um `returnTo` interno seguro com pathname, query e hash.
- Voltar ou recarregar não pode reabrir conteúdo privado.
- Calibrar as contagens E2E observando o RED; não copiar contagens de outra spec.
- Não ampliar, refatorar ou mudar a semântica global de respostas `401`; a TASK-111 continua dona desse comportamento.

---

## File map

- Create: `frontend/src/features/auth/session/clearPrivateSession.ts` — rotina única e idempotente de limpeza por cliente.
- Create: `frontend/src/features/auth/session/clearPrivateSession.test.ts` — prova auth, cart, query/mutation cache e snapshots.
- Modify: `frontend/src/features/auth/store/AuthSessionInitializer.tsx` — captura a sessão e dispara limpeza completa na expiração imediata ou agendada.
- Create: `frontend/src/features/auth/store/AuthSessionInitializer.test.tsx` — relógio controlado e expiração durante uso.
- Modify: `frontend/src/features/auth/routing/ProtectedRoute.test.tsx` — reforça a negação síncrona sem flash de conteúdo.
- Modify: `frontend/src/app/providers/AppProviders.tsx` — entrega o `QueryClient` necessário ao inicializador sem criar cliente paralelo.
- Create: `frontend/e2e/expired-session.spec.ts` — duas jornadas E2E independentes.
- Modify: `frontend/e2e/support/authApi.ts` — somente se o RED demonstrar necessidade de expiração configurável ou inspeção determinística adicional; preservar falha estrita para request inesperado.
- Modify: `docs/frontend-tasks-v2.md` — somente após aprovação, para evidência e status `DONE`.

### Task 1: Definir a limpeza privada centralizada

**Files:**
- Create: `frontend/src/features/auth/session/clearPrivateSession.test.ts`
- Create: `frontend/src/features/auth/session/clearPrivateSession.ts`
- Read: `frontend/src/shared/query/privateCache.ts`
- Read: `frontend/src/features/customer/cache/customerPrivateSnapshots.ts`
- Read: `frontend/src/features/cart/store/cartSessionStore.ts`

**Interfaces:**
- Consumes: `QueryClient`, `useAuthStore.getState().clearSession()`, `useCartSessionStore.getState().removeCartId(customerId)`, `clearPrivateCache(queryClient)` e `clearCustomerPrivateSnapshots(customerId)`.
- Produces: `clearPrivateSession(queryClient: QueryClient, customerId: number): void`.

- [ ] **Step 1: Escrever o teste RED da limpeza completa**

Criar um teste que:

```ts
useAuthStore.getState().setSession(sessionForCustomer7, 'local')
sessionStorage.setItem(AUTH_STORE_KEY, 'stale-session-copy')
useCartSessionStore.getState().setCartId(7, 70)
useCartSessionStore.getState().setCartId(8, 80)
queryClient.setQueryData(['private', 'profile', 7], { cpf: '12345678901' })
// Construir query com meta.private=true e mutation com meta.private=true.
registerCustomerPrivateSnapshot(7, clearCustomerSnapshot)

clearPrivateSession(queryClient, 7)

expect(useAuthStore.getState().session).toBeNull()
expect(localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
expect(sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
expect(useCartSessionStore.getState().getCartId(7)).toBeUndefined()
expect(useCartSessionStore.getState().getCartId(8)).toBe(80)
expect(localStorage.getItem(CART_SESSION_STORE_KEY)).not.toContain('"7":70')
expect(queryClient.getQueryData(['private', 'profile', 7])).toBeUndefined()
expect(queryClient.getMutationCache().getAll()).toHaveLength(0)
expect(clearCustomerSnapshot).toHaveBeenCalledOnce()
```

Marcar explicitamente query e mutation com `meta: { private: true }` e adicionar dados públicos para provar que a rotina não apaga cache público.

- [ ] **Step 2: Executar o RED**

Run:

```powershell
cd frontend
npx vitest run src/features/auth/session/clearPrivateSession.test.ts
```

Expected: FAIL porque `clearPrivateSession.ts` ainda não existe.

- [ ] **Step 3: Implementar o mínimo**

Criar:

```ts
export function clearPrivateSession(
  queryClient: QueryClient,
  customerId: number,
) {
  useCartSessionStore.getState().removeCartId(customerId)
  useAuthStore.getState().clearSession()
  clearPrivateCache(queryClient)
  clearCustomerPrivateSnapshots(customerId)
}
```

A identidade deve vir do argumento capturado antes de limpar auth; não reler `clienteId` depois de `clearSession()`.

- [ ] **Step 4: Executar o GREEN e regressões focadas**

Run:

```powershell
npx vitest run src/features/auth/session/clearPrivateSession.test.ts src/shared/query/privateCache.test.ts src/features/customer/cache/customerPrivateSnapshots.test.ts src/features/cart/store/cartSessionStore.test.ts
```

Expected: todos PASS; cache público e carrinho de outro cliente permanecem.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/features/auth/session
git commit -m "test(TASK-123): Centralizar limpeza da sessão privada"
```

### Task 2: Aplicar a limpeza à expiração imediata e por relógio

**Files:**
- Create: `frontend/src/features/auth/store/AuthSessionInitializer.test.tsx`
- Modify: `frontend/src/features/auth/store/AuthSessionInitializer.tsx`
- Modify: `frontend/src/app/providers/AppProviders.tsx`
- Modify: `frontend/src/features/auth/routing/ProtectedRoute.test.tsx`

**Interfaces:**
- Consumes: `clearPrivateSession(queryClient, customerId)` da Task 1 e o `QueryClient` já criado em `frontend/src/shared/query/queryClient.ts`.
- Produces: `AuthSessionInitializer` que limpa uma identidade capturada uma única vez na expiração e `ProtectedRoute` que continua negando a rota no mesmo render.

- [ ] **Step 1: Escrever RED para sessão já expirada**

Renderizar os providers reais com relógio fixo, auth expirada persistida nos dois storages, carrinho do cliente, query/mutation privadas e snapshot registrado. A primeira asserção de UI deve provar que o heading privado nunca aparece e que `/entrar` recebe `returnTo: '/pedidos?status=criado#pedido'`; em seguida aguardar a remoção de todas as camadas privadas.

- [ ] **Step 2: Escrever RED para sessão que expira durante uso**

Com `vi.useFakeTimers({ shouldAdvanceTime: true })`, iniciar uma sessão válida que expira em cinco segundos, renderizar conteúdo privado, avançar `5_001 ms` e afirmar:

```ts
expect(screen.queryByRole('heading', { name: 'Meus pedidos' })).not.toBeInTheDocument()
expect(screen.getByText('/entrar|/pedidos?status=criado#pedido')).toBeInTheDocument()
```

Depois provar a mesma limpeza completa da Task 1.

- [ ] **Step 3: Executar os REDs**

Run:

```powershell
npx vitest run src/features/auth/store/AuthSessionInitializer.test.tsx src/features/auth/routing/ProtectedRoute.test.tsx
```

Expected: pelo menos o teste de limpeza completa FAIL, pois o inicializador atual chama apenas `clearSession()`.

- [ ] **Step 4: Injetar o cliente existente e limpar pela identidade capturada**

Alterar `AuthSessionInitializer` para obter o `QueryClient` por `useQueryClient()`. Em ambos os ramos de expiração, capturar `const customerId = session.clienteId` e chamar `clearPrivateSession(queryClient, customerId)`. Manter o timeout máximo de `2_147_483_647`, cancelar no cleanup do effect e não adicionar efeitos ao `ProtectedRoute`.

Em `AppProviders`, manter exatamente um `QueryClientProvider`; não instanciar cliente novo por render.

- [ ] **Step 5: Reforçar o guard síncrono**

No teste existente de `ProtectedRoute`, usar um elemento privado com spy/efeito e provar que uma sessão já expirada resulta diretamente no destino de login sem montar o conteúdo protegido. Preservar pathname, search e hash internos; não aceitar URL externa como origem.

- [ ] **Step 6: Executar GREEN e regressões de autenticação**

Run:

```powershell
npx vitest run src/features/auth/store/AuthSessionInitializer.test.tsx src/features/auth/routing/ProtectedRoute.test.tsx src/features/auth/auth.integration.test.tsx src/features/auth/context/UnauthorizedHandlerProvider.test.tsx
```

Expected: todos PASS, inclusive os testes de `401` existentes sem alteração de semântica.

- [ ] **Step 7: Refatorar sem mudar comportamento**

Remover setup duplicado dos testes com factories locais para sessão, cache e storages. Não mover o tratamento de `401` para a nova rotina nesta task.

- [ ] **Step 8: Reexecutar após refactor e commit**

```powershell
npx vitest run src/features/auth/store/AuthSessionInitializer.test.tsx src/features/auth/routing/ProtectedRoute.test.tsx src/features/auth/auth.integration.test.tsx
git add frontend/src/features/auth frontend/src/app/providers/AppProviders.tsx
git commit -m "fix(TASK-123): Invalidar estado privado ao expirar sessão"
```

Expected: testes PASS antes do commit.

### Task 3: Criar os dois cenários E2E determinísticos

**Files:**
- Create: `frontend/e2e/expired-session.spec.ts`
- Modify if required by observed RED: `frontend/e2e/support/authApi.ts`

**Interfaces:**
- Consumes: fixture `test/expect`, `authApi.seedCustomer()`, `authApi.expectRequestCounts()` e relógio Playwright.
- Produces: dois testes independentes que calibram contagens exatas e não dependem de ordem.

- [ ] **Step 1: Escrever helper local para semear estado**

Em `expired-session.spec.ts`, criar um helper que use `page.addInitScript` antes de `page.goto` para gravar:

```ts
localStorage.setItem('shop-api:auth', JSON.stringify({
  state: { session, persistence: 'local' },
  version: 1,
}))
sessionStorage.setItem('shop-api:auth', staleSessionCopy)
localStorage.setItem('shop-api:cart-session', JSON.stringify({
  state: { cartIdsByCustomer: { [String(session.clienteId)]: cartId } },
  version: 1,
}))
```

O helper deve aceitar `expiraEm`; não alterar `storageState` global.

- [ ] **Step 2: Escrever o cenário RED “restaurada expirada”**

Antes da navegação, fixar o relógio com `page.clock.install({ time: new Date('2026-07-16T12:00:00-03:00') })` e semear `expiraEm` anterior. Abrir `/pedidos?status=criado#pedido`, afirmar imediatamente login e ausência do heading “Meus pedidos”, então afirmar:

- `localStorage['shop-api:auth'] === null`;
- `sessionStorage['shop-api:auth'] === null`;
- `shop-api:cart-session` não contém a associação do cliente;
- URL `/entrar`;
- após autenticar, o destino é exatamente `/pedidos?status=criado#pedido`, demonstrando retorno interno seguro;
- após nova expiração/limpeza, `page.goBack()` e `page.reload()` continuam sem conteúdo privado.

Não use URL externa como estado semeado; o retorno nasce da localização interna atual.

- [ ] **Step 3: Escrever o cenário RED “expira durante uso”**

Semear sessão válida por poucos segundos, abrir `/pedidos`, aguardar o heading e os requests privados iniciais, avançar o relógio além de `expiraEm` com `page.clock.fastForward()`, afirmar redirecionamento e limpeza completa dos storages. Executar `goBack()` e `reload()` e confirmar novamente login, ausência de heading/card privado e ausência de novos requests privados.

- [ ] **Step 4: Executar RED isolado e registrar contagens observadas**

Run:

```powershell
cd frontend
npx playwright test e2e/expired-session.spec.ts --project=chromium --workers=1
```

Expected: FAIL pela lacuna de limpeza antes do GREEN. Registrar no relatório de implementação as contagens reais por cenário (`categories`, `profile`, `ordersList`, `orderDetail` e todas as demais chaves), incluindo zero explícito para rotas privadas que não podem ocorrer.

- [ ] **Step 5: Calibrar o ledger sem afrouxar o mock**

Definir `authApi.expectRequestCounts({...})` separadamente em cada teste usando somente os valores observados no RED/GREEN. Se for necessário variar `expiraEm` do login, adicionar a menor API explícita em `AuthApi`; não aceitar curingas, não remover `assertRequestCounts()` e não permitir rota inesperada.

- [ ] **Step 6: Executar GREEN e repetição anti-flake**

Run:

```powershell
npx playwright test e2e/expired-session.spec.ts --project=chromium --workers=1
npx playwright test e2e/expired-session.spec.ts --project=chromium --workers=1 --repeat-each=20
```

Expected: 2/2 e 40/40 PASS.

- [ ] **Step 7: Executar a suíte Chromium sem dependência de ordem**

Run:

```powershell
npx playwright test --project=chromium
npx playwright test --project=chromium --repeat-each=2
```

Expected: toda a suíte PASS nas duas execuções; nenhum mismatch de ledger.

- [ ] **Step 8: Commit**

```powershell
git add frontend/e2e/expired-session.spec.ts frontend/e2e/support/authApi.ts
git commit -m "test(TASK-123): Cobrir sessão expirada em E2E"
```

Adicionar `frontend/e2e/support/authApi.ts` somente se tiver sido alterado.

### Task 4: Gates, relatório e rastreabilidade

**Files:**
- Create: `.superpowers/task-123-implementation-report.md`
- Modify after review approval: `docs/frontend-tasks-v2.md`

**Interfaces:**
- Consumes: commits e saídas das Tasks 1–3.
- Produces: evidência reproduzível para revisão independente.

- [ ] **Step 1: Executar todos os gates**

Run:

```powershell
cd frontend
npm run typecheck
npm run lint
npm test
npm run test:e2e -- --project=chromium
npm run build
```

Expected: exit code zero em todos; warning de tamanho de chunk deve ser registrado, não tratado dentro desta task.

- [ ] **Step 2: Executar diff-check contra a base**

Run no worktree:

```powershell
git diff --check 540ada24adfd4a9c434eec94d2b43e0ce0a03672..HEAD
git status --short
```

Expected: `git diff --check` sem saída; somente o relatório ainda pode estar pendente antes de seu commit.

- [ ] **Step 3: Registrar evidência**

Em `.superpowers/task-123-implementation-report.md`, registrar:

- `BASE_COMMIT` e hashes funcionais;
- falha exata observada no RED de cada ciclo;
- contagens exatas por cenário E2E;
- resultados 2/2, 40/40, suíte completa e repetição;
- resultados de typecheck, lint, testes e build;
- confirmação de limpeza dos dois auth storages, cart association/storage, query cache, mutation cache e snapshots;
- confirmação de `ProtectedRoute` síncrono, returnTo interno, back/reload;
- decisão explícita: tratamento de `401` não foi ampliado.

- [ ] **Step 4: Commit do relatório**

```powershell
git add .superpowers/task-123-implementation-report.md
git commit -m "test(TASK-123): Registrar evidências de sessão expirada"
```

- [ ] **Step 5: Revisão independente e correções**

Gerar `git diff 540ada24adfd4a9c434eec94d2b43e0ce0a03672..HEAD`, solicitar revisão independente e corrigir todo finding CRITICAL ou IMPORTANT com novo RED antes da correção. Reexecutar gates afetados e reenviar ao reviewer.

- [ ] **Step 6: Atualizar backlog somente após aprovação**

Alterar TASK-123 para `[x]`, `Status: DONE` e registrar commits, RED/GREEN, contagens, gates e aprovação. Executar:

```powershell
git add docs/frontend-tasks-v2.md
git commit -m "test(TASK-123): Registrar jornada E2E de sessão expirada"
git diff --check 540ada24adfd4a9c434eec94d2b43e0ce0a03672..HEAD
git status --short
```

Expected: diff-check limpo e worktree sem mudanças.

## Self-review

- Cobertura: os dois modos de expiração, relógio/storages controlados, limpeza completa, guard síncrono, retorno interno, back/reload, ledgers e suíte sem ordem estão mapeados.
- Escopo: nenhum passo altera backend ou amplia o tratamento de `401`.
- TDD: cada mudança de produção é precedida por RED executado e seguida por GREEN/refactor.
- Placeholders: as únicas variações condicionais são baseadas em evidência do RED; nenhuma etapa permite enfraquecer mocks ou omitir contagens.
- Consistência: a única interface nova é `clearPrivateSession(queryClient, customerId)` e todos os consumidores usam essa assinatura.
