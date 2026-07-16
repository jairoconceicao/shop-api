# TASK-107 — relatório de implementação

Status: DONE

## TDD

- RED: `npm --prefix frontend test -- src/shared/formatting/currency.test.ts src/shared/dates/localCivilDate.test.ts src/shared/formatting/personalData.test.ts`
- Resultado RED: exit 1; moeda falhou por módulo `./currency` ausente; `Invalid Date` falhou porque nenhuma `RangeError` foi lançada; dados pessoais passaram. Total: 1 teste falhou, 29 passaram e uma suíte não carregou.
- GREEN: o mesmo comando após a implementação mínima.
- Resultado GREEN: exit 0; 3 arquivos e 33 testes passaram.

## Alterações

- Criado `formatCurrency` compartilhado com locale `pt-BR` e moeda `BRL`.
- Migrados exatamente 9 consumidores e 13 chamadas, sem alteração de markup ou classes.
- `localCivilDate` agora rejeita `Invalid Date` com `RangeError`, preservando getters locais.
- Adicionados round-trips de CPF, CEP e telefone; `+55` continua sendo apenas entrada de dígitos truncada, sem regra semântica nova.
- Registrada a matriz em `docs/frontend-quality/task-107-formatting-matrix.md`.

## Verificação

- Testes dos 9 consumidores, `orderPresentation`, `ordersUrl` e `customerProfile`: 12 arquivos, 116 testes, exit 0.
- `TZ=America/Sao_Paulo`: `localCivilDate` + `ordersUrl`, 2 arquivos, 12 testes, exit 0.
- `TZ=UTC`: `localCivilDate` + `ordersUrl`, 2 arquivos, 12 testes, exit 0.
- `npm --prefix frontend run typecheck`: exit 0.
- `npm --prefix frontend run lint`: exit 0.
- `git diff --check`: exit 0.
- Busca estrutural: 0 arquivos com `Intl.NumberFormat` em features; 9 consumidores e 13 chamadas de `formatCurrency`.

## Self-review

- Escopo restrito à TASK-107; backlog não alterado.
- O helper não adiciona validação de valores não finitos, pois isso não consta dos critérios.
- A migração troca apenas imports, constantes e expressões de formatação.
- Nenhum finding ou concern pendente.

## Commits

- `bc88d9c` — `fix(TASK-107): Centralizar formatação monetária`.
