# TASK-127 Responsive Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatizar 65 checkpoints responsivos — 13 estados em cinco viewports — comprovando ausência de overflow horizontal no documento e usabilidade de controles, formulários e dialogs.

**Architecture:** Uma spec Playwright data-driven executa uma jornada completa por viewport e reutiliza a sessão e os dados daquele teste. Helpers independentes auditam `documentElement`, diagnosticam elementos ofensores, reconhecem somente três scrollers explicitamente marcados e anexam screenshots; o `authApi` preserva isolamento e ledger estrito.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS 4, Playwright 1.61, Vitest e Vite 6.

## Global Constraints

- `BASE_COMMIT`: `9f0095161597e03d5dfcf36065f36e280aa6809f`.
- Auditar exatamente `320`, `375`, `768`, `1024` e `1920` px.
- Auditar exatamente os 13 estados literais definidos neste plano: 65 checkpoints.
- Exigir `document.documentElement.scrollWidth <= document.documentElement.clientWidth`, sem tolerância.
- Permitir somente `categories`, `account-navigation` e `pagination` em `data-responsive-overflow`.
- Screenshots são attachments do Playwright e nunca são adicionadas ao Git.
- Aplicar TDD: primeiro RED estrutural; CSS somente depois de um RED real de overflow.
- Não usar `overflow-x-hidden` como correção, allowlist por seletor ou tolerância em pixels.
- Preservar o mock estrito: método, auth, query, body, contagem e rota inesperada.
- Uma jornada por viewport pode ser paralelizada; seus 13 estados são sequenciais.
- A auditoria de teclado, foco, contraste e movimento pertence à TASK-128.

---

## File map

- Create: `frontend/e2e/support/responsiveAudit.ts` — matriz, tipos, auditor de
  documento/offenders/controles e attachment.
- Create: `frontend/e2e/responsive.spec.ts` — cinco jornadas data-driven e 65
  estados literais.
- Modify: `frontend/src/app/layouts/Header.tsx` — documenta o scroller de
  categorias.
- Modify: `frontend/src/app/layouts/AccountLayout.tsx` — documenta o scroller
  da conta.
- Modify: `frontend/src/shared/ui/navigation/Pagination.tsx` — documenta o
  scroller de paginação.
- Modify: `frontend/e2e/support/authApi.ts` — modo opt-in de catálogo paginado,
  mantendo contratos e reset.
- Create: `.superpowers/task-127-implementation-report.md` — matriz, findings,
  screenshots, requests e gates.
- Modify after approval: `docs/frontend-tasks-v2.md` — status e evidência.

### Task 1: Escrever o auditor e obter o RED documental

**Files:**
- Create: `frontend/e2e/support/responsiveAudit.ts`
- Create: `frontend/e2e/responsive.spec.ts`
- Read: `frontend/src/app/layouts/Header.tsx`
- Read: `frontend/src/app/layouts/AccountLayout.tsx`
- Read: `frontend/src/shared/ui/navigation/Pagination.tsx`

**Interfaces:**
- Produces: `RESPONSIVE_VIEWPORTS`, `RESPONSIVE_STATES`,
  `assertResponsiveDocument(page, expectedMarkers)`,
  `assertActionableControls(page, scope?)` e
  `attachResponsiveScreenshot(page, testInfo, viewport, state)`.
- Consumes: `Page`, `Locator` e `TestInfo` de `@playwright/test`.

- [ ] **Step 1: Criar as matrizes literais**

Em `responsiveAudit.ts`, declarar:

```ts
export const RESPONSIVE_VIEWPORTS = [
  { name: '320', width: 320, height: 800 },
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1920', width: 1920, height: 1080 },
] as const

export const RESPONSIVE_STATES = [
  'catalog',
  'product-detail',
  'login',
  'registration',
  'cart',
  'cart-remove-dialog',
  'checkout',
  'order-confirmation',
  'account-data',
  'account-password',
  'orders-list',
  'order-detail',
  'order-cancel-dialog',
] as const

export type ResponsiveViewport = (typeof RESPONSIVE_VIEWPORTS)[number]
export type ResponsiveState = (typeof RESPONSIVE_STATES)[number]
```

Adicionar um teste estrutural na spec:

```ts
expect(RESPONSIVE_VIEWPORTS).toHaveLength(5)
expect(RESPONSIVE_STATES).toHaveLength(13)
expect(RESPONSIVE_VIEWPORTS.length * RESPONSIVE_STATES.length).toBe(65)
```

- [ ] **Step 2: Implementar o coletor de overflow sem tolerância**

`assertResponsiveDocument(page, expectedMarkers)` deve executar
`page.evaluate` e retornar:

```ts
type OverflowAudit = {
  document: { scrollWidth: number; clientWidth: number }
  allowedMarkers: string[]
  offenders: Array<{
    tag: string
    marker: string | null
    label: string
    scrollWidth: number
    clientWidth: number
    left: number
    right: number
  }>
}
```

Dentro do browser:

1. aceitar somente os três valores da allowlist;
2. falhar se o documento tiver `scrollWidth > clientWidth`;
3. considerar offender um elemento visível cujo retângulo escape de
   `[0, document.clientWidth]`;
4. considerar offender um elemento com `scrollWidth > clientWidth` quando ele
   não estiver dentro de `[data-responsive-overflow]`;
5. não considerar os descendentes largos do scroller um erro interno, mas
   continuar verificando que o próprio scroller não escapa do documento;
6. falhar em marcador desconhecido, duplicação inesperada ou quarto marcador;
7. imprimir o objeto completo na mensagem de asserção.

Em cada estado, também exigir:

```ts
expect(audit.allowedMarkers.sort()).toEqual([...expectedMarkers].sort())
```

O conjunto global acumulado ao fim da jornada deve ser exatamente os três
valores.

- [ ] **Step 3: Implementar o helper de controles**

`assertActionableControls(page, scope = page.locator('body'))` deve inspecionar
`a[href], button, input, select, textarea` visíveis no escopo. Para cada
controle não desabilitado, exigir:

```ts
box !== null
box.width > 0
box.height > 0
box.x >= 0
box.x + box.width <= viewport.width
```

Usar asserções Playwright `toBeVisible()` e `toBeEnabled()` nos controles
nomeados explicitamente pela jornada antes de interagir. Não exigir presença
vertical simultânea; `scrollIntoViewIfNeeded()` é permitido.

- [ ] **Step 4: Implementar attachment determinístico**

```ts
export async function attachResponsiveScreenshot(
  page: Page,
  testInfo: TestInfo,
  viewport: ResponsiveViewport,
  state: ResponsiveState,
) {
  await testInfo.attach(`responsive-${viewport.name}-${state}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
}
```

Nenhum `path` deve ser usado e nenhum PNG deve aparecer no worktree.

- [ ] **Step 5: Escrever o primeiro RED**

Criar temporariamente o primeiro checkpoint do catálogo em 320 px. Aguardar o
heading semântico, chamar os dois auditores e exigir que o conjunto de
marcadores inclua `categories`.

Run:

```powershell
cd frontend
npx playwright test e2e/responsive.spec.ts --project=chromium --workers=1 -g "320"
```

Expected: FAIL porque `Header` ainda não possui
`data-responsive-overflow="categories"`. O relatório deve guardar a mensagem
exata; não alterar CSS.

- [ ] **Step 6: Commit do RED**

```powershell
git add frontend/e2e/support/responsiveAudit.ts frontend/e2e/responsive.spec.ts
git commit -m "test(TASK-127): Definir auditor responsivo E2E"
```

### Task 2: Documentar somente os três scrollers intencionais

**Files:**
- Modify: `frontend/src/app/layouts/Header.tsx`
- Modify: `frontend/src/app/layouts/AccountLayout.tsx`
- Modify: `frontend/src/shared/ui/navigation/Pagination.tsx`
- Test: `frontend/e2e/responsive.spec.ts`

**Interfaces:**
- Consumes: allowlist exata do auditor.
- Produces: três marcadores estáveis usados somente como documentação da
  política de overflow.

- [ ] **Step 1: Adicionar os atributos exatos**

Adicionar aos elementos que já têm `overflow-x-auto`:

```tsx
data-responsive-overflow="categories"
data-responsive-overflow="account-navigation"
data-responsive-overflow="pagination"
```

Não mover o atributo para descendentes, não mudar classes e não adicionar um
quarto marcador.

- [ ] **Step 2: Executar GREEN do primeiro checkpoint**

```powershell
cd frontend
npx playwright test e2e/responsive.spec.ts --project=chromium --workers=1 -g "320"
```

Expected: PASS; documento sem overflow e `categories` reconhecido.

- [ ] **Step 3: Executar regressões dos componentes**

```powershell
npx vitest run src/app/layouts/Header.test.tsx src/app/layouts/layouts.test.tsx src/shared/ui/navigation/Pagination.test.tsx
```

Expected: todos PASS sem alteração de comportamento ou classes.

- [ ] **Step 4: Commit**

```powershell
git add frontend/src/app/layouts/Header.tsx frontend/src/app/layouts/AccountLayout.tsx frontend/src/shared/ui/navigation/Pagination.tsx
git commit -m "test(TASK-127): Documentar overflow responsivo permitido"
```

### Task 3: Completar a jornada literal de 13 estados

**Files:**
- Modify: `frontend/e2e/responsive.spec.ts`
- Modify: `frontend/e2e/support/authApi.ts`
- Test: `frontend/e2e/responsive.spec.ts`

**Interfaces:**
- Consumes: fixture `test/expect`, `authApi.seedCustomer()`, matrizes e helpers
  da Task 1.
- Produces: cinco testes, 13 checkpoints por teste, 65 screenshots e ledger
  completo por viewport.

- [ ] **Step 1: Criar um checkpoint único**

Na spec, definir:

```ts
async function checkpoint(
  page: Page,
  testInfo: TestInfo,
  viewport: ResponsiveViewport,
  state: ResponsiveState,
  expectedMarkers: readonly string[],
  scope?: Locator,
) {
  await assertResponsiveDocument(page, expectedMarkers)
  await assertActionableControls(page, scope)
  await attachResponsiveScreenshot(page, testInfo, viewport, state)
}
```

Cada chamada deve passar uma destas combinações exatas:

- `catalog`: `['categories', 'pagination']`;
- `login` e `registration`: `[]`;
- `account-data` e `account-password`:
  `['categories', 'account-navigation']`;
- os outros oito estados: `['categories']`.

Manter `visitedStates: ResponsiveState[]` e exigir ao final:

```ts
expect(visitedStates).toEqual([...RESPONSIVE_STATES])
```

- [ ] **Step 2: Parametrizar uma jornada por viewport**

```ts
for (const viewport of RESPONSIVE_VIEWPORTS) {
  test.describe(`viewport ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test('audita os 13 estados principais', async ({
      authApi,
      page,
    }, testInfo) => {
      authApi.seedCustomer()
      authApi.enableResponsiveCatalog()
    })
  })
}
```

Não criar 65 testes independentes. A fixture fornece identidade isolada por
viewport/repetição e permite execução paralela ou `--shard=N/5`.

- [ ] **Step 3: Cobrir os quatro estados públicos**

Antes da spec, estender `AuthApi` com
`enableResponsiveCatalog(): void`, controlado por
`let responsiveCatalogEnabled = false`. Quando ativo, o handler já estrito de
`GET /api/v1/produto?page=1&size=20` deve responder com:

```ts
pagination: {
  pages: 10,
  size: 20,
  totalItems: 181,
  data: [{
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
  }],
}
```

Quando inativo, preservar exatamente a resposta vazia atual. `reset()` deve
definir `responsiveCatalogEnabled = false`. Nenhuma spec existente ativa o
modo.

Depois, na ordem literal:

1. abrir `/`, aguardar heading/lista e auditar `catalog`;
2. abrir `/produtos/${authApi.data.product.id}`, aguardar nome/preço e auditar
   `product-detail`;
3. abrir `/entrar`, preencher e limpar e-mail/senha, auditar formulário e
   `login`;
4. abrir `/cadastro`, preencher e limpar um campo de cada grupo, auditar
   formulário e `registration`, sem submeter.

Em cada estado, controles nomeados devem receber `toBeVisible()` e
`toBeEnabled()` antes do `checkpoint`.

- [ ] **Step 4: Autenticar e preparar carrinho somente pela UI**

Voltar ao detalhe, clicar no controle visível de adicionar, aceitar o retorno a
login quando necessário, autenticar pela UI com `authApi.data.email/password`
e confirmar retorno seguro. Ajustar quantidade pela UI até o body aceito pelo
fixture e abrir `/carrinho`.

Auditar `cart`, abrir o dialog “Remover item”, auditar somente o `dialog` como
escopo em `cart-remove-dialog` e fechá-lo pelo botão “Manter item”/“Cancelar”
semanticamente disponível. O item deve permanecer para o checkout.

- [ ] **Step 5: Cobrir checkout e confirmação**

Abrir checkout pelo controle do carrinho, aguardar formulário carregado,
alterar o logradouro para o valor contratual “— somente pedido”, selecionar
“Cartão”, auditar `checkout` e submeter exatamente uma vez. Aguardar a rota e
heading de confirmação e auditar `order-confirmation`.

- [ ] **Step 6: Cobrir conta sem mutations**

Abrir `/minha-conta/dados`, aguardar o perfil, preencher e restaurar “Nome
completo” sem submeter e auditar `account-data`. Navegar pelo link “Trocar
senha”, preencher e limpar ambos os campos sem submeter e auditar
`account-password`.

- [ ] **Step 7: Cobrir pedidos e dialog**

Abrir `/pedidos`, aguardar lista e filtros, preencher/restaurar datas sem
submeter e auditar `orders-list`. Abrir o pedido pelo link semântico, aguardar
produto e totais e auditar `order-detail`. Abrir “Cancelar pedido”, auditar o
`dialog` em `order-cancel-dialog` e fechá-lo pelo botão não destrutivo; não
enviar PATCH.

- [ ] **Step 8: Registrar e travar o ledger completo**

Executar primeiro apenas 320 px:

```powershell
npx playwright test e2e/responsive.spec.ts --project=chromium --workers=1 -g "viewport 320"
```

Expected: o primeiro RED comportamental pode revelar contagens ou estado
adicional necessário. Durante o RED, anexar
`JSON.stringify(authApi.requestCounts(), null, 2)` ao `testInfo` como
`responsive-request-counts-320.json`. Copiar esse objeto sem alterações para
`authApi.expectRequestCounts(...)`, incluindo literalmente as 19 chaves
`register`, `login`, `categories`, `catalog`, `profile`, `profileUpdate`,
`passwordUpdate`, `logout`, `product`, `cartCreate`, `cartAdd`, `cartGet`,
`cartUpdate`, `cartDelete`, `orderCreate`, `ordersList`, `orderDetail`,
`orderProduct` e `orderCancel`. Remover o attachment diagnóstico depois de
travar o ledger; o relatório registra o objeto final.

Os números devem ser iguais nos cinco viewports. Nenhuma chave pode ser
omitida, usar intervalo ou ser ignorada. As mutations que a jornada
deliberadamente não envia (`register`, `profileUpdate`, `passwordUpdate`,
`logout`, `cartDelete`, `orderCancel`) devem permanecer com zero literal. Se o
RED demonstrar outra necessidade no fixture, ela deve validar o mesmo contrato
existente, ser isolada por opt-in e limpa em `reset()`; não criar endpoint
permissivo.

- [ ] **Step 9: Executar os 65 checkpoints**

```powershell
npx playwright test e2e/responsive.spec.ts --project=chromium --workers=1
```

Expected: 5/5 PASS, 65 estados visitados, 65 attachments e ledgers idênticos.
Se houver offender real, parar e executar a Task 4. Se não houver, pular a Task
4 sem alterar CSS.

- [ ] **Step 10: Commit da jornada**

```powershell
git add frontend/e2e/responsive.spec.ts frontend/e2e/support/authApi.ts
git commit -m "test(TASK-127): Cobrir matriz responsiva principal"
```

Adicionar `authApi.ts` somente se efetivamente alterado.

### Task 4: Corrigir somente overflow reproduzido pelo RED

**Files:**
- Modify only the component named by the offender.
- Modify: `frontend/e2e/responsive.spec.ts` only for a focused regression.

**Interfaces:**
- Consumes: diagnóstico e screenshot de um checkpoint que falhou.
- Produces: menor correção que elimina o offender sem esconder overflow.

- [ ] **Step 1: Registrar o RED concreto**

No relatório, registrar viewport, estado, tag/label, retângulo,
`scrollWidth/clientWidth` e nome do attachment. Adicionar um teste focado que
reproduza exatamente esse estado.

- [ ] **Step 2: Aplicar a menor correção**

Alterar apenas o componente responsável usando composição responsiva já
existente (`min-w-0`, quebra, coluna ou largura máxima). É proibido adicionar
`overflow-x-hidden`, tolerância ou novo item à allowlist.

- [ ] **Step 3: Reexecutar RED e matriz**

```powershell
npx playwright test e2e/responsive.spec.ts --project=chromium --workers=1
npx playwright show-report
```

Expected: a execução aponta o teste/estado falho e o relatório abre o attachment
diagnóstico; após a correção, 5/5 PASS e novamente 65 checkpoints.

- [ ] **Step 4: Commit condicional**

```powershell
git add frontend/e2e/responsive.spec.ts
git add -u frontend/src
git commit -m "fix(TASK-127): Corrigir overflow responsivo reproduzido"
```

Não criar este commit se a matriz permanecer 65/65 sem findings, que é o
baseline explorado.

### Task 5: Provar estabilidade, custo e gates

**Files:**
- Verify: `frontend/e2e/responsive.spec.ts`
- Verify: `frontend/e2e/support/responsiveAudit.ts`
- Create: `.superpowers/task-127-implementation-report.md`

**Interfaces:**
- Consumes: matriz final, attachments, ledger e commits.
- Produces: evidência reproduzível para revisão independente.

- [ ] **Step 1: Executar repetição anti-flake**

```powershell
cd frontend
npx playwright test e2e/responsive.spec.ts --project=chromium --workers=1 --repeat-each=5
```

Expected: 25/25 PASS, 325 checkpoints/attachments, sem estado compartilhado.

- [ ] **Step 2: Provar estratégia de shard**

Executar ao menos duas pontas:

```powershell
npx playwright test e2e/responsive.spec.ts --project=chromium --shard=1/5
npx playwright test e2e/responsive.spec.ts --project=chromium --shard=5/5
```

Expected: cada shard executa uma jornada e 13 checkpoints. Registrar duração da
execução serial e dos shards; não adicionar configuração permanente de CI.

- [ ] **Step 3: Executar suíte Chromium e repetição**

```powershell
npx playwright test --project=chromium
npx playwright test --project=chromium --repeat-each=2
```

Expected: toda a suíte PASS sem dependência de ordem, worker ou viewport.

- [ ] **Step 4: Executar gates locais**

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Expected: exit code zero. O limite de chunk da TASK-125 continua válido.

- [ ] **Step 5: Verificar artefatos e diff**

No worktree:

```powershell
git status --short
git ls-files "*.png" "frontend/test-results/**" "frontend/playwright-report/**"
git diff --check 9f0095161597e03d5dfcf36065f36e280aa6809f..HEAD
```

Expected: nenhum screenshot/resultado rastreado, diff-check sem saída e somente
o relatório pendente antes do commit.

- [ ] **Step 6: Escrever relatório**

Registrar em `.superpowers/task-127-implementation-report.md`:

- base e commits;
- RED estrutural e GREEN dos três marcadores;
- tabela literal 5×13 com resultado e nome de attachment de cada célula;
- `65/65`, `25/25`, suíte e repetição;
- lista exata dos três scrollers permitidos;
- objeto completo de request counts por viewport;
- findings CSS — esperado `nenhum`; se houver, RED e correção;
- controles/formulários/dialogs acionados;
- durações serial/shards e ambiente;
- typecheck, lint, testes, build e diff-check;
- confirmação de zero artefatos Playwright no Git.

- [ ] **Step 7: Commit do relatório**

```powershell
git add .superpowers/task-127-implementation-report.md
git commit -m "test(TASK-127): Registrar auditoria responsiva"
```

### Task 6: Revisão independente e conclusão

**Files:**
- Review: diff `9f0095161597e03d5dfcf36065f36e280aa6809f..HEAD`
- Modify after approval: `docs/frontend-tasks-v2.md`

**Interfaces:**
- Consumes: implementação, relatório e gates aprovados.
- Produces: TASK-127 `DONE` com evidência rastreável.

- [ ] **Step 1: Solicitar revisão independente**

O reviewer deve confirmar:

1. cinco viewports e 13 estados literais, total 65;
2. `documentElement.scrollWidth <= clientWidth` sem tolerância;
3. diagnóstico por geometria e scroll interno;
4. exatamente três marcadores e nenhum bypass genérico;
5. scrollers permitidos contidos no documento;
6. controles, formulários e ambos dialogs acionáveis;
7. 65 screenshots anexadas e nenhum PNG rastreado;
8. uma jornada isolada por viewport e sharding possível;
9. ledger completo e mock estrito;
10. 25/25 anti-flake e suíte completa repetida;
11. nenhuma correção CSS sem RED;
12. gates e diff-check verdes.

Todo finding `CRITICAL` ou `IMPORTANT` volta ao implementador, recebe RED,
correção, gates afetados e nova revisão.

- [ ] **Step 2: Atualizar backlog após ambas as aprovações**

Marcar somente TASK-127 como `[x]`/`DONE` e registrar commits, matriz 65/65,
repetição, três scrollers, screenshots, requests, findings, gates e aprovação.

```powershell
git add docs/frontend-tasks-v2.md
git commit -m "test(TASK-127): Concluir auditoria responsiva"
git diff --check 9f0095161597e03d5dfcf36065f36e280aa6809f..HEAD
git status --short
```

Expected: diff-check limpo e worktree sem mudanças.

## Self-review

- **Cobertura:** cinco larguras, 13 estados, 65 documentos, formulários,
  controles, dois dialogs, três scrollers e screenshots estão explícitos.
- **Custo:** cinco jornadas reutilizam setup e permitem shard por viewport; a
  repetição totaliza 25 testes, não 325 testes independentes.
- **TDD:** ausência dos marcadores produz o primeiro RED; CSS depende de um RED
  real e reproduzível.
- **Isolamento:** cliente, sessão, storages, estado do fixture, contagens e
  screenshots são próprios de cada teste/repetição.
- **Placeholders:** valores do ledger são obrigatoriamente capturados no RED e
  substituídos por literais antes do GREEN; nenhuma contagem pode permanecer
  comentada, parcial ou variável no código concluído.
- **Escopo:** não há backend, redesign, snapshot versionado nem auditoria da
  TASK-128.
