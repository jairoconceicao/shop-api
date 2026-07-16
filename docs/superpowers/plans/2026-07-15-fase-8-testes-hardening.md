# Fase 8 — Testes e Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar as lacunas determinísticas, integradas e E2E do frontend e produzir evidência reproduzível de performance, privacidade, responsividade, acessibilidade, operação e gate final.

**Architecture:** Preservar a SPA React e suas fronteiras por feature: contratos e stores são testados isoladamente, fluxos usam providers reais e MSW, e jornadas Playwright usam um backend simulado determinístico compartilhado. Os cinco lotes são sequenciais; cada task tem RED/GREEN, gates próprios e commit revisável, enquanto auditorias geram artefatos versionados e só corrigem findings dentro de seu escopo.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, Tailwind CSS 4, TanStack Query 5, Zustand 5, Zod 4, Vitest 4, Testing Library 16, MSW 2 e Playwright 1.61 (Chromium).

## Global Constraints

- Clean Architecture + DDD — monólito modular com vertical-slice por feature.
- SPA, sem server-side pages.
- O OpenAPI é a fonte de verdade da integração.
- Backend e frontend não podem ser combinados na mesma tarefa.
- Não executar dois writers no mesmo checkout.
- Uma task só começa em `READY`, com todas as dependências em `DONE` e componentes livres.
- Os lotes são sequenciais: `TASK-106`–`110` → `TASK-111`–`116` → `TASK-117`–`123` → `TASK-124`–`129` → `TASK-130`.
- Cada comportamento alterado exige teste correspondente; não duplicar casos equivalentes para aumentar contagem.
- Cada task passa testes focados, `npm run typecheck` e `npm run lint`; executar build ao alterar roteamento, imports, configuração, CSS global ou documentação de comandos; executar E2E ao alterar infraestrutura ou jornada Playwright.
- Chromium é o único navegador do gate E2E.
- Não usar comparação visual pixel a pixel nem porcentagem global como meta de cobertura.
- Não alterar API, domínio ou infraestrutura backend nesta fase.
- Findings `CRITICAL` ou `IMPORTANT` exigem correção, nova execução e nova revisão antes de `DONE`.
- Commits de produto seguem `feat(TASK-ID): descrição`, `fix(TASK-ID): descrição` ou `test(TASK-ID): descrição`.

---

## File Map

- `frontend/src/**/*.test.ts?(x)`: cobertura isolada e integrada junto à feature proprietária.
- `frontend/src/shared/testing/handlers.ts`: handlers MSW reutilizáveis em Vitest; não contém estado entre testes.
- `frontend/src/shared/testing/server.ts`: servidor MSW e rejeição de requests não declarados.
- `frontend/e2e/support/backend.ts`: estado, rotas e contadores determinísticos do backend Playwright.
- `frontend/e2e/support/fixtures.ts`: fixture `test` que limpa storage/backend e expõe contadores.
- `frontend/e2e/*.spec.ts`: uma jornada independente por arquivo.
- `frontend/src/app/router/AppRouter.tsx`: fronteira única de imports dinâmicos de rotas privadas pesadas.
- `frontend/src/shared/testing/profiling.tsx`: coletor tipado de commits do React Profiler.
- `docs/frontend-quality/*.md`: matrizes e relatórios reproduzíveis; cada relatório informa commit, ambiente, comandos e resultados.
- `frontend/README.md`: operação local, testes, troubleshooting e política de persistência.

## Lote 1 — cobertura determinística

### Task 106: TASK-106 — schemas e adapters

**Files:**
- Modify: `frontend/src/shared/contracts/apiEnvelopes.test.ts`
- Modify: `frontend/src/shared/adapters/numbers.test.ts`
- Modify: `frontend/src/features/auth/contracts/login.test.ts`
- Modify: `frontend/src/features/customer/contracts/registration.test.ts`
- Modify: `frontend/src/features/catalog/contracts/catalog.test.ts`
- Modify: `frontend/src/features/cart/contracts/cart.test.ts`
- Modify: `frontend/src/features/checkout/contracts/checkout.test.ts`
- Modify: `frontend/src/features/orders/contracts/orders.test.ts`
- Create: `docs/frontend-quality/task-106-contract-matrix.md`

**Interfaces:** Consumes os schemas Zod e adapters exportados pelos arquivos de contrato atuais. Produces uma matriz `campo | number | string numérica | null | extra | unsafe/non-finite | resultado` e nenhuma API de runtime nova.

- [ ] **RED:** acrescente casos parametrizados que exercitem cada célula ainda ausente, usando `safeParse`/adapter público e `expect(result.success).toBe(false)` para extras, enum desconhecido, `NaN`, `Infinity` e inteiro acima de `Number.MAX_SAFE_INTEGER`.
- [ ] **Confirmar RED:** execute `npm test -- src/shared/contracts/apiEnvelopes.test.ts src/shared/adapters/numbers.test.ts src/features/auth/contracts/login.test.ts src/features/customer/contracts/registration.test.ts src/features/catalog/contracts/catalog.test.ts src/features/cart/contracts/cart.test.ts src/features/checkout/contracts/checkout.test.ts src/features/orders/contracts/orders.test.ts`; esperado: somente os novos casos descobertos falham, identificando campo/schema.
- [ ] **Implementação mínima:** ajuste apenas o schema/adapter proprietário do caso falho, com `.strict()`, `z.enum(...)`, refinamento finito/seguro ou nulabilidade já autorizada por `openapi.yaml`; registre cada caso e teste na matriz.
- [ ] **GREEN e gates:** repita o comando focado; esperado PASS. Execute `npm run typecheck` e `npm run lint`; esperado exit code 0.
- [ ] **Commit:** `git add frontend/src docs/frontend-quality/task-106-contract-matrix.md && git commit -m "test(TASK-106): ampliar matriz de contratos"`.

### Task 107: TASK-107 — formatadores e normalizadores

**Files:** Modify `frontend/src/shared/formatting/personalData.test.ts`; Create `frontend/src/shared/dates/localCivilDate.test.ts`; Create `frontend/src/shared/formatting/currency.test.ts`; Create `frontend/src/shared/formatting/currency.ts`; Create `docs/frontend-quality/task-107-formatting-matrix.md`.

**Interfaces:** Consumes `localCivilDate.ts` e normalizadores públicos de `personalData.ts`. Produces `formatBrlCurrency(value: number): string`, usando `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

- [ ] **RED:** escreva tabelas explícitas para moeda `0`, `-1`, `12.34`; CPF/CEP/telefone progressivos, caracteres estranhos e limites; datas `YYYY-MM-DD` válidas, limites inclusivos, offset de timezone e entradas inválidas; inclua round-trip apenas onde parse e format públicos existem.
- [ ] **Confirmar RED:** `npm test -- src/shared/formatting/personalData.test.ts src/shared/formatting/currency.test.ts src/shared/dates/localCivilDate.test.ts`; esperado FAIL por `currency.ts` ausente e por qualquer lacuna real.
- [ ] **Implementação mínima:** crie exatamente `export function formatBrlCurrency(value: number): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) }`; corrija normalização/data somente se o teste revelar divergência e documente casos reutilizados.
- [ ] **GREEN e gates:** repita os testes focados, `npm run typecheck` e `npm run lint`; esperado PASS/exit 0.
- [ ] **Commit:** `git add frontend/src/shared docs/frontend-quality/task-107-formatting-matrix.md && git commit -m "test(TASK-107): cobrir formatadores e datas civis"`.

### Task 108: TASK-108 — authStore

**Files:** Modify `frontend/src/features/auth/store/authStore.test.ts`; Modify `frontend/src/features/auth/store/authStore.ts`; Modify `frontend/src/features/auth/store/AuthSessionInitializer.tsx`.

**Interfaces:** Consumes `AUTH_STORE_KEY`, `AUTH_STORE_VERSION`, `AuthSession`, `useAuthStore`, `isAuthSessionExpired`. Produces a mesma API; eventual timer é criado e limpo por `AuthSessionInitializer`.

- [ ] **RED:** cubra sessão local/session, troca limpando storage antigo, reidratação válida, `expiraEm` ausente/inválido/atingido, timer com `vi.useFakeTimers()`, versão 0/corrompida e storage cujos métodos lançam.
- [ ] **Confirmar RED:** `npm test -- src/features/auth/store/authStore.test.ts`; esperado: falhas apenas em migração/sanitização/timer ainda ausentes.
- [ ] **Implementação mínima:** adicione `migrate`/`merge` que aceitam somente um `AuthSession` válido e programe um timeout até `Date.parse(expiraEm)`, sempre retornando cleanup; preserve estado em memória em erro de storage.
- [ ] **GREEN e gates:** teste focado, `npm run typecheck`, `npm run lint`; todos exit 0.
- [ ] **Commit:** `git add frontend/src/features/auth/store && git commit -m "test(TASK-108): endurecer persistência da autenticação"`.

### Task 109: TASK-109 — cartSessionStore (verificação)

**Files:** Modify somente se houver lacuna: `frontend/src/features/cart/store/cartSessionStore.test.ts`, `frontend/src/features/cart/store/cartSessionStore.ts`; Create `docs/frontend-quality/task-109-cart-session-evidence.md`.

**Interfaces:** Consumes `CART_SESSION_STORE_KEY`, `CART_SESSION_STORE_VERSION`, `useCartSessionStore`. Produces apenas evidência; API runtime permanece igual quando todos os critérios já passam.

- [ ] **RED/auditoria:** mapeie testes existentes para isolamento por cliente, alteração seletiva, descarte de chaves/IDs/campos inválidos, migração v0, sanitização v1 e falha de `localStorage`; para célula vazia, acrescente um teste que falhe pelo comportamento observável.
- [ ] **Confirmar:** `npm test -- src/features/cart/store/cartSessionStore.test.ts`; esperado PASS se a matriz estiver completa, ou FAIL nomeado para a lacuna.
- [ ] **Implementação mínima:** se houver FAIL, altere somente sanitização/migração/storage necessários; se PASS, não altere produto e registre arquivo, nome do teste e saída no relatório.
- [ ] **GREEN e gates:** teste focado, `npm run typecheck`, `npm run lint`; todos exit 0.
- [ ] **Commit:** `git add frontend/src/features/cart/store docs/frontend-quality/task-109-cart-session-evidence.md && git commit -m "test(TASK-109): registrar robustez da sessão do carrinho"`.

### Task 110: TASK-110 — componentes base

**Files:** Modify testes em `frontend/src/shared/ui/{buttons,forms,feedback,indicators,media,navigation,overlays,states,surfaces}/*.test.tsx`; Modify componente proprietário somente se falhar; Create `docs/frontend-quality/task-110-component-matrix.md`.

**Interfaces:** Consumes as props públicas atuais dos componentes TASK-019–026. Produces matriz `componente | teclado | foco | disabled/loading | error/empty/skeleton | semântica`.

- [ ] **RED:** preencha a matriz a partir dos testes existentes e adicione casos Testing Library para cada célula vazia, consultando por role/nome/descrição, `aria-current`, live region, Escape, Tab e retorno de foco.
- [ ] **Confirmar RED:** `npm test -- src/shared/ui`; esperado: novos casos descobertos falham e os cobertos permanecem PASS.
- [ ] **Implementação mínima:** ajuste somente atributos ARIA, estado/foco ou teclado do componente dono; não redesenhe primitives.
- [ ] **GREEN e gates do lote:** `npm test -- src/shared/ui`, `npm run typecheck`, `npm run lint`, `npm test`; esperado exit 0 e lote 1 liberável.
- [ ] **Commit:** `git add frontend/src/shared/ui docs/frontend-quality/task-110-component-matrix.md && git commit -m "test(TASK-110): completar matriz dos componentes base"`.

## Lote 2 — integração MSW

Para TASK-111–116, cada teste usa `setupServer`, `server.use(http.<method>(...))`, `onUnhandledRequest: 'error'`, `AppProviders`/router reais, captura request em variável local e restaura `server.resetHandlers()` no `afterEach`.

### Task 111: TASK-111 — autenticação integrada

**Files:** Create `frontend/src/features/auth/auth.integration.test.tsx`; Modify `frontend/src/shared/testing/handlers.ts` somente para handlers sem estado.

**Interfaces:** Consumes rotas `/api/v1/auth/login`, `/api/v1/auth/logout`, stores/caches privados e `returnTo`. Produces nenhum helper global; casos são isolados por `beforeEach`.

- [ ] **RED:** crie casos para persistência escolhida, `returnTo` interno/externo, logout remoto falho com limpeza, dois `401` concorrentes tratados uma vez e resposta tardia incapaz de repor cache privado.
- [ ] **Confirmar RED:** `npm test -- src/features/auth/auth.integration.test.tsx`; esperado FAIL nos efeitos integrados ainda não garantidos.
- [ ] **Implementação mínima:** corrija apenas provider/mutation/handler de unauthorized responsável; requests mutáveis continuam sem retry.
- [ ] **GREEN e gates:** teste focado, `npm run typecheck`, `npm run lint`; exit 0.
- [ ] **Commit:** `git add frontend/src/features/auth frontend/src/shared/testing/handlers.ts && git commit -m "test(TASK-111): integrar ciclo de autenticação"`.

### Task 112: TASK-112 — cadastro e perfil integrados

**Files:** Create `frontend/src/features/customer/customer.integration.test.tsx`; Modify feature customer somente diante de RED.

**Interfaces:** Consumes POST cadastro, GET/PUT perfil, dialogs e query keys atuais. Produces nenhuma interface nova.

- [ ] **RED:** teste body normalizado+201+navegação, 409 preservando campos, 422 conhecido/desconhecido, GET preenchendo perfil, confirmação de CPF e PUT reconciliando cache, e ausência de toast de sucesso em falha.
- [ ] **Confirmar RED:** `npm test -- src/features/customer/customer.integration.test.tsx`; esperado FAIL por qualquer wiring divergente.
- [ ] **Implementação mínima:** ajuste service/mutation/page proprietária sem ampliar contrato OpenAPI.
- [ ] **GREEN e gates:** focado, typecheck e lint; exit 0.
- [ ] **Commit:** `git add frontend/src/features/customer && git commit -m "test(TASK-112): integrar cadastro e perfil"`.

### Task 113: TASK-113 — catálogo integrado

**Files:** Create `frontend/src/features/catalog/catalog.integration.test.tsx`; Modify feature catalog somente diante de RED.

**Interfaces:** Consumes endpoints de categorias, catálogo, categoria e detalhe, URL canônica e query keys atuais.

- [ ] **RED:** prove início paralelo com duas promises controladas; URL/request de busca+página; endpoint dedicado; metadata; back/forward; canonicalização inválida; produto 404 sem retry.
- [ ] **Confirmar RED:** `npm test -- src/features/catalog/catalog.integration.test.tsx`; esperado FAIL em divergências de request/rota/cache.
- [ ] **Implementação mínima:** corrija query, serializer ou página dona, mantendo OpenAPI e sem novo estado global.
- [ ] **GREEN e gates:** focado, typecheck e lint; exit 0.
- [ ] **Commit:** `git add frontend/src/features/catalog && git commit -m "test(TASK-113): integrar catálogo e navegação"`.

### Task 114: TASK-114 — carrinho integrado

**Files:** Create `frontend/src/features/cart/cart.integration.test.tsx`; Modify feature cart somente diante de RED.

**Interfaces:** Consumes POST criar sem body, GET, PATCH, DELETE, `useCartSessionStore` e cache confirmado.

- [ ] **RED:** cubra criação antes do primeiro item, leitura existente, PATCH, DELETE confirmado, rollback somente do alvo, vínculo removido em 404 e convergência de cache/badge/resposta; afirme método/body/contagem.
- [ ] **Confirmar RED:** `npm test -- src/features/cart/cart.integration.test.tsx`; esperado FAIL para reconciliação incorreta.
- [ ] **Implementação mínima:** ajuste mutations/cache/store proprietário; não persista itens remotos.
- [ ] **GREEN e gates:** focado, typecheck e lint; exit 0.
- [ ] **Commit:** `git add frontend/src/features/cart && git commit -m "test(TASK-114): integrar ciclo do carrinho"`.

### Task 115: TASK-115 — checkout integrado

**Files:** Create `frontend/src/features/checkout/checkout.integration.test.tsx`; Modify feature checkout somente diante de RED.

**Interfaces:** Consumes carrinho/perfil confirmados, POST pedido e caches de pedidos/confirmação.

- [ ] **RED:** teste carregamento confirmado, body exato com data ISO e sem IDs proibidos, itens confirmados, duplo clique=um POST, 201 limpando vínculo+invalidando+navegando, 409/422 preservando checkout.
- [ ] **Confirmar RED:** `npm test -- src/features/checkout/checkout.integration.test.tsx`; esperado FAIL nas garantias ausentes.
- [ ] **Implementação mínima:** ajuste adapter/mutation/page sem mudar contrato.
- [ ] **GREEN e gates:** focado, typecheck e lint; exit 0.
- [ ] **Commit:** `git add frontend/src/features/checkout && git commit -m "test(TASK-115): integrar checkout confirmado"`.

### Task 116: TASK-116 — pedidos integrados

**Files:** Create `frontend/src/features/orders/orders.integration.test.tsx`; Modify feature orders somente diante de RED.

**Interfaces:** Consumes listagem/detalhe/cancelamento, filtros URL, hidratação única e `orderQueryKeys`.

- [ ] **RED:** teste CPF/filtros/paginação, IDs no detalhe, GET único por produto, PATCH contendo somente `Cancelado`, 422 anunciado+status mantido+reload e sucesso reconciliando detalhe/listas.
- [ ] **Confirmar RED:** `npm test -- src/features/orders/orders.integration.test.tsx`; esperado FAIL nas garantias ausentes.
- [ ] **Implementação mínima:** ajuste service/query/mutation proprietária.
- [ ] **GREEN e gates do lote:** focado, `npm run typecheck`, `npm run lint`, `npm test`; exit 0 e lote 2 liberável.
- [ ] **Commit:** `git add frontend/src/features/orders && git commit -m "test(TASK-116): integrar pedidos e cancelamento"`.

## Lote 3 — infraestrutura e jornadas Playwright

### Task 117: TASK-117 — fixture E2E e jornada auth

**Files:** Create `frontend/e2e/support/backend.ts`; Create `frontend/e2e/support/fixtures.ts`; Create `frontend/e2e/auth.spec.ts`; Modify `frontend/playwright.config.ts`.

**Interfaces:** Produces `test`, `expect`, `backend` em `fixtures.ts`; `backend.count(method: string, path: string): number`, `backend.reset(): Promise<void>` e `backend.assertNoUnexpectedRequests(): void`. Cada `beforeEach` limpa cookies, local/session storage e backend; `afterEach` chama assert+reset mesmo em falha.

- [ ] **RED:** implemente primeiro `auth.spec.ts` importando a fixture ainda ausente; jornada cadastra, confirma, loga, recarrega, acessa rota protegida e desloga, afirmando contagem exata.
- [ ] **Confirmar RED:** `npx playwright test e2e/auth.spec.ts --project=chromium`; esperado FAIL por módulo `support/fixtures` ausente.
- [ ] **Implementação mínima:** crie backend por `page.route('**/api/v1/**', ...)`, estado por teste, contador `METHOD pathname`, falha para rota não declarada e cleanup em `try/finally` da fixture.
- [ ] **GREEN e isolamento:** execute spec isolada, `npx playwright test --project=chromium`, `npx playwright test --project=chromium --repeat-each=2`, typecheck e lint; todos exit 0.
- [ ] **Commit:** `git add frontend/e2e frontend/playwright.config.ts && git commit -m "test(TASK-117): criar infraestrutura E2E isolada"`.

### Task 118: TASK-118 — visitante antes de adicionar

**Files:** Create `frontend/e2e/visitor-cart-return.spec.ts`.

**Interfaces:** Consumes `test`, `expect`, `backend`; não altera fixture.

- [ ] **RED:** jornada seleciona quantidade como visitante, clica adicionar, espera `/entrar?returnTo=<produto interno>`, loga, retorna e afirma contador POST carrinho igual a zero.
- [ ] **Confirmar RED:** execute a spec; esperado FAIL se houver auto-add/request antecipado.
- [ ] **Implementação mínima:** se falhar, corrija guard/returnTo no arquivo proprietário e mantenha novo clique obrigatório.
- [ ] **GREEN e gates:** spec, typecheck, lint e suíte E2E Chromium; exit 0.
- [ ] **Commit:** `git add frontend/e2e/visitor-cart-return.spec.ts frontend/src/features && git commit -m "test(TASK-118): validar retorno do visitante ao produto"`.

### Task 119: TASK-119 — adicionar, alterar e remover

**Files:** Create `frontend/e2e/cart.spec.ts`.

**Interfaces:** Consumes fixture/backend e estado autenticado explícito criado pelo teste.

- [ ] **RED:** adicione, confira badge/lista, altere quantidade/totais, confirme remoção, confira vazio/badge zero e uma request por ação.
- [ ] **Confirmar RED:** execute a spec; esperado FAIL em qualquer efeito/contagem divergente.
- [ ] **Implementação mínima:** corrija somente feature cart se necessário.
- [ ] **GREEN e gates:** spec, typecheck, lint, E2E Chromium; exit 0.
- [ ] **Commit:** `git add frontend/e2e/cart.spec.ts frontend/src/features/cart && git commit -m "test(TASK-119): cobrir jornada principal do carrinho"`.

### Task 120: TASK-120 — checkout e confirmação

**Files:** Create `frontend/e2e/checkout.spec.ts`.

**Interfaces:** Consumes backend com carrinho/perfil/pedido determinísticos.

- [ ] **RED:** abra checkout não vazio, edite endereço só no pedido, selecione pagamento, submeta duas vezes rapidamente, afirme um POST, confirmação do servidor e carrinho consumido.
- [ ] **Confirmar RED:** execute a spec; esperado FAIL se duplicar POST ou usar dado não confirmado.
- [ ] **Implementação mínima:** corrija feature checkout proprietária.
- [ ] **GREEN e gates:** spec, typecheck, lint, E2E Chromium; exit 0.
- [ ] **Commit:** `git add frontend/e2e/checkout.spec.ts frontend/src/features/checkout && git commit -m "test(TASK-120): cobrir checkout e confirmação"`.

### Task 121: TASK-121 — dados pessoais e senha

**Files:** Create `frontend/e2e/customer-account.spec.ts`.

**Interfaces:** Consumes backend de perfil/senha; senha nunca entra em contador payload persistido.

- [ ] **RED:** carregue/salve perfil, confirme CPF, valide regras/erros/sucesso da senha, confirme inputs sensíveis vazios e perfil após refresh.
- [ ] **Confirmar RED:** execute a spec; esperado FAIL para efeito ausente.
- [ ] **Implementação mínima:** corrija somente customer pages/mutations.
- [ ] **GREEN e gates:** spec, typecheck, lint, E2E Chromium; exit 0.
- [ ] **Commit:** `git add frontend/e2e/customer-account.spec.ts frontend/src/features/customer && git commit -m "test(TASK-121): cobrir conta e senha"`.

### Task 122: TASK-122 — pedidos e cancelamento recusado

**Files:** Create `frontend/e2e/orders.spec.ts`.

**Interfaces:** Consumes backend de lista/detalhe/PATCH 422.

- [ ] **RED:** liste, filtre, abra detalhe, tente cancelar, anuncie recusa, recarregue e mantenha status confirmado; afirme contagens.
- [ ] **Confirmar RED:** execute a spec; esperado FAIL para reconciliação incorreta.
- [ ] **Implementação mínima:** corrija feature orders proprietária.
- [ ] **GREEN e gates:** spec, typecheck, lint, E2E Chromium; exit 0.
- [ ] **Commit:** `git add frontend/e2e/orders.spec.ts frontend/src/features/orders && git commit -m "test(TASK-122): cobrir cancelamento recusado"`.

### Task 123: TASK-123 — sessão expirada

**Files:** Create `frontend/e2e/expired-session.spec.ts`.

**Interfaces:** Consumes `AUTH_STORE_KEY`, clock Playwright e fixture limpa.

- [ ] **RED:** injete sessão já expirada e depois sessão que expira por relógio; em ambas afirme storages/cache limpos, returnTo interno e conteúdo privado inacessível após back/reload.
- [ ] **Confirmar RED:** execute a spec; esperado FAIL se conteúdo privado reaparecer.
- [ ] **Implementação mínima:** corrija initializer/unauthorized/protected route, sem persistir novos dados.
- [ ] **GREEN e gates do lote:** spec, typecheck, lint, `npm run test:e2e`, `npx playwright test --project=chromium --repeat-each=2`; exit 0.
- [ ] **Commit:** `git add frontend/e2e/expired-session.spec.ts frontend/src/features/auth && git commit -m "test(TASK-123): cobrir expiração de sessão protegida"`.

## Lote 4 — hardening e documentação

### Task 124: TASK-124 — lazy loading (verificação)

**Files:** Modify somente se necessário `frontend/src/app/router/AppRouter.tsx`, `frontend/src/app/router/AppRouter.lazy.test.tsx`; Create `docs/frontend-quality/task-124-lazy-loading.md`.

**Interfaces:** Consumes `React.lazy`/`Suspense`; rotas exigidas: checkout, confirmação, dados, senha, lista e detalhe de pedidos. Produces relatório de chunk e prova sob demanda.

- [ ] **RED/auditoria:** teste que módulos lazy não executam antes da navegação e fallback tem status/nome acessível; rode `npm run build` e liste `dist/assets/*.js` com tamanho.
- [ ] **Confirmar:** teste lazy e build; esperado PASS se já conforme, ou FAIL/ausência de chunk nomeado.
- [ ] **Implementação mínima:** substitua somente imports estáticos descobertos por `lazy(() => import(...).then(module => ({ default: module.NamedPage })))` e `Suspense` estável.
- [ ] **GREEN e gates:** teste lazy, typecheck, lint, build; exit 0; relatório contém chunks e evidência de demanda.
- [ ] **Commit:** `git add frontend/src/app/router docs/frontend-quality/task-124-lazy-loading.md && git commit -m "test(TASK-124): verificar lazy loading das rotas privadas"`.

### Task 125: TASK-125 — performance e bundle

**Files:** Create `frontend/src/shared/testing/profiling.tsx`; Create `frontend/src/app/performance.test.tsx`; Create `docs/frontend-quality/task-125-performance-bundle.md`.

**Interfaces:** Produces `collectProfilerCommits(): { onRender: React.ProfilerOnRenderCallback; commits: Array<{ id: string; phase: string; actualDuration: number }> }`.

- [ ] **RED/medição:** use `<Profiler>` em Home, carrinho com IDs repetidos e pedido com IDs repetidos; execute cada cenário cinco vezes, registre commits e requests baseline; identifique commits com props/query/estado visível idênticos.
- [ ] **Confirmar RED:** `npm test -- src/app/performance.test.tsx`; esperado FAIL somente nas asserções `avoidableCommits === 0` ou requests únicos ainda violadas.
- [ ] **Implementação mínima:** estabilize selector/memo/query apenas onde medido; não otimize sem finding.
- [ ] **GREEN e bundle:** cinco execuções finais, typecheck, lint, build; registre mediana ≤ baseline, uma request por ID único, categorias+catálogo sem waterfall, cada chunk inicial ≤500 kB, rotas lazy separadas e grafo sem caminho lazy→inicial.
- [ ] **Commit:** `git add frontend/src docs/frontend-quality/task-125-performance-bundle.md && git commit -m "test(TASK-125): medir performance e bundle"`.

### Task 126: TASK-126 — privacidade e persistência

**Files:** Create `frontend/src/app/privacy.integration.test.tsx`; Create `docs/frontend-quality/task-126-privacy.md`; Modify limpeza privada somente diante de RED.

**Interfaces:** Consumes `AUTH_STORE_KEY`, `CART_SESSION_STORE_KEY`, private query cleanup e logout/401/cancelamento. Produces inventário exato de chaves e campos permitidos.

- [ ] **RED:** percorra local/session storage após auth, carrinho, checkout, perfil e pedidos; rejeite CPF/endereço/perfil/itens/respostas; espione console; teste logout, 401, cancelamento e request tardia.
- [ ] **Confirmar RED:** teste focado; esperado FAIL se dado proibido persistir/logar/reentrar no cache.
- [ ] **Implementação mínima:** restrinja partialize/cleanup/signal da fronteira culpada; auth contém sessão, carrinho contém somente mapa de IDs.
- [ ] **GREEN e gates:** teste, typecheck e lint; relatório lista chave, storage, campos, origem, limpeza e prova.
- [ ] **Commit:** `git add frontend/src docs/frontend-quality/task-126-privacy.md && git commit -m "test(TASK-126): auditar privacidade e persistência"`.

### Task 127: TASK-127 — responsividade

**Files:** Create `frontend/e2e/responsiveness.spec.ts`; Create `docs/frontend-quality/task-127-responsiveness.md`; Create screenshots under `docs/frontend-quality/screenshots/task-127/`; Modify CSS/componentes somente por finding.

**Interfaces:** Consumes fixture E2E. Viewports exatos: 320, 375, 768, 1024 e 1920 px; cada rota avalia `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

- [ ] **RED/auditoria:** para Home, cadastro, produto, carrinho, checkout, dados, senha, pedidos e detalhe, itere viewports, capture screenshot e afirme overflow/uso de controles/dialogs/formulários.
- [ ] **Confirmar RED:** spec Chromium; esperado FAIL com rota+viewport para cada finding.
- [ ] **Implementação mínima:** corrija CSS/layout proprietário; documente qualquer região horizontal intencional com seletor e motivo.
- [ ] **GREEN e gates:** spec, E2E Chromium, typecheck, lint e build; exit 0; relatório referencia todas as screenshots.
- [ ] **Commit:** `git add frontend/e2e/responsiveness.spec.ts frontend/src docs/frontend-quality/task-127-responsiveness.md docs/frontend-quality/screenshots/task-127 && git commit -m "test(TASK-127): auditar responsividade das rotas"`.

### Task 128: TASK-128 — acessibilidade

**Files:** Create `frontend/e2e/accessibility.spec.ts`; Create `docs/frontend-quality/task-128-accessibility.md`; Modify UI/CSS somente por finding.

**Interfaces:** Consumes jornadas/rotas e semântica existente. Produces checklist por rota: teclado, foco, nomes/roles/landmarks/headings, anúncios, contraste WCAG AA e movimento reduzido.

- [ ] **RED/auditoria:** navegue apenas por teclado; afirme foco visível/restaurado, landmarks/headings e live regions; meça contraste com luminância relativa (4.5:1 texto normal, 3:1 texto grande/UI); execute auditoria automatizada disponível no projeto ou instale `@axe-core/playwright` como dev dependency e falhe em impacto serious/critical.
- [ ] **Confirmar RED:** spec Chromium; esperado FAIL detalhado por rota/regra quando houver finding.
- [ ] **Implementação mínima:** corrija semântica, foco, tokens de contraste ou `prefers-reduced-motion` dono; não reformule identidade visual.
- [ ] **GREEN e gates:** spec, E2E, typecheck, lint e build; exit 0; checklist manual completo no relatório.
- [ ] **Commit:** `git add frontend/package.json frontend/package-lock.json frontend/e2e/accessibility.spec.ts frontend/src docs/frontend-quality/task-128-accessibility.md && git commit -m "test(TASK-128): auditar acessibilidade das jornadas"`.

### Task 129: TASK-129 — README do frontend

**Files:** Create `frontend/README.md`.

**Interfaces:** Documents Node/npm versions obtidas de `package.json`/lock, `VITE_API_BASE_URL`, `VITE_ENABLE_MSW`, scripts reais e containers `shop-api-app`/`shop-api-db` com PostgreSQL `shopapi/shopapi/shopapi`.

- [ ] **RED/documentação:** em checkout temporário limpo, siga os comandos atuais sem conhecimento externo e registre comandos ausentes/ambíguos.
- [ ] **Confirmar RED:** `npm ci && npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build`; esperado exit 0 para comandos válidos; qualquer divergência vira correção documental, não mudança silenciosa de script.
- [ ] **Implementação mínima:** escreva requisitos/versões, instalação, env, MSW opt-in, API+Docker/PostgreSQL, scripts, testes/E2E/build, troubleshooting e política local (auth session/local conforme escolha; carrinho somente mapa de IDs; dados privados não persistem).
- [ ] **GREEN e gates do lote:** repita em checkout limpo os comandos documentados; esperado exit 0 e instruções sem etapas implícitas.
- [ ] **Commit:** `git add frontend/README.md && git commit -m "docs(TASK-129): documentar operação do frontend"`.

## Lote 5 — gate final

### Task 130: TASK-130 — gate final do MVP

**Files:** Create `docs/frontend-quality/task-130-final-gate.md`; não modificar produto nesta task.

**Interfaces:** Consumes HEAD com TASK-106–129 DONE. Produces relatório com commit, SO, Node/npm/Chromium, contagens, duração, exit code e `git status`.

- [ ] **Pré-gate:** confirme checkout limpo com `git status --porcelain` sem saída e rejeite focos com `rg -n "\.(only|skip)\(" frontend/src frontend/e2e`; esperado nenhuma ocorrência não justificada.
- [ ] **Instalação limpa:** remova somente `frontend/node_modules` no checkout isolado e execute `npm ci`; esperado exit 0.
- [ ] **Gate:** cronometre separadamente `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e` e `npm run build`; esperado exit 0, sem console error, unhandled rejection ou request inesperada.
- [ ] **Tratamento de falha:** pare, registre comando/saída e reabra a task proprietária; não corrija produto em TASK-130. Após correção aprovada, reinicie todos os comandos desde `npm ci`.
- [ ] **Evidência e commit:** registre contagens/durações/ambiente/commit e `git status --porcelain` vazio antes do relatório; então `git add docs/frontend-quality/task-130-final-gate.md && git commit -m "test(TASK-130): registrar gate final do MVP"` e confirme status limpo.

## Self-review

- Cobertura: TASK-106–110 fecham contratos/formatadores/stores/primitives; TASK-111–116 cobrem seis integrações MSW; TASK-117–123 cobrem infraestrutura e sete jornadas; TASK-124–129 cobrem lazy loading, performance, privacidade, responsividade, acessibilidade e operação; TASK-130 executa o gate integral.
- Fronteiras: testes isolados não repetem wiring; integrações não substituem E2E; TASK-117 é a única dona da fixture; TASK-124 verifica lazy e TASK-125 mede bundle; TASK-127 precede TASK-128; TASK-130 não corrige produto.
- Placeholders: a busca pelos padrões proibidos do skill retornou zero ocorrências; todos os passos nomeiam arquivo, ação, comando e resultado.
- Consistência: `test/expect/backend`, `backend.count/reset/assertNoUnexpectedRequests` e `collectProfilerCommits` são definidos antes de seus consumidores; chaves de storage usam os exports existentes.
- Gates: cada task contém teste focado, resultado esperado, implementação mínima, GREEN, gates pertinentes e commit rastreável.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-15-fase-8-testes-hardening.md`. Execute com `superpowers:subagent-driven-development` (recomendado, um agente fresco e revisão por task) ou `superpowers:executing-plans` (execução em lotes com checkpoints), sempre respeitando os gates e writers sequenciais do checkout compartilhado.
