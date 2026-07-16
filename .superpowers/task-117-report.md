# Relatório de implementação — TASK-117

## Escopo e base

- Branch: `codex/phase-8-hardening`
- Base solicitada: `be8ef3ec1855d3b1aa38a58ff97eb70643039fa9`
- Produto e backend: não alterados
- Backlog: não alterado

## RED/GREEN

1. A spec inicial falhou porque `frontend/e2e/fixtures.ts` ainda não existia:
   `Cannot find module './fixtures'`.
2. Após instalar o backend em memória e a fixture, a spec parcial falhou no
   teardown com todas as contagens esperadas em zero, comprovando que o ledger
   era ativo.
3. A jornada completa encontrou uma ambiguidade semântica no label `Celular`;
   o seletor foi corrigido para `getByRole('textbox', { name: 'Celular',
   exact: true })`.
4. A primeira implementação tentou agrupar GETs próximos no tempo. A revisão
   classificou isso como `IMPORTANT`, pois escondia requests reais.
5. Removido o agrupamento, os handlers passaram a incrementar cada invocação.
   No servidor React de desenvolvimento, categorias produziram 8 requests e
   perfil variou entre 3 e 4. Execuções observadas:

   - isolada: `categories=8`, `profile=3`;
   - `--repeat-each=2`: ambas `categories=8`, `profile=4`;
   - `--repeat-each=4`: `categories=8`, com `profile` variando entre 3 e 4.

6. A causa foi o double-effect do React 19 `StrictMode` em desenvolvimento:
   o primeiro fetch do observer pode ser abortado antes ou depois de alcançar
   `browserContext.route`. Isso torna a contagem bruta do perfil dependente de
   uma corrida, mesmo com `networkidle`.
7. O servidor E2E passou a definir `NODE_ENV=production`, preservando o
   `<StrictMode>` e a SPA real, mas removendo somente o comportamento duplicado
   exclusivo do React em desenvolvimento. Quatro repetições paralelas
   produziram contagens brutas estáveis:

   - `register=1`;
   - `login=1`;
   - `categories=4`;
   - `profile=2`;
   - `logout=1`.

Os handlers incrementam diretamente em cada invocação; não há debounce,
janela temporal, agrupamento ou tolerância de faixa.

## Commits

- `1df7671` — `test(TASK-117): Tornar servidor E2E autocontido`
- `5dcaf30` — `test(TASK-117): Criar backend E2E deterministico`
- `56c0c5c` — `test(TASK-117): Isolar contexto e rede do Playwright`
- `b7ab442` — `test(TASK-117): Criar jornada E2E de autenticacao`
- Commit corretivo: criado após os gates finais.

## Gates

Comandos finais executados:

```text
npm --prefix frontend ci
npm --prefix frontend run test:e2e -- --project=chromium
npm --prefix frontend run test:e2e -- --project=chromium --repeat-each=2
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build
git diff --check be8ef3e..HEAD
```

Resultados finais e hash do commit corretivo são comunicados ao orquestrador
após a execução.

## Notas não bloqueantes

- `npm ci` reporta duas vulnerabilidades moderadas no audit; nenhum
  `npm audit fix --force` foi executado porque isso ampliaria o escopo.
- O build reporta o warning preexistente de chunk principal acima de 500 kB.
- `playwright-report/`, `test-results/` e `dist/` permanecem fora do commit.
