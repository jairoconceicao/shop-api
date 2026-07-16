# TASK-111 — Relatório de implementação

## Resultado

- Integração real de autenticação criada com MemoryRouter, QueryClient, providers e MSW estrito.
- Login prova persistência local e `returnTo` interno seguro, rejeitando destinos externos.
- Logout remoto em 401 e 500 prova limpeza resiliente de autenticação e cache privado, preservando `cartSessionStore` conforme decisão registrada.
- Fronteira global de 401 usa latch idempotente, rearma após uma nova sessão e coalesce duas respostas 401 concorrentes.
- Resposta privada 200 tardia não repopula cache nem UI após o logout forçado.
- O teste de persistência revelou overflow do timer nativo para expirações distantes; o inicializador agora agenda a expiração em intervalos seguros.

## Evidência TDD

- RED idempotência: `createUnauthorizedHandler is not a function`.
- GREEN idempotência: 1/1 teste focado passou.
- RED rearm: `rearmUnauthorizedLatch is not a function`.
- GREEN rearm: 1/1 teste focado passou.
- RED timer distante: os três casos de login chegaram ao destino, mas a sessão foi removida imediatamente (`localStorage` nulo).
- GREEN timer distante: 3/3 casos de login passaram.

## Gates executados

- Integração auth: 8/8 PASS.
- Suite auth: 64/64 PASS.
- Consumidores App/cart/checkout: 230/230 PASS.
- Teste focado de expiração ativa: 1/1 PASS.
- `npm --prefix frontend run typecheck`: PASS.
- `npm --prefix frontend run lint`: PASS.
- `git diff --check`: PASS.

## Commits

- `6ec0d8e` — `test(TASK-111): Integrar autenticação com MSW`.
- Implementação: commit `fix(TASK-111)` que contém este relatório.

## Observações

- `frontend/src/shared/testing/setup.ts` permanece com `onUnhandledRequest: 'error'`.
- O backlog foi marcado como DONE somente após a revisão obrigatória aprovar o range sem findings.
- Suites consumidoras passaram, embora quatro testes preexistentes de checkout tenham emitido avisos de `act(...)` no stderr.

## Ledger

- TASK-111: `COMPLETE`.
- Range revisado: `09c47fb..272cb59`.
- Review: aprovada com 0 findings.
- Backlog: atualizado para `[x]` / `DONE` após aprovação.
