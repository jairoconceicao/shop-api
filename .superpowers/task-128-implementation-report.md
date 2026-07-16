# TASK-128 — Relatório de implementação

## Base e commits

- `BASE_COMMIT`: `f6bc9e502bbeb2d81896e2439c83c082cef5be47`.
- Plano: `57a7304`, `3c7128a`.
- Implementação: `a505adc`, `6c73d11`, `2ae1980`, `5d23b32`,
  `2a99661`, `aa1399d`, `07b5223`, `851c5bc`, `c0d4822`, `badbc03`
  e `d112336`.
- O backlog foi atualizado somente após a aprovação: TASK-128 `DONE`,
  TASK-129 preservada `READY` e TASK-130 preservada `BLOCKED` por TASK-129.

## Cobertura entregue

- `@axe-core/playwright` instalado somente como `devDependency`.
- Uma jornada Playwright cobre sete estados representativos, sem expandir a
  matriz responsiva de 65 estados:
  1. login com erro;
  2. cadastro com erro;
  3. catálogo autenticado;
  4. carrinho com dialog de remoção;
  5. checkout;
  6. conta com dialog de CPF;
  7. pedido com dialog de cancelamento.
- Cada estado anexa o resultado axe completo, o relatório de contraste e um
  screenshot ao artifact do Playwright.
- Violações axe `serious` e `critical` bloqueiam a spec sem allowlist.
- A jornada usa teclado para ativação, menu, dialogs e submissões auditadas.
- O ledger estrito final é:

```text
register=0 login=1 categories=8 catalog=2 profile=2 profileUpdate=0
passwordUpdate=0 logout=0 product=2 cartCreate=1 cartAdd=1 cartGet=8
cartUpdate=0 cartDelete=0 orderCreate=0 ordersList=0 orderDetail=2
orderProduct=2 orderCancel=0
```

## Foco e teclado

- `RouteFocusBoundary` considera somente `location.pathname`.
- O carregamento inicial não move foco.
- PUSH, REPLACE e POP para outra pathname focalizam o `main h1`.
- Search e hash na mesma pathname preservam o foco.
- Rotas lazy aguardam o heading real com `MutationObserver` cancelável.
- Uma navegação mais nova cancela observers antigos.
- Fallbacks não recebem foco.
- Os sete testes do boundary, junto dos seis testes lazy existentes, passam
  em 13/13.
- Login e cadastro desabilitam o foco automático no primeiro erro do React
  Hook Form e focalizam o resumo somente no callback de submissão inválida.
  O foco é sincronizado após a atualização do formulário sem interferir na
  digitação de CPF, CEP ou celular.
- Menu de conta cobre primeiro item, `Home`, `End`, `Escape` e restauração.
- Os três dialogs cobrem ação segura inicial, contenção com `Tab` e
  `Shift+Tab`, `Escape` e restauração ao trigger.

## Findings reproduzidos e corrigidos

| Estado | Finding RED | Correção |
| --- | --- | --- |
| Cadastro | foco perdido após `/entrar` → `/cadastro` | boundary global por pathname |
| Login/cadastro | resumo renderizado, mas primeiro campo recebia foco | callback inválido focaliza o resumo |
| Rodapé | texto `zinc-500`, contraste axe `4.01:1` | uso local de `zinc-400` |
| Rodapé | copyright `zinc-600`, contraste axe `2.51:1` | uso local de `zinc-400` |
| Imagem indisponível | `zinc-500`, contraste axe `3.65:1` | uso local de `zinc-400` |
| Checkout | observação `zinc-500`, contraste axe `3.86:1` | uso local de `zinc-400` |
| Checkout/confirmação | `main` aninhado no `main` do StoreLayout | container interno alterado para `div` |
| Carrinho | região viva vazia permanecia renderizada | região renderizada somente quando há anúncio |

Não houve substituição global de tokens. Após as correções, os sete estados
não apresentam violações axe `serious`/`critical` nem findings do auditor de
contraste computado.

## Regiões vivas, semântica e movimento

- Cada estado exige exatamente um landmark `main` e um `h1`.
- A sequência de headings não pode saltar níveis.
- Controles e landmarks auditados exigem nome acessível não vazio.
- Landmarks repetidos do mesmo tipo exigem nomes distintos, incluindo
  elementos nativos `nav` e elementos genéricos com `role="navigation"`.
- Apenas uma busca visível chamada `Buscar produtos` permanece na árvore.
- Regiões vivas visíveis não podem estar vazias, aninhadas ou duplicar a
  combinação de severidade e anúncio.
- O auditor de contraste não usa tolerância acima dos limites WCAG, compõe
  canais alpha e reprova backgrounds não sólidos, como gradientes e imagens.
- A auditoria de movimento inspeciona cada elemento e seus pseudo-elementos
  `::before` e `::after`, usa todas as durações/iterações computadas e reprova
  animações infinitas.
- Cinco testes adversariais comprovam que os auditores reprovam headings e
  landmarks inválidos, regiões vivas inválidas, movimento em elementos e
  pseudo-elementos, contraste abaixo dos limites ou sobre gradiente e,
  isoladamente, texto grande com contraste realmente inferior a `3:1`.
- A auditoria de movimento usa `prefers-reduced-motion: reduce` e confirmou
  catálogo, dialog e pedido:
  - `scroll-behavior: auto`;
  - animações efetivas até `0.01ms`;
  - no máximo uma iteração;
  - transições efetivas até `0.01ms`.

## Checklist manual

- [x] Ordem de tabulação coerente nos sete estados.
- [x] Indicador de foco visível e caixa positiva nos checkpoints.
- [x] Menu operável por setas, Home, End e Escape.
- [x] Três dialogs com foco inicial seguro, trap e restauração.
- [x] Summaries de login e cadastro focados após submissão inválida.
- [x] Campos inválidos associados por `aria-invalid` e `aria-describedby`.
- [x] Um `main` e um `h1` por estado.
- [x] Nomes de controles e landmarks não vazios.
- [x] Regiões vivas sem anúncio vazio ou severidade incorreta.
- [x] Contraste WCAG AA medido no background efetivo.
- [x] Movimento não essencial removido com preferência reduzida.
- [x] Artifacts permanecem fora do Git.

## RED/GREEN e estabilidade

- Boundary RED: módulo ausente e cinco políticas de navegação falhando.
- Boundary GREEN: 7/7; boundary + lazy: 13/13.
- Summaries RED: primeiro campo focado em login e cadastro.
- Summaries GREEN focado: 18/18 entre páginas e integrações relacionadas.
- A primeira tentativa anti-flake após um ajuste intermediário obteve 8/10 e
  reproduziu uma corrida entre o foco padrão do React Hook Form e o summary.
- A correção final usa `shouldFocusError: false` e o callback inválido.
- Anti-flake final: 10/10.

## Gates finais

Executados no Windows, Chromium, timezone `America/Sao_Paulo`:

- accessibility isolada final: 6/6 PASS;
- focados de landmark genérico e texto grande: 2/2 PASS;
- accessibility `--workers=1 --repeat-each=10`: 50/50 PASS;
- E2E Chromium completa: 19/19 PASS;
- E2E Chromium `--repeat-each=2`: 38/38 PASS;
- Vitest: 130/130 arquivos, 863/863 testes PASS;
- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run build`: PASS;
- chunk inicial: `465.83 kB`, abaixo do limite de `500 kB`;
- `git diff --check f6bc9e5..HEAD`: PASS;
- nenhum `.png`, `test-results` ou `playwright-report` rastreado.
