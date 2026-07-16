# TASK-125 Performance Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produzir evidência reproduzível de renders, requests e grafo do build, eliminar somente desperdícios comprovados e reduzir todo JavaScript inicial para no máximo 500000 bytes sem quebrar paralelismo, deduplicação ou as seis rotas lazy.

**Architecture:** Um teste de auditoria usa React Profiler e MSW para medir três cargas frias reais cinco vezes no mesmo ambiente. O bootstrap é extraído para uma função assíncrona testável que inicia MSW antes de renderizar, sem top-level await. Um script Node lê o manifesto/build do Vite, classifica o grafo estático inicial e os seis chunks lazy e aplica limites determinísticos.

**Tech Stack:** React 19 Profiler, TanStack Query 5, Vitest 4.1.10, Testing Library, MSW 2, Vite 6.4.3, TypeScript 5.7, Node v26.3.1, npm 11.16.0.

## Global Constraints

- `BASE_COMMIT` é `7e62aad12e002ac3a6de069d42ca6e3ab32aee69`.
- Executar Home, carrinho e detalhe de pedido cinco vezes no mesmo ambiente e registrar mediana antes e depois.
- Uma otimização de render só é permitida quando o baseline comprovar commits repetidos com props, query data e estado visível iguais.
- Cada carga fria de carrinho e pedido deve emitir uma request por ID único; categorias e catálogo devem iniciar sem waterfall.
- Cada arquivo JavaScript inicial deve ter no máximo `500000` bytes não comprimidos.
- Checkout, confirmação, dados, senha, lista de pedidos e detalhe de pedido devem permanecer em seis chunks lazy separados.
- O entry não pode alcançar estaticamente módulos exclusivos das rotas lazy.
- Não elevar `chunkSizeWarningLimit`, não mascarar o resultado e não adicionar `manualChunks` sem evidência.
- Preservar `Promise.all`, `Set`/IDs únicos, query keys estáveis e `ensureQueryData`.
- Toda mudança de comportamento segue RED, confirmação da falha, GREEN mínimo e refactor somente após verde.
- Medir commits lógicos de produção sem `StrictMode`, usando configuração idêntica antes/depois.
- Descartar um warmup por cenário, medir cinco amostras e rotacionar deterministicamente a ordem dos cenários.
- Somente commits consecutivos com fingerprint semântico idêntico contam como redundantes.

---

## File map

- Create `frontend/src/performance/renderPerformance.audit.test.tsx`: harness do Profiler, cinco amostras por cenário, contagem de requests, medianas e relatório baseline/final.
- Create `frontend/scripts/verify-production-graph.mjs`: valida bytes dos chunks iniciais, seis chunks lazy e ausência de alcance estático pelo entry.
- Create `frontend/src/bootstrap.tsx`: função assíncrona de bootstrap com dependências injetáveis e tratamento da falha do MSW.
- Create `frontend/src/bootstrap.test.tsx`: contrato RED/GREEN de ordem, render único e falha segura do MSW.
- Modify `frontend/src/main.tsx`: invoca o bootstrap sem top-level await.
- Modify `frontend/src/features/catalog/pages/HomePage.tsx`: somente se o baseline comprovar observer/commit redundante.
- Modify `frontend/src/features/cart/pages/CartPage.tsx`: somente se o baseline comprovar commit semanticamente repetido.
- Modify `frontend/src/features/orders/pages/OrderDetailPage.tsx`: somente se o baseline comprovar commit semanticamente repetido.
- Modify `frontend/vite.config.ts`: habilita manifesto e remove `vite-plugin-top-level-await`.
- Modify `frontend/package.json`: remove o plugin e adiciona scripts de auditoria.
- Modify `frontend/package-lock.json`: atualização gerada por `npm uninstall`.
- Create `.superpowers/task-125-performance-report.md`: ambiente, cinco amostras antes/depois, medianas, requests, decisões, chunks e grafo.

### Task 1: Criar o harness e capturar o baseline imutável

**Files:**
- Create: `frontend/src/performance/renderPerformance.audit.test.tsx`
- Create: `.superpowers/task-125-performance-report.md`

**Interfaces:**
- Consumes: páginas reais, `QueryClient`, `Profiler`, MSW e handlers existentes.
- Produces: `ProfileSample`, `ScenarioReport` e três cenários executados exatamente cinco vezes.

- [ ] **Step 1: Escrever o harness com contratos explícitos**

Definir no teste:

```tsx
type CommitSample = {
  phase: 'mount' | 'update' | 'nested-update'
  actualDuration: number
  baseDuration: number
  fingerprint: string
}

type ProfileSample = {
  commits: CommitSample[]
  requests: string[]
  visibleState: string
}

const SAMPLE_COUNT = 5
const WARMUP_COUNT = 1

function median(values: readonly number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}
```

Renderizar sem `StrictMode`. O callback do `<Profiler id={scenario} onRender={...}>` deve guardar durações e correlacionar cada commit a uma serialização estável de:

```tsx
type SemanticSnapshot = {
  phase: CommitSample['phase']
  visibleDom: string
  queryState: Array<{ key: string; status: string; fetchStatus: string; data: unknown }>
  relevantProps: Record<string, unknown>
}

function semanticFingerprint(snapshot: SemanticSnapshot) {
  return JSON.stringify(snapshot)
}

function isRedundant(previous: CommitSample | undefined, current: CommitSample) {
  return previous?.fingerprint === current.fingerprint
}
```

Normalizar o DOM removendo atributos voláteis e espaços irrelevantes, preservando textos, roles, disabled/checked e ordem/quantidade de itens. Ordenar query keys e objetos. Somente commits consecutivos idênticos são redundantes.

Centralizar no próprio arquivo de auditoria os IDs usados pelos fixtures:

```tsx
const PERFORMANCE_FIXTURES = {
  home: { customerIds: [] },
  cart: { customerIds: [20], cartId: 900, productIds: [5, 5, 9] },
  order: { customerIds: [7], orderId: 41, productIds: [5, 5, 9] },
} as const

const measuredCustomerIds = [
  ...new Set(Object.values(PERFORMANCE_FIXTURES).flatMap(({ customerIds }) => customerIds)),
]
```

Os mesmos IDs devem alimentar sessão, respostas MSW e limpeza. Não criar helper global: a lista pertence exclusivamente ao harness. Se um cenário ganhar outro `customerId`, atualizar este fixture central.

Cada amostra deve criar novo router/history e `QueryClient`, e executar o reset completo:

```tsx
await queryClient.cancelQueries()
queryClient.clear()
useAuthStore.getState().clearSession()
useCartSessionStore.setState({ cartIdsByCustomer: {} })
for (const customerId of measuredCustomerIds) {
  clearCustomerPrivateSnapshots(customerId)
}
server.resetHandlers()
requestLedger.length = 0
vi.clearAllTimers()
vi.useRealTimers()
vi.clearAllMocks()
cleanup()
```

- [ ] **Step 2: Implementar o cenário Home sem waterfall**

Usar duas promises controladas para `/categoria` e `/produto`. Depois de `render`, aguardar ambas as requests terem iniciado antes de resolver qualquer uma:

```tsx
expect(requests).toEqual(expect.arrayContaining(['GET /categoria', 'GET /produto?page=1&size=20']))
resolveCategories()
resolveCatalog()
expect(await screen.findByText('Teclado mecânico')).toBeInTheDocument()
```

Executar cinco vezes, registrar commits/durações e falhar se categorias só iniciar depois da resolução do catálogo.

- [ ] **Step 3: Implementar o cenário frio do carrinho com IDs repetidos**

Usar itens com `productId` `[5, 5, 9]`, cache novo a cada amostra e handlers reais. A asserção obrigatória é:

```tsx
expect(productRequests.sort()).toEqual([
  'GET /produto/5',
  'GET /produto/9',
])
```

Confirmar que os três itens visíveis permanecem renderizados e registrar o snapshot textual como `visibleState`.

- [ ] **Step 4: Implementar o cenário frio do detalhe com IDs repetidos**

Responder o pedido com produtos `[5, 5, 9]`, usar cache novo e exigir:

```tsx
expect(productRequests.sort()).toEqual([
  'GET /produto/5',
  'GET /produto/9',
])
```

Confirmar itens, status e total visíveis antes de concluir cada amostra.

- [ ] **Step 5: Executar e registrar o baseline antes de qualquer otimização**

Executar um warmup descartado por cenário. Nas cinco rodadas medidas, rotacionar:

```text
1: Home → Carrinho → Pedido
2: Carrinho → Pedido → Home
3: Pedido → Home → Carrinho
4: Home → Carrinho → Pedido
5: Carrinho → Pedido → Home
```

Run:

```powershell
npm --prefix frontend test -- src/performance/renderPerformance.audit.test.tsx --reporter=verbose
```

Expected: PASS; saída contendo warmup descartado e cinco amostras medidas por cenário:

```text
amostra | commits | fingerprints | redundantes consecutivos | actualDuration total | baseDuration total | requests
mediana de commits | mediana de actualDuration | mínimo/máximo e dispersão
```

Registrar Node `v26.3.1`, npm `11.16.0`, Vite `6.4.3` e Vitest `4.1.10`.

- [ ] **Step 6: Classificar commits semanticamente repetidos**

Comparar os fingerprints consecutivos correlacionados ao Profiler:

```text
CONFIRMADO: commits consecutivos têm phase, DOM/estado visível, query status/data e props relevantes idênticos.
NÃO CONFIRMADO: não existem fingerprints consecutivos idênticos.
```

`actualDuration` não decide essa classificação. Não modificar produto nesta task do plano.

- [ ] **Step 7: Commitar o baseline**

```powershell
git add frontend/src/performance/renderPerformance.audit.test.tsx .superpowers/task-125-performance-report.md
git commit -m "test(TASK-125): Medir baseline de renderizações"
```

### Task 2: Eliminar somente renders redundantes comprovados

**Files:**
- Modify conditionally: `frontend/src/features/catalog/pages/HomePage.tsx`
- Modify conditionally: `frontend/src/features/cart/pages/CartPage.tsx`
- Modify conditionally: `frontend/src/features/orders/pages/OrderDetailPage.tsx`
- Modify: `frontend/src/performance/renderPerformance.audit.test.tsx`
- Modify: `.superpowers/task-125-performance-report.md`

**Interfaces:**
- Consumes: baseline e classificação da Task 1.
- Produces: medianas finais não superiores ao baseline, com os mesmos estados e requests.

- [ ] **Step 1: Criar um RED para o observer da Home somente se confirmado**

Se o relatório marcou a Home como `CONFIRMADO`, adicionar uma asserção semântica:

```tsx
expect(consecutiveDuplicateFingerprints).toHaveLength(0)
```

Run:

```powershell
npm --prefix frontend test -- src/performance/renderPerformance.audit.test.tsx -t "Home"
```

Expected: FAIL porque há mais de um commit com estado estável idêntico. Se o baseline não confirmar, registrar “Home sem alteração” e pular os Steps 1–3.

- [ ] **Step 2: Aplicar o GREEN mínimo na Home**

Substituir a observação redundante apenas pela menor forma comprovada que preserve canonicalização. Preferir derivar uma string estável:

```tsx
const currentSearch = searchParams.toString()

useEffect(() => {
  if (currentSearch === canonicalSearch) return
  void navigate(/* destino existente */, { replace: true })
}, [canonicalSearch, currentSearch, location.pathname, navigate])
```

Não remover canonicalização de URLs inválidas.

- [ ] **Step 3: Confirmar GREEN da Home**

Executar o teste focado. Expected: PASS, mesmas duas requests paralelas e mesmo estado visível.

- [ ] **Step 4: Criar RED/GREEN para carrinho somente se confirmado**

Se `CartPage` tiver fingerprint consecutivo repetido, escrever primeiro:

```tsx
expect(consecutiveDuplicateFingerprints).toHaveLength(0)
```

Run esperado: FAIL. Aplicar somente memoização derivada comprovadamente necessária, por exemplo:

```tsx
const productsById = useMemo(
  () => new Map((productsQuery.data ?? []).map((result) => [result.productId, result])),
  [productsQuery.data],
)
```

Não alterar `uniqueSortedProductIds`, `Promise.all`, query key ou `ensureQueryData`. Reexecutar e exigir PASS. Se não confirmado, não tocar em `CartPage.tsx`.

- [ ] **Step 5: Criar RED/GREEN para pedido somente se confirmado**

Seguir o mesmo ciclo para `OrderDetailPage`, sem alterar a ordem/duplicação dos itens apresentados nem `useOrderProductsQuery`. Se não confirmado, não tocar no arquivo.

- [ ] **Step 6: Capturar cinco amostras finais**

Executar os três cenários novamente no mesmo ambiente. Para cada cenário:

```tsx
expect(finalMedianActualDuration).toBeLessThanOrEqual(baselineMedianActualDuration)
```

Registrar valores brutos, mediana antes/depois, fingerprints eliminados ou “nenhuma mudança necessária”, e confirmar requests idênticas. Duração é evidência e requisito do backlog, não o único RED/gate.

Registrar ruído/dispersão. Se ocorrer inversão pequena sem regressão semântica, repetir uma única vez o protocolo completo com mesma rotação e ambiente, registrando ambas as execuções. A aprovação ainda exige mediana final `<=` baseline; não relaxar tolerância nem selecionar amostras.

- [ ] **Step 7: Commitar apenas otimizações comprovadas**

```powershell
git add frontend/src/performance/renderPerformance.audit.test.tsx frontend/src/features/catalog/pages/HomePage.tsx frontend/src/features/cart/pages/CartPage.tsx frontend/src/features/orders/pages/OrderDetailPage.tsx .superpowers/task-125-performance-report.md
git commit -m "perf(TASK-125): Eliminar renderizações redundantes"
```

Usar `git add` somente nos arquivos realmente alterados; não criar commit vazio quando nenhuma otimização for necessária.

### Task 3: Remover top-level await com bootstrap seguro

**Files:**
- Create: `frontend/src/bootstrap.test.tsx`
- Create: `frontend/src/bootstrap.tsx`
- Modify: `frontend/src/main.tsx`

**Interfaces:**
- Consumes: `enableMocking`, elemento `#root`, `createRoot` e árvore da aplicação.
- Produces: `bootstrap(options?: BootstrapOptions): Promise<void>`.

- [ ] **Step 1: Escrever testes RED do bootstrap**

Modelar dependências sem mocks globais:

```tsx
type BootstrapOptions = {
  enableMocking?: () => Promise<void>
  getRootElement?: () => HTMLElement | null
  render?: (root: HTMLElement) => void
  reportMockingFailure?: (message: string, error: unknown) => void
}
```

Cobrir:

```tsx
it('awaits mocking before rendering exactly once', async () => {
  // resolve controlado; render continua 0 antes e 1 depois
})

it('reports a mocking startup failure and still renders exactly once', async () => {
  // enableMocking rejeita; report recebe erro; render ocorre uma vez
})

it('does not leak an unhandled rejection when mocking startup fails', async () => {
  const unhandled = vi.fn()
  process.on('unhandledRejection', unhandled)
  try {
    await bootstrap({ enableMocking: () => Promise.reject(new Error('worker')) })
    await Promise.resolve()
    expect(unhandled).not.toHaveBeenCalled()
  } finally {
    process.off('unhandledRejection', unhandled)
  }
})

it('rejects with the existing root error when #root is absent', async () => {
  await expect(bootstrap({ getRootElement: () => null })).rejects.toThrow(
    'Elemento raiz da aplicação não encontrado.',
  )
})
```

- [ ] **Step 2: Executar RED**

Run:

```powershell
npm --prefix frontend test -- src/bootstrap.test.tsx
```

Expected: FAIL porque `bootstrap.tsx`/`bootstrap` ainda não existe.

- [ ] **Step 3: Implementar o GREEN mínimo**

Em `bootstrap.tsx`, manter a árvore existente e capturar somente falha de MSW:

```tsx
export async function bootstrap(options: BootstrapOptions = {}) {
  const startMocking = options.enableMocking ?? enableMocking
  try {
    await startMocking()
  } catch (error) {
    const reportMockingFailure = options.reportMockingFailure
      ?? ((message: string, cause: unknown) => console.error(message, cause))
    reportMockingFailure('Falha ao iniciar MSW.', error)
  }

  const rootElement = (options.getRootElement ?? (() => document.getElementById('root')))()
  if (!rootElement) throw new Error('Elemento raiz da aplicação não encontrado.')

  ;(options.render ?? renderApplication)(rootElement)
}
```

`renderApplication` deve conter exatamente o `createRoot(...).render(<StrictMode>...)` atual.

Em `main.tsx`, remover o `await` e invocar:

```tsx
import { bootstrap } from './bootstrap'

void bootstrap()
```

- [ ] **Step 4: Executar GREEN e regressões de mocking**

```powershell
npm --prefix frontend test -- src/bootstrap.test.tsx src/shared/testing/enableMocking.test.ts
```

Expected: PASS, sem rejeição não tratada.

- [ ] **Step 5: Commitar o bootstrap**

```powershell
git add frontend/src/bootstrap.tsx frontend/src/bootstrap.test.tsx frontend/src/main.tsx
git commit -m "perf(TASK-125): Remover await do bootstrap"
```

### Task 4: Remover o plugin e criar auditoria reproduzível do grafo

**Files:**
- Create: `frontend/scripts/verify-production-graph.mjs`
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`

**Interfaces:**
- Consumes: `frontend/dist/.vite/manifest.json` e arquivos em `frontend/dist/assets`.
- Produces: script `verify:production-graph` com exit code não zero para qualquer violação.

- [ ] **Step 1: Escrever primeiro o verificador e observar RED no build atual**

O script deve:

```js
const INITIAL_LIMIT_BYTES = 500_000
const lazySources = [
  'src/features/checkout/pages/CheckoutPage.tsx',
  'src/features/checkout/pages/OrderConfirmationPage.tsx',
  'src/features/customer/pages/CustomerDataPage.tsx',
  'src/features/customer/pages/CustomerPasswordPage.tsx',
  'src/features/orders/pages/OrdersPage.tsx',
  'src/features/orders/pages/OrderDetailPage.tsx',
]
```

Carregar o manifesto, localizar `src/main.tsx`, percorrer recursivamente somente `imports`, nunca `dynamicImports`, e:

```js
assert(initialFiles.every(({ bytes }) => bytes <= INITIAL_LIMIT_BYTES))
assert(lazySources.every((source) => manifest[source]?.isDynamicEntry === true))
assert(new Set(lazySources.map((source) => manifest[source].file)).size === 6)
assert(lazySources.every((source) => !staticReachable.has(source)))
```

Imprimir entry, todos os JS iniciais/bytes, seis lazy sources/chunks e arestas estáticas auditadas.

Habilitar temporariamente `build.manifest: true`, executar:

```powershell
npm --prefix frontend run build
node frontend/scripts/verify-production-graph.mjs
```

Expected: FAIL informando entry de `728165` bytes no baseline conhecido.

- [ ] **Step 2: Remover o plugin da configuração**

Remover de `vite.config.ts`:

```tsx
import topLevelAwait from 'vite-plugin-top-level-await'
```

e toda chamada `topLevelAwait(...)`, mantendo `react()`, `tailwindcss()` e:

```tsx
build: { manifest: true }
```

- [ ] **Step 3: Remover dependência e atualizar lock**

Run:

```powershell
npm --prefix frontend uninstall --save-dev vite-plugin-top-level-await
```

Expected: `package.json` e `package-lock.json` sem `vite-plugin-top-level-await`.

- [ ] **Step 4: Adicionar scripts reproduzíveis**

Em `package.json`:

```json
"verify:production-graph": "node scripts/verify-production-graph.mjs",
"audit:performance": "npm run build && npm run verify:production-graph"
```

- [ ] **Step 5: Executar GREEN do build/grafo**

```powershell
npm --prefix frontend run audit:performance
```

Expected:

- build Vite com exit code zero;
- cada JS inicial `<= 500000` bytes;
- entry esperado próximo do experimento de `463343` bytes, sem transformar esse valor experimental em limite;
- seis arquivos lazy distintos;
- nenhuma source lazy no fecho de imports estáticos do entry.

- [ ] **Step 6: Provar que o verificador falha de verdade**

Executar cópia temporária do manifesto/asset com um arquivo inicial acima do limite ou teste unitário do script, conforme a menor abordagem. A saída esperada deve conter `exceeds 500000 bytes`. Restaurar/remover o fixture temporário antes do commit.

- [ ] **Step 7: Commitar build e verificador**

```powershell
git add frontend/scripts/verify-production-graph.mjs frontend/vite.config.ts frontend/package.json frontend/package-lock.json
git commit -m "perf(TASK-125): Reduzir grafo JavaScript inicial"
```

### Task 5: Consolidar relatório e gates

**Files:**
- Modify: `.superpowers/task-125-performance-report.md`

**Interfaces:**
- Consumes: resultados finais das Tasks 1–4.
- Produces: evidência completa e reproduzível da TASK-125.

- [ ] **Step 1: Completar a tabela antes/depois**

Registrar para cada cenário warmup descartado, ordem rotacionada, cinco amostras brutas, fingerprints, redundâncias consecutivas, mediana de commits e `actualDuration`, dispersão/ruído, requests exatas, estado visível e decisão. A mediana final não pode superar a baseline.

- [ ] **Step 2: Completar a auditoria do bundle**

Registrar:

- ambiente exato;
- baseline entry `728165` bytes;
- referência experimental esbuild `463343` bytes;
- entry/chunks finais com bytes não comprimidos;
- seis pares source → chunk lazy;
- resultado do fecho estático;
- confirmação de ausência de `vite-plugin-top-level-await` em config, package e lock.

- [ ] **Step 3: Executar testes focados**

```powershell
npm --prefix frontend test -- src/performance/renderPerformance.audit.test.tsx src/bootstrap.test.tsx src/shared/testing/enableMocking.test.ts src/features/catalog/pages/HomePage.test.tsx src/features/cart/queries/useCartProductsQuery.test.tsx src/features/orders/queries/useOrderProductsQuery.test.tsx src/app/router/AppRouter.lazy.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Executar gates completos**

```powershell
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run audit:performance
git diff --check 7e62aad12e002ac3a6de069d42ca6e3ab32aee69..HEAD
git status --short
```

Expected: todos exit code zero; `git status --short` mostra somente o relatório ainda não commitado.

- [ ] **Step 5: Commitar o relatório final**

```powershell
git add .superpowers/task-125-performance-report.md
git commit -m "test(TASK-125): Registrar auditoria de performance"
```

- [ ] **Step 6: Verificação final de limpeza**

```powershell
git diff --check 7e62aad12e002ac3a6de069d42ca6e3ab32aee69..HEAD
git status --short
```

Expected: diff-check sem saída e worktree limpa.
