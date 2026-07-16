# TASK-124 Lazy Routes Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Concluir a TASK-124 comprovando que checkout, confirmação, dados pessoais, senha, lista e detalhe de pedidos carregam sob demanda, com fallback acessível e geometria estável, sem código dessas páginas no chunk inicial.

**Architecture:** Preservar os seis `React.lazy` existentes e corrigir somente os dois critérios que falham no BASE_COMMIT: geometria do checkout e fallback específico da confirmação. Depois, usar o build de produção como contrato auditável, localizando os seis chunks por prefixo e verificando marcadores exclusivos dentro do chunk correto e ausentes no entry inicial.

**Tech Stack:** React 19, React Router 7, TypeScript 5.7, Vitest/Testing Library e Vite 6.

## Global Constraints

- Trabalhar somente no frontend da TASK-124.
- `BASE_COMMIT` é `6fbac40f1aac9ee806bec103e4cf7110366be237`.
- Aplicar TDD estrito: executar o RED correto antes de alterar `AppRouter.tsx`.
- Manter imports dinâmicos individuais para as seis páginas; não agrupar rotas no mesmo import.
- Todo fallback deve ter `role="status"`, nome acessível, `aria-live="polite"` e `min-h-96`.
- A confirmação deve anunciar `Carregando confirmação do pedido`, não `Carregando checkout`.
- Não modificar páginas de feature, layouts, guards, contratos ou comportamento de navegação.
- Não adicionar `manualChunks`, não elevar `chunkSizeWarningLimit` e não tentar resolver nesta task o entry acima de 500 kB.
- Registrar o warning de chunk inicial acima de 500 kB para a TASK-125.
- Gates obrigatórios: teste focado RED/GREEN, suíte unitária, typecheck, lint, build, auditoria dos seis chunks, auditoria de ausência no entry inicial e `git diff --check`.

---

## File map

- Modify: `frontend/src/app/router/AppRouter.lazy.test.tsx` — acrescentar o RED da geometria do checkout e a prova específica da confirmação lazy.
- Modify: `frontend/src/app/router/AppRouter.tsx` — aplicar fallback estável ao checkout e fallback próprio à confirmação.
- Modify after approval: `docs/frontend-tasks-v2.md` — marcar TASK-124 `DONE`, registrar commits, testes, chunks, auditoria do entry e warning delegado à TASK-125.
- Read only: `frontend/dist/assets/*.js` — artefatos gerados usados na auditoria; não versionar `frontend/dist`.

### Task 1: Provar as duas lacunas de fallback

**Files:**
- Modify: `frontend/src/app/router/AppRouter.lazy.test.tsx`
- Test: `frontend/src/app/router/AppRouter.lazy.test.tsx`

**Interfaces:**
- Consumes: `AppRouter()` e as rotas `/checkout` e `/pedido-confirmado/:pedidoId`.
- Produces: contrato de fallback com geometria estável para checkout e nome específico para confirmação.

- [ ] **Step 1: Adicionar o mock da confirmação**

Imediatamente depois do mock de `CheckoutPage`, adicionar:

```tsx
vi.mock('../../features/checkout/pages/OrderConfirmationPage', () => ({
  OrderConfirmationPage: () => <h1>Confirmação carregada</h1>,
}))
```

- [ ] **Step 2: Tornar explícita a geometria esperada do checkout**

No teste `shows an accessible fallback while loading checkout on demand`, substituir a asserção do status por:

```tsx
expect(screen.getByRole('status', { name: 'Carregando checkout' })).toHaveClass('min-h-96')
```

- [ ] **Step 3: Adicionar o teste da confirmação**

Depois do teste de checkout, adicionar:

```tsx
it('loads order confirmation with its own accessible stable fallback', async () => {
  render(
    <MemoryRouter initialEntries={['/pedido-confirmado/41']}>
      <AppRouter />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('status', { name: 'Carregando confirmação do pedido' }),
  ).toHaveClass('min-h-96')
  expect(
    await screen.findByRole('heading', { name: 'Confirmação carregada' }),
  ).toBeInTheDocument()
})
```

- [ ] **Step 4: Executar o teste focado e confirmar o RED**

Run:

```powershell
npm --prefix frontend test -- src/app/router/AppRouter.lazy.test.tsx
```

Expected: FAIL pelos dois motivos de produto, não por configuração:

- o status `Carregando checkout` não contém `min-h-96`;
- não existe status com nome `Carregando confirmação do pedido`, pois a confirmação ainda reutiliza `Carregando checkout`.

Se qualquer teste novo passar antes da alteração de produção, interromper e corrigir o teste para que ele prove o critério ausente.

### Task 2: Aplicar o GREEN mínimo no roteador

**Files:**
- Modify: `frontend/src/app/router/AppRouter.tsx`
- Test: `frontend/src/app/router/AppRouter.lazy.test.tsx`

**Interfaces:**
- Consumes: `Suspense`, `ReactNode` e os seis componentes lazy já declarados.
- Produces: fallback de checkout estável e `OrderConfirmationRouteFallback` específico.

- [ ] **Step 1: Estabilizar a geometria do checkout**

Substituir `CheckoutRouteFallback` por:

```tsx
function CheckoutRouteFallback() {
  return (
    <div
      role="status"
      aria-label="Carregando checkout"
      aria-live="polite"
      className="surface min-h-96 p-6"
    >
      Carregando checkout…
    </div>
  )
}
```

- [ ] **Step 2: Criar fallback específico da confirmação**

Imediatamente depois de `CheckoutRouteFallback`, adicionar:

```tsx
function OrderConfirmationRouteFallback() {
  return (
    <div
      role="status"
      aria-label="Carregando confirmação do pedido"
      aria-live="polite"
      className="surface min-h-96 p-6"
    >
      Carregando confirmação do pedido…
    </div>
  )
}
```

- [ ] **Step 3: Permitir que o wrapper receba o fallback correto**

Substituir `LazyCheckoutRoute` por:

```tsx
function LazyCheckoutRoute({
  children,
  fallback = <CheckoutRouteFallback />,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}
```

- [ ] **Step 4: Usar o fallback específico somente na confirmação**

Na rota `pedido-confirmado/:pedidoId`, substituir o wrapper por:

```tsx
<LazyCheckoutRoute fallback={<OrderConfirmationRouteFallback />}>
  <OrderConfirmationPage />
</LazyCheckoutRoute>
```

Não alterar as outras cinco rotas lazy.

- [ ] **Step 5: Executar o teste focado e confirmar GREEN**

Run:

```powershell
npm --prefix frontend test -- src/app/router/AppRouter.lazy.test.tsx
```

Expected: PASS em 6/6 testes. Cada rota exibe seu status acessível antes do heading mockado; todos os fallbacks possuem `min-h-96`.

- [ ] **Step 6: Criar o commit funcional**

```powershell
git add frontend/src/app/router/AppRouter.tsx frontend/src/app/router/AppRouter.lazy.test.tsx
git commit -m "feat(TASK-124): Estabilizar fallbacks de rotas lazy"
```

Expected: commit criado contendo somente o roteador e seu teste.

### Task 3: Auditar os seis chunks e o entry inicial

**Files:**
- Read: `frontend/dist/assets/*.js`
- Do not commit: `frontend/dist`

**Interfaces:**
- Consumes: saída de `vite build`.
- Produces: evidência reproduzível de seis chunks lazy separados e ausência de código exclusivo das páginas no entry inicial.

- [ ] **Step 1: Gerar build limpo**

Run:

```powershell
npm --prefix frontend run build
```

Expected: exit code `0`; o Vite esvazia seu `outDir` antes da geração e produz seis arquivos JavaScript com os prefixos abaixo e um `index-*.js`:

```text
CheckoutPage-*.js
OrderConfirmationPage-*.js
CustomerDataPage-*.js
CustomerPasswordPage-*.js
OrdersPage-*.js
OrderDetailPage-*.js
index-*.js
```

O warning de entry acima de 500 kB deve ser copiado para a evidência da TASK-124 como pendência da TASK-125. Não modificar Vite para removê-lo.

- [ ] **Step 2: Confirmar exatamente um chunk por rota**

Run:

```powershell
$prefixes = @(
  'CheckoutPage',
  'OrderConfirmationPage',
  'CustomerDataPage',
  'CustomerPasswordPage',
  'OrdersPage',
  'OrderDetailPage'
)

foreach ($prefix in $prefixes) {
  $files = @(Get-ChildItem "frontend/dist/assets/$prefix-*.js")
  if ($files.Count -ne 1) {
    throw "Esperado 1 chunk para $prefix; encontrado: $($files.Count)"
  }
  Write-Output "$prefix=$($files[0].Name)"
}
```

Expected: seis linhas, cada uma com um arquivo diferente; nenhum `throw`.

- [ ] **Step 3: Confirmar os marcadores exclusivos no chunk correto**

Run:

```powershell
$markers = [ordered]@{
  CheckoutPage = 'Não foi possível confirmar o pedido'
  OrderConfirmationPage = 'Pedido criado'
  CustomerDataPage = 'Meus dados'
  CustomerPasswordPage = 'Senha alterada com sucesso.'
  OrdersPage = 'Nenhum pedido encontrado'
  OrderDetailPage = 'O cancelamento não foi aceito'
}

foreach ($prefix in $markers.Keys) {
  $file = (Get-ChildItem "frontend/dist/assets/$prefix-*.js").FullName
  if (-not (Select-String -LiteralPath $file -SimpleMatch $markers[$prefix] -Quiet)) {
    throw "Marcador ausente no chunk $prefix"
  }
  Write-Output "$prefix=marker-present"
}
```

Expected: seis linhas `prefix=marker-present`; nenhum `throw`.

- [ ] **Step 4: Confirmar ausência dos seis marcadores no entry inicial**

Run:

```powershell
$entry = (Get-ChildItem 'frontend/dist/assets/index-*.js').FullName
$markers = @(
  'Não foi possível confirmar o pedido',
  'Pedido criado',
  'Meus dados',
  'Senha alterada com sucesso.',
  'Nenhum pedido encontrado',
  'O cancelamento não foi aceito'
)

foreach ($marker in $markers) {
  if (Select-String -LiteralPath $entry -SimpleMatch $marker -Quiet) {
    throw "Marcador de rota lazy vazou para o entry: $marker"
  }
}
Write-Output 'initial-entry=clean'
```

Expected: uma linha `initial-entry=clean`; nenhum `throw`.

Se a auditoria falhar, não configurar chunks manualmente de imediato. Primeiro inspecionar o grafo de imports da página afetada e aplicar o menor ajuste coberto por teste.

### Task 4: Executar regressão e preparar evidência

**Files:**
- Modify after independent approval: `docs/frontend-tasks-v2.md`

**Interfaces:**
- Consumes: commit funcional aprovado e saídas reais dos gates.
- Produces: registro rastreável da TASK-124.

- [ ] **Step 1: Executar todos os gates**

Run:

```powershell
npm --prefix frontend test
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build
git diff --check 6fbac40f1aac9ee806bec103e4cf7110366be237..HEAD
git status --short
```

Expected:

- suíte unitária inteira PASS;
- typecheck PASS;
- lint PASS;
- build PASS com os seis chunks separados;
- o único warning de tamanho conhecido é registrado para a TASK-125;
- `git diff --check` sem saída;
- worktree limpo.

- [ ] **Step 2: Solicitar revisão independente**

Entregar ao revisor:

- `BASE_COMMIT`;
- diff `6fbac40f1aac9ee806bec103e4cf7110366be237..HEAD`;
- RED observado;
- resultados focado e completo;
- nomes e tamanhos reais dos seis chunks;
- resultado `initial-entry=clean`;
- warning e tamanho reais do `index-*.js`.

Findings CRITICAL ou IMPORTANT devem retornar ao implementador e passar novamente por todos os gates.

- [ ] **Step 3: Atualizar o backlog somente após aprovação**

Em `docs/frontend-tasks-v2.md`:

- trocar `[ ]` por `[x]`;
- trocar `Status: READY` por `Status: DONE`;
- adicionar uma linha `Evidência` com hashes reais, revisão, RED, testes, typecheck, lint, build, seis chunks, ausência dos marcadores no entry e warning delegado à TASK-125.

Não marcar a TASK-125 como iniciada ou concluída.

- [ ] **Step 4: Criar o commit de rastreabilidade**

```powershell
git add docs/frontend-tasks-v2.md
git commit -m "test(TASK-124): Registrar auditoria de rotas lazy"
git diff --check 6fbac40f1aac9ee806bec103e4cf7110366be237..HEAD
git status --short
```

Expected: commit criado, diff-check sem saída e worktree limpo.

## Self-review

- **Spec coverage:** os seis imports dinâmicos, seis fallbacks acessíveis/estáveis, carregamento sob demanda, seis chunks, ausência no entry, alteração somente após falha e gates estão mapeados.
- **Scope:** o warning acima de 500 kB é registrado para TASK-125; não há `manualChunks`, mudança de limite ou refatoração de feature.
- **TDD:** os dois critérios ausentes têm RED explícito antes do GREEN mínimo.
- **Marker safety:** os marcadores escolhidos são cópias exclusivas das páginas e não labels compartilhados pelo shell.
- **Placeholder scan:** não há TBD, TODO ou instrução sem comando/resultado esperado.
