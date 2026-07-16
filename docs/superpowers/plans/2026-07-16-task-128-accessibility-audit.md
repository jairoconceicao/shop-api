# TASK-128 Accessibility Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auditar e corrigir a acessibilidade das jornadas principais, comprovando teclado, foco, semântica, regiões vivas, contraste WCAG AA e movimento reduzido.

**Architecture:** Uma spec Playwright percorre sete estados representativos somente por teclado e reutiliza os mocks estritos existentes. Helpers separados executam axe, auditorias de foco/semântica/contraste/movimento e geram artifacts; correções de produto surgem apenas de REDs reproduzidos, incluindo um boundary global de foco já justificado.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS 4, Playwright 1.61, `@axe-core/playwright`, Vitest e Vite 6.

## Global Constraints

- `BASE_COMMIT`: `f6bc9e502bbeb2d81896e2439c83c082cef5be47`.
- Instalar `@axe-core/playwright` como `devDependency` e atualizar ambos `frontend/package.json` e `frontend/package-lock.json`.
- Auditar sete estados representativos, sem repetir a matriz 65× da TASK-127.
- Toda ativação da jornada de teclado usa teclas; `.click()` é proibido nesses checkpoints.
- Falhar em toda violação axe `serious` ou `critical`; anexar o resultado completo em JSON.
- Contraste mínimo: `4.5:1` texto normal e `3:1` texto grande; exceção somente para controles realmente desabilitados.
- Compor alpha e backgrounds ancestrais antes de calcular contraste.
- Corrigir `zinc-500/600` somente quando um RED no elemento real comprovar falha.
- Screenshots e JSON são attachments do Playwright e não entram no Git.
- Preservar mocks, autorização, bodies, queries, rotas e contagens estritas.
- Qualquer correção de produto exige RED focado, GREEN e regressão afetada.
- Somente mudança de `pathname` representa página nova; `search` e `hash` na
  mesma pathname nunca movem foco.
- O primeiro carregamento nunca rouba foco.
- `PUSH`, `REPLACE` e `POP` para outra pathname focalizam o heading real da
  página de destino.
- Rotas lazy aguardam estruturalmente o heading, sem timeout, polling ou
  fallback focalizável.

---

## File map

- Modify: `frontend/package.json` — declara `@axe-core/playwright`.
- Modify: `frontend/package-lock.json` — trava a árvore resolvida pelo npm.
- Create: `frontend/e2e/support/accessibilityAudit.ts` — axe, semântica, foco,
  contraste, reduced motion e attachments.
- Create: `frontend/e2e/accessibility.spec.ts` — jornada representativa e
  checklist automatizado.
- Create: `frontend/src/app/router/RouteFocusBoundary.tsx` — move foco ao
  heading principal após mudança de rota.
- Modify: `frontend/src/app/router/AppRouter.tsx` — instala o boundary ao redor
  do conteúdo roteado.
- Modify conditionally: componentes indicados pelos REDs.
- Create: `.superpowers/task-128-implementation-report.md` — checklist,
  findings, ratios, artifacts e gates.
- Modify after approval: `docs/frontend-tasks-v2.md`.

### Task 1: Instalar axe e definir o auditor estrutural

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Create: `frontend/e2e/support/accessibilityAudit.ts`
- Create: `frontend/e2e/accessibility.spec.ts`

**Interfaces:**
- Produces: `auditAxe(page, testInfo, state)`,
  `assertDocumentSemantics(page)`, `assertVisibleFocus(locator)` e
  `attachAccessibilityScreenshot(page, testInfo, state)`.
- Consumes: `Page`, `Locator`, `TestInfo` e `AxeBuilder`.

- [ ] **Step 1: Instalar a dependência e lock**

```powershell
cd frontend
npm install --save-dev @axe-core/playwright
```

Expected: `@axe-core/playwright` aparece em `devDependencies`; lockfile registra
a versão e integridade resolvidas, sem alterar dependências de produção.

- [ ] **Step 2: Criar o wrapper axe estrito**

```ts
export async function auditAxe(page: Page, testInfo: TestInfo, state: string) {
  const result = await new AxeBuilder({ page }).analyze()
  await testInfo.attach(`accessibility-${state}.json`, {
    body: Buffer.from(JSON.stringify(result, null, 2)),
    contentType: 'application/json',
  })
  const blocking = result.violations.filter(
    ({ impact }) => impact === 'serious' || impact === 'critical',
  )
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  return result
}
```

- [ ] **Step 3: Criar asserções semânticas**

`assertDocumentSemantics` deve exigir:

```ts
await expect(page.getByRole('main')).toHaveCount(1)
await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
```

Para `a[href], button, input, select, textarea, [role="menu"],
[role="dialog"], nav, form[role="search"]`, coletar role/nome acessível e
falhar em nomes vazios quando o role exige nome. Landmarks repetidos do mesmo
role devem ter nomes distintos. Para buscas visíveis, exigir apenas uma região
`search` chamada `Buscar produtos`; a busca responsiva oculta não pode
permanecer na árvore acessível.

- [ ] **Step 4: Criar auditor de foco visível**

`assertVisibleFocus(locator)` deve focalizar via teclado antes da chamada e
exigir `locator.evaluate(element => element === document.activeElement)`,
bounding box positiva e um indicador computado:

```ts
const visible = outlineStyle !== 'none'
  && parseFloat(outlineWidth) >= 2
  || boxShadow !== 'none'
expect(visible).toBe(true)
```

- [ ] **Step 5: Criar screenshot como attachment**

```ts
await testInfo.attach(`accessibility-${state}.png`, {
  body: await page.screenshot({ fullPage: true }),
  contentType: 'image/png',
})
```

- [ ] **Step 6: Escrever e executar o RED inicial**

Abrir `/entrar`, navegar com `Tab` até `Criar agora`, pressionar `Enter`,
aguardar `/cadastro` e exigir foco no `h1`.

```powershell
npx playwright test e2e/accessibility.spec.ts --project=chromium --workers=1 -g "foco após rota"
```

Expected: FAIL porque `document.activeElement` é `BODY`.

- [ ] **Step 7: Commit do RED e dependência**

```powershell
git add frontend/package.json frontend/package-lock.json frontend/e2e
git commit -m "test(TASK-128): Definir auditor de acessibilidade"
```

### Task 2: Restaurar foco semântico após navegação

**Files:**
- Create: `frontend/src/app/router/RouteFocusBoundary.tsx`
- Modify: `frontend/src/app/router/AppRouter.tsx`
- Test: `frontend/e2e/accessibility.spec.ts`

**Interfaces:**
- Produces: `RouteFocusBoundary({ children }: PropsWithChildren)`.
- Consumes: `useLocation()`, `useNavigationType()` e o primeiro `main h1`
  real renderizado.

- [ ] **Step 1: Escrever seis REDs da política de página**

Adicionar testes de integração do boundary, além do RED E2E já reproduzido:

1. **initial load:** renderizar `/entrar` com foco preexistente fora da
   aplicação e provar que o boundary não focaliza o `h1`;
2. **PUSH/REPLACE eager:** parametrizar os dois tipos, navegar
   `/entrar` → `/cadastro` e focalizar o `h1` novo exatamente uma vez em cada
   execução;
3. **PUSH lazy:** trocar pathname, renderizar apenas fallback `role=status`,
   provar que ele não recebe foco e inserir depois o `h1` real, que deve ser
   focalizado sem avançar timer;
4. **same pathname:** alterar primeiro `?page=2` e depois `#endereco` mantendo
   a pathname; o elemento ativo e a contagem de chamadas a `focus()` não
   mudam;
5. **POP/back:** navegar `/entrar` → `/cadastro`, executar voltar e avançar e
   focalizar respectivamente os headings reais de cada pathname;
6. **cleanup/race/overlays:** iniciar uma rota lazy A, navegar para B antes do
   heading A surgir, inserir ambos e provar que somente B recebe foco; depois
   abrir/fechar menu e dialog na pathname B e provar restauração dos triggers,
   sem chamada adicional do boundary.

Run:

```powershell
cd frontend
npx vitest run src/app/router/RouteFocusBoundary.test.tsx
```

Expected: os seis casos FAIL pela ausência do boundary; o caso lazy não usa
fake timeout como condição de sucesso.

- [ ] **Step 2: Implementar resolução estrutural cancelável**

O effect depende apenas de `location.pathname`. No primeiro effect, guardar a
pathname/heading e retornar sem foco. Em pathname posterior:

1. desconectar o observer da pathname anterior;
2. guardar `previousHeading`, obtido antes da troca;
3. procurar sincronicamente um `main h1` conectado, com `tabIndex=-1`, que não
   seja `previousHeading`;
4. se existir, focalizar uma vez e encerrar;
5. se não existir, observar somente a subtree do `main`/root da aplicação com
   `MutationObserver`;
6. a cada mutação, repetir a mesma resolução;
7. desconectar após foco, nova pathname ou unmount.

Uma estrutura equivalente:

```tsx
function findNewRouteHeading(previous: HTMLElement | null) {
  const heading = document.querySelector<HTMLElement>('main h1')
  return heading?.isConnected && heading !== previous ? heading : null
}

useEffect(() => {
  if (initialPathname.current === null) {
    initialPathname.current = pathname
    previousHeading.current =
      document.querySelector<HTMLElement>('main h1')
    return
  }

  let active = true
  const previous = previousHeading.current
  const focusWhenReady = () => {
    const heading = findNewRouteHeading(previous)
    if (!active || !heading) return false
    heading.focus()
    previousHeading.current = heading
    return true
  }

  if (focusWhenReady()) return
  const root = document.querySelector('main')?.parentElement
    ?? document.getElementById('root')
  if (!root) return

  const observer = new MutationObserver(() => {
    if (focusWhenReady()) observer.disconnect()
  })
  observer.observe(root, { childList: true, subtree: true })

  return () => {
    active = false
    observer.disconnect()
  }
}, [pathname])
```

Não incluir `search`, `hash` ou `navigationType` nas dependências. Usar
`useNavigationType()` somente para registrar/assertar nos testes que `POP`,
`PUSH` e `REPLACE` para outra pathname seguem a mesma política.

Não usar `requestAnimationFrame`, `setTimeout`, `waitForTimeout`, polling nem
foco no fallback. Se a subtree for substituída durante Suspense, o observer no
root da aplicação continua válido; se uma nova pathname vencer a race, o
cleanup invalida o callback antigo antes de observar a nova página.

- [ ] **Step 3: Tornar headings de página programaticamente focáveis**

Adicionar `tabIndex={-1}` aos headings `main h1` reais cobertos pelo router,
incluindo estados de erro que representam a página. Não adicionar `h1` aos
fallbacks lazy. Se o mesmo componente renderiza mais de um estado exclusivo,
ambos os headings recebem o atributo.

- [ ] **Step 4: Instalar no router**

Envolver o conteúdo das rotas com `RouteFocusBoundary` dentro do contexto do
router, sem remontar providers ou layouts.

- [ ] **Step 5: Executar GREEN unitário, lazy e E2E**

```powershell
cd frontend
npx vitest run src/app/router/RouteFocusBoundary.test.tsx src/app/router/AppRouter.lazy.test.tsx
npx playwright test e2e/accessibility.spec.ts --project=chromium --workers=1 -g "foco após rota"
npx vitest run src/App.test.tsx src/app/layouts
```

Expected: seis casos PASS; fallback nunca recebe foco; POP/back focaliza a
pathname restaurada; busca/hash preservam o foco; race não produz foco tardio;
menu/dialog restauram triggers; E2E focaliza cadastro.

- [ ] **Step 6: Commit**

```powershell
git add frontend/src/app/router frontend/src/features frontend/e2e/accessibility.spec.ts
git commit -m "fix(TASK-128): Restaurar foco após navegação"
```

### Task 3: Completar a jornada somente por teclado

**Files:**
- Modify: `frontend/e2e/accessibility.spec.ts`
- Reuse: `frontend/e2e/support/authApi.ts`

**Interfaces:**
- Consumes: `authApi.seedCustomer()`, `authApi.enableResponsiveCatalog()` e
  os helpers da Task 1.
- Produces: uma jornada isolada com sete checkpoints e ledger completo.

- [ ] **Step 1: Criar helper de tabulação**

Definir `tabUntil(page, predicate, max = 40)` que pressiona `Tab`, registra
tag/role/nome de cada foco e falha após 40 passos. Não usar seletor para
focalizar o alvo.

- [ ] **Step 2: Catálogo, busca e login com erro**

No catálogo, confirmar `main`, `h1`, busca única visível e foco visível.
Tabular até produto e ativar com `Enter`. Navegar a `/entrar` pelo fluxo
visitante, preencher apenas e-mail pelo teclado, submeter com `Enter` e exigir:

- resumo `role="alert"` focado;
- senha com `aria-invalid="true"`;
- associação ao erro por `aria-describedby`;
- axe, semântica e screenshot do estado `login-error`.

- [ ] **Step 3: Cadastro com resumo focado**

Ativar `Criar agora` com teclado, confirmar foco no novo `h1`, tabular até
`Criar conta`, ativar sem preencher e exigir resumo focado, campos inválidos
associados e anúncio assertivo. Auditar `registration-error`.

- [ ] **Step 4: Autenticar e auditar menu**

Voltar a login, preencher credenciais, marcar `Manter conectado` com `Space` e
submeter com `Enter`. No header:

1. tabular até o trigger de conta;
2. abrir com `Enter`;
3. exigir foco no primeiro menuitem;
4. mover com `ArrowDown`, `End`, `Home`;
5. fechar com `Escape`;
6. exigir foco restaurado no trigger.

- [ ] **Step 5: Carrinho e dialog**

Adicionar produto pela jornada já contratada. No carrinho, tabular até
`Remover <produto>`, abrir com `Enter`, exigir ação segura inicialmente
focada, circular `Tab`/`Shift+Tab` sem escapar, fechar com `Escape` e confirmar
foco no trigger. Auditar `cart-dialog`.

- [ ] **Step 6: Checkout**

Tabular pelo formulário na ordem endereço → pagamento → confirmação. Alternar
pagamento com setas/Space, confirmar foco visível e auditar `checkout` sem
criar o pedido nesta etapa.

- [ ] **Step 7: Conta, CPF e dialog**

Abrir dados da conta via menu. Alterar CPF pelo teclado, submeter, exigir
dialog nomeado, ação segura focada, trap e restauração após cancelar. Auditar
`account-cpf-dialog`.

- [ ] **Step 8: Pedido e dialog**

Abrir pedidos pelo menu, entrar no detalhe com `Enter`, abrir cancelamento,
provar trap/restauração e fechar sem PATCH. Auditar `order-dialog`.

- [ ] **Step 9: Trancar requests**

Executar a spec uma vez, registrar as 19 chaves retornadas por
`authApi.requestCounts()` e copiá-las como literais para
`authApi.expectRequestCounts`. Todas as mutations não realizadas ficam `0`;
nenhuma chave pode ser omitida.

- [ ] **Step 10: Executar jornada completa e commit**

```powershell
npx playwright test e2e/accessibility.spec.ts --project=chromium --workers=1
```

Expected: PASS, sete JSON e sete screenshots anexados, ledger exato.

```powershell
git add frontend/e2e/accessibility.spec.ts
git commit -m "test(TASK-128): Cobrir jornada acessível por teclado"
```

### Task 4: Auditar contraste real e corrigir somente findings

**Files:**
- Modify: `frontend/e2e/support/accessibilityAudit.ts`
- Modify conditionally: componentes apontados pelo relatório.
- Test: `frontend/e2e/accessibility.spec.ts`

**Interfaces:**
- Produces: `auditTextContrast(page, testInfo, state)`.
- Consumes: estilos computados e pixels CSS.

- [ ] **Step 1: Implementar composição alpha**

Criar tipos `Rgba` e funções puras no browser:

```ts
composite(foreground: Rgba, background: Rgba): Rgba
luminance(color: Rgba): number
contrast(a: Rgba, b: Rgba): number
```

Subir ancestrais até fundo opaco; se nenhum existir, usar o background
computado de `body`. Para gradiente/imagem, registrar como finding manual, não
inventar uma cor.

- [ ] **Step 2: Aplicar thresholds exatos**

Auditar nós de texto visíveis. Texto grande é `fontSize >= 24` ou
`fontSize >= 18.66 && fontWeight >= 700`; exigir respectivamente `3` ou `4.5`.
Ignorar somente elemento dentro de controle `disabled` ou
`aria-disabled="true"`.

- [ ] **Step 3: Gerar RED por elemento**

Anexar JSON com texto/label, seletor diagnóstico, foreground/background
compostos, alpha, tamanho, peso, ratio e threshold. Rodar:

```powershell
npx playwright test e2e/accessibility.spec.ts --project=chromium --workers=1 -g "contraste"
```

Expected: PASS se não houver finding; caso falhe, o RED deve nomear cada
elemento concreto.

- [ ] **Step 4: Corrigir caso a caso**

Para cada `text-zinc-500/600` reprovado, trocar apenas a classe daquele uso
pela menor tonalidade que passe no background medido. Não alterar tokens
globais nem ocorrências não auditadas.

- [ ] **Step 5: Reexecutar e commit condicional**

```powershell
npx playwright test e2e/accessibility.spec.ts --project=chromium --workers=1
npm run typecheck
npm run lint
```

Expected: todos os ratios passam. Criar commit apenas se houve correção:

```powershell
git add frontend/e2e/support/accessibilityAudit.ts frontend/src
git commit -m "fix(TASK-128): Corrigir contrastes WCAG reproduzidos"
```

### Task 5: Provar regiões vivas e movimento reduzido

**Files:**
- Modify: `frontend/e2e/support/accessibilityAudit.ts`
- Modify: `frontend/e2e/accessibility.spec.ts`
- Modify conditionally: componentes apontados por RED.

**Interfaces:**
- Produces: `assertLiveRegions(page, expected)` e
  `assertReducedMotion(page)`.

- [ ] **Step 1: Auditar regiões vivas**

Coletar `role=alert`, `role=status` e `[aria-live]`. Exigir texto não vazio
quando visível, `assertive` para erros, `polite` para status/toasts e ausência
de duplicidade textual simultânea em regiões aninhadas.

- [ ] **Step 2: Provar foco dos summaries**

Nos REDs de login e cadastro, exigir `document.activeElement` no summary.
Corrigir com `ref`, `tabIndex={-1}` e `requestAnimationFrame(...focus)` somente
onde a falha ocorrer; preservar associação de cada campo.

- [ ] **Step 3: Auditar reduced motion computado**

Executar `page.emulateMedia({ reducedMotion: 'reduce' })`, recarregar catálogo
e dialog e exigir:

```ts
scrollBehavior === 'auto'
maxAnimationDurationMs <= 0.01
maxAnimationIterationCount <= 1
maxTransitionDurationMs <= 0.01
```

Auditar elementos visíveis, `::before` e `::after`; excluir apenas valores
`none`/zero.

- [ ] **Step 4: Executar GREEN e regressões**

```powershell
npx playwright test e2e/accessibility.spec.ts --project=chromium --workers=1
npx vitest run src/shared/ui/feedback src/features/auth src/features/customer
```

Expected: anúncios únicos, summaries focados e movimento não essencial
suprimido.

- [ ] **Step 5: Commit**

```powershell
git add frontend/e2e frontend/src
git commit -m "fix(TASK-128): Corrigir anúncios e movimento acessível"
```

### Task 6: Registrar checklist, artifacts e gates

**Files:**
- Verify: `frontend/e2e/accessibility.spec.ts`
- Create: `.superpowers/task-128-implementation-report.md`

**Interfaces:**
- Produces: evidência reproduzível para revisão independente.

- [ ] **Step 1: Executar anti-flake**

```powershell
cd frontend
npx playwright test e2e/accessibility.spec.ts --project=chromium --workers=1 --repeat-each=10
```

Expected: 10/10 PASS, sem vazamento de sessão, foco ou artifacts.

- [ ] **Step 2: Executar suíte completa**

```powershell
npx playwright test --project=chromium
npx playwright test --project=chromium --repeat-each=2
```

Expected: suíte PASS nas duas execuções.

- [ ] **Step 3: Executar gates locais**

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Expected: exit code zero e limite de chunk da TASK-125 preservado.

- [ ] **Step 4: Verificar diff e artifacts**

```powershell
git ls-files "*.png" "frontend/test-results/**" "frontend/playwright-report/**"
git diff --check f6bc9e5..HEAD
git status --short
```

Expected: nenhum artifact rastreado, diff-check sem saída e apenas relatório
pendente.

- [ ] **Step 5: Escrever relatório**

Registrar:

- base e commits;
- sete estados e sequência de teclado;
- reprodução/solução do foco pós-rota;
- política de pathname, initial load, `PUSH`/`REPLACE`/`POP`, search/hash;
- evidência de espera estrutural lazy, cleanup e race sem timeout;
- ordem, indicador e restauração de foco;
- menu e três dialogs;
- landmarks, headings, nomes e busca duplicada;
- summaries e associações dos erros de login/cadastro;
- regiões vivas e ausência de duplicidade;
- violations axe por impacto e links dos JSON attachments;
- tabela de contraste com cores compostas, ratios e thresholds;
- exceções disabled;
- estilos computed de reduced motion;
- checklist manual assinado, screenshots e ambiente;
- ledger de requests;
- 10/10, suíte completa/repetida, typecheck, lint, testes, build e diff-check.

- [ ] **Step 6: Commit do relatório**

```powershell
git add .superpowers/task-128-implementation-report.md
git commit -m "test(TASK-128): Registrar auditoria de acessibilidade"
```

### Task 7: Revisão independente e conclusão

**Files:**
- Review: diff `f6bc9e5..HEAD`
- Modify after approval: `docs/frontend-tasks-v2.md`

- [ ] **Step 1: Solicitar revisão**

O reviewer confirma dependência/lock, REDs reais, teclado sem `.click()`,
boundary pós-rota, foco visível/ordem/restauração, menu/dialog traps,
summaries, landmarks/headings/nomes, buscas, live regions, axe sem
serious/critical, contraste com alpha/thresholds/exceção disabled, reduced
motion computed, artifacts, ledger, 10/10 e gates.

Para o boundary, o reviewer deve rejeitar dependência em `search`/`hash`,
timeout/polling, foco no fallback, ausência de teste POP/back ou observer que
possa sobreviver a uma navegação concorrente.

Findings `CRITICAL` ou `IMPORTANT` retornam ao implementador com RED, correção,
gates afetados e nova revisão.

- [ ] **Step 2: Atualizar backlog após aprovação**

Marcar somente TASK-128 como `[x]`/`DONE` e registrar commits, findings,
artifacts, checklist, contagens e gates.

```powershell
git add docs/frontend-tasks-v2.md
git commit -m "test(TASK-128): Concluir auditoria de acessibilidade"
git diff --check f6bc9e5..HEAD
git status --short
```

Expected: diff-check limpo e worktree sem mudanças.

## Self-review

- **Cobertura:** teclado, foco, menu, três dialogs, sete estados, semântica,
  regiões vivas, axe, contraste e movimento estão mapeados.
- **TDD:** foco pós-rota já possui reprodução; demais correções dependem de
  RED concreto antes de código de produto.
- **Foco de rota:** seis REDs cobrem initial, pathname eager/lazy, search/hash,
  POP/back e cleanup/races/overlays; não há timeout arbitrário.
- **Custo:** uma jornada representativa repetida dez vezes, sem matriz 65×.
- **Contraste:** alpha, texto grande, disabled e `zinc-500/600` caso a caso
  estão explícitos.
- **Artifacts:** JSON e screenshots são attachments não rastreados.
- **Placeholders:** contagens do ledger são capturadas no primeiro RED e
  substituídas por literais antes do GREEN; nenhuma chave pode ficar parcial.
