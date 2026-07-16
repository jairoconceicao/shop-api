# TASK-122 — Relatório de exploração

## Baseline e elegibilidade

- `BASE_COMMIT`: `f33cd202e79c9fe86889731c48a553ec6429ea4f`
- Branch: `codex/phase-8-hardening`
- A TASK-122 estava `READY`, com TASK-010, TASK-111 a TASK-117 concluídas.
- Baseline E2E anterior à implementação: **6/6 PASS** no Chromium.
- O plano `docs/superpowers/plans/2026-07-16-task-122-orders-e2e.md`
  correspondia ao comportamento e aos contratos existentes.
- Nenhum blocker de produto, infraestrutura ou dependência foi encontrado.

## Infraestrutura reutilizada

- `frontend/e2e/fixtures.ts` já fornecia isolamento de cookies, storages,
  handlers e contagens por teste.
- `frontend/e2e/support/authApi.ts` já centralizava dados determinísticos,
  autorização estrita, backend em memória e teardown.
- A implementação deveria ampliar esse helper, sem criar outra fixture ou
  interceptador.
- `frontend/playwright.config.ts` não fixava timezone. A exploração confirmou
  que `America/Sao_Paulo` era necessário para provar os limites civis exatos do
  filtro de pedidos.

## Contratos confirmados

- Lista: `GET /api/v1/pedido` com CPF, `page=1`, `size=20` e período opcional.
- Período civil esperado:
  - início `2026-07-01T03:00:00.000Z`;
  - fim `2026-07-16T02:59:59.999Z`.
- Detalhe: `GET /api/v1/pedido/:pedidoId`.
- Cancelamento: `PATCH /api/v1/pedido/:pedidoId` com body exato
  `{"status":"Cancelado"}`.
- Recusa: HTTP `422` com `ORDER_NOT_CANCELLABLE`, sem mutar o status confirmado
  `Criado`.
- Itens repetindo o mesmo `produtoId` devem renderizar separadamente, mas
  consultar o produto somente uma vez por carga fria do detalhe.

## Seletores e jornada

- Os componentes existentes ofereciam seletores semânticos suficientes:
  headings, articles nomeados, labels de data, links de pedido, regiões
  `Resumo` e `Itens confirmados`, diálogo e alert.
- A navegação autenticada poderia ser feita pela UI e pelo menu
  `Área do cliente` → `Meus pedidos`.
- O reload exigia marcar `Manter conectado`; nenhuma injeção direta em storage
  era necessária.
- Não foi identificado seletor que exigisse `data-testid`, CSS ou mudança no
  produto.

## Contagens previstas

A exploração confirmou ledgers dedicados para:

```text
ordersList=2
orderDetail=4
product=1
orderProduct=3
orderCancel=1
```

Os demais valores deveriam continuar literais e ser ajustados apenas a partir
do tráfego observado. A implementação final registra `login=2` e
`categories=5`, pois a prova de revisão inclui uma carga fria do produto comum,
uma tentativa protegida de retorno ao detalhe, novo login pela UI e o reload
final do detalhe.

## Resultado

O plano estava executável sem mudança de produto. O escopo ficou restrito a
configuração Playwright, extensão do backend E2E compartilhado e criação da
spec de pedidos, com RED comportamental, contagens exatas, repetição e gates
completos.
