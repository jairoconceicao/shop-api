# TASK-122 — Relatório de implementação

## Escopo e baseline

- `BASE_COMMIT`: `f33cd202e79c9fe86889731c48a553ec6429ea4f`
- Branch: `codex/phase-8-hardening`
- Escopo alterado:
  - `frontend/playwright.config.ts`
  - `frontend/e2e/support/authApi.ts`
  - `frontend/e2e/orders.spec.ts`
- Nenhum código de produto, backend ASP.NET ou backlog foi alterado.

## Commit funcional

- `17a5ee9` — `test(TASK-122): Cobrir consulta e recusa de cancelamento`

## TDD

1. A spec completa foi criada antes dos handlers de pedidos.
2. O RED comportamental alcançou `GET /api/v1/pedido` e falhou porque o helper
   existente aceitava apenas `POST`.
3. Foram adicionados fixtures determinísticos, quatro ledgers e handlers
   estritos para lista, detalhe, produto do pedido e cancelamento recusado.
4. A navegação para a lista passou a usar o menu semântico da SPA. Isso evita
   uma remontagem artificial do shell e estabiliza `categories=2`: home após
   login e reload do detalhe.
5. O `Referer` do fetch não representou de forma confiável a rota corrente da
   SPA. O ledger `orderProduct` é classificado após a leitura confirmada do
   detalhe, mantendo as jornadas anteriores no ledger `product`.
6. O GREEN focado passou com contagens exatas:

```text
register=0 login=1 categories=3 catalog=1 profile=1 profileUpdate=0
passwordUpdate=0 logout=0 product=1 cartCreate=0 cartAdd=0 cartGet=0
cartUpdate=0 cartDelete=0 orderCreate=0 ordersList=2 orderDetail=3
orderProduct=2 orderCancel=1
```

## Evidência funcional

- Login realizado pela UI com persistência explícita para suportar o reload.
- Lista inicial retorna dois pedidos conhecidos e isolados.
- Filtro civil de `2026-07-01` a `2026-07-15` envia os limites ISO de São Paulo,
  `page=1`, `size=20` e o CPF confirmado, sem parâmetros extras.
- O detalhe renderiza dois itens com o mesmo produto e valores unitários
  distintos.
- Cada carga fria do detalhe consulta o produto repetido apenas uma vez.
- O PATCH exige autorização e body exato `{"status":"Cancelado"}`.
- A API simulada responde `422` com `ORDER_NOT_CANCELLABLE`.
- A UI anuncia a recusa, refaz a leitura do detalhe e mantém `Criado`.
- Após reload, o detalhe continua com `Criado` e os dois itens confirmados.
- Uma navegação fria posterior para o produto comum incrementa `product`, sem
  reutilizar indevidamente o contexto já consumido de `orderProduct`.

## Gates executados

```text
npm --prefix frontend run test:e2e -- orders.spec.ts --project=chromium
PASS — 1/1

npm --prefix frontend run test:e2e -- orders.spec.ts \
  --project=chromium --repeat-each=20
PASS — 20/20

npm --prefix frontend run test:e2e -- --project=chromium
PASS — 7/7

npm --prefix frontend run test:e2e -- --project=chromium --repeat-each=2
PASS — 14/14

npm --prefix frontend run typecheck
PASS

npm --prefix frontend run lint
PASS

npm --prefix frontend run build
PASS — 387 módulos transformados

git diff --check f33cd20..HEAD
PASS
```

O build preserva o warning preexistente do chunk inicial de `726,61 kB`, sem
falha do gate.

## Resultado

A implementação da TASK-122 possui evidência reproduzível para lista, filtro,
detalhe, deduplicação de produto, cancelamento recusado, refetch e reload com
status confirmado. A atualização do backlog permanece responsabilidade do
orquestrador após a revisão independente.
