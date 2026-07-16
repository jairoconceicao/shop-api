# TASK-126 — Relatório de implementação

## Base e commits

- Base: `05c79cd039c918ce70b831ad17e0d9e0025bae4f`
- `ab8fc29` — contrato e idempotência da fronteira privada
- `54b9ce4` — logout, `401`, cancelamento, resposta tardia e bootstrap
- `6902152` — auditor reproduzível e evidência
- `29cc1fa` — expectativas de integração da nova limpeza

## Alterações

- `clearPrivateSession` remove defensivamente cópia stale do carrinho em
  `sessionStorage`, preserva outro cliente e dados públicos, e é idempotente.
- Logout captura `{ clienteId, token }` em `onMutate` e não limpa sessão
  sucessora.
- `401` e cancelamento delegam à fronteira única.
- Resposta tardia de criação de carrinho só persiste/reconcilia com identidade
  completa ainda ativa.
- Bootstrap não envia causa ao console sem reporter explicitamente injetado.
- `audit:private-data` inventaria sinks e chaves, bloqueia console/mensagens
  sensíveis e contém testes negativos para terceira chave e chave dinâmica.

## Evidência TDD

- RED: cópia stale `shop-api:cart-session` permaneceu em `sessionStorage`.
- RED: callbacks tardios de criação persistiam carrinho após troca/remoção de
  identidade.
- RED: fallback do bootstrap enviava causa bruta ao `console.error`.
- GREEN focado: 6 arquivos, 19 testes.

## Gates finais

- `npm test`: 129 arquivos, 854 testes, PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run audit:private-data`: 152 arquivos, duas chaves, zero console; testes
  negativos PASS.
- `npm run build`: PASS; chunk inicial `464.54 kB`.
- `npx playwright test e2e/auth.spec.ts --project=chromium`: 1/1 PASS.
