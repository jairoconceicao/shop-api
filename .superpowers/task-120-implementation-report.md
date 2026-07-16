# Relatório de implementação da TASK-120

## Identificação

- **BASE_COMMIT:** `746925c7e088de40432d2cf0f1d2a82521ee0b4f`
- **Branch:** `codex/phase-8-hardening`
- **Plano aprovado:**
  `docs/superpowers/plans/2026-07-16-task-120-checkout-e2e.md`

## Commits de implementação

- `8826f4c61757ab9c90088a67c0c1feec07cdacc1` —
  `test(TASK-120): Estender backend E2E para pedidos`
- `2f33090eb4d6ca7edf908554b89756d008e97b5e` —
  `test(TASK-120): Cobrir jornada E2E do checkout`

O primeiro commit adicionou ao backend Playwright o contrato estrito de pedido,
snapshot defensivo do cliente, confirmação determinística e consumo do item. O
segundo criou a jornada UI de carrinho, checkout, confirmação e carrinho vazio.

## Evidência TDD

A spec foi executada antes de existir o handler de criação de pedido. O RED
alcançou a fronteira esperada e falhou por endpoint inesperado:

```text
npm --prefix frontend run test:e2e -- checkout.spec.ts --project=chromium
Exit code: 1
Error: Unexpected API request: POST
http://localhost:5228/api/v1/pedido
```

Depois da implementação mínima do endpoint estrito, a mesma spec passou 1/1.
Ela também confirmou duas tentativas síncronas de submit, mas exatamente um
`orderCreate`.

## Tráfego bruto confirmado

```text
register=0
login=1
categories=3
profile=1
logout=0
product=2
cartCreate=1
cartAdd=1
cartGet=2
cartUpdate=0
cartDelete=0
orderCreate=1
```

As três leituras de categorias correspondem à montagem inicial do layout
protegido do carrinho, à remontagem do carrinho autenticado e à carga completa
iniciada por `page.goto` no produto. As duas leituras do carrinho correspondem
à ativação após criar o vínculo e à reconciliação do item adicionado; o checkout
reutiliza o cache confirmado.

Ao final, `emptyCartLink` executa uma navegação SPA para `/carrinho` e reutiliza
layout e cache. Por isso não ocorre uma quarta leitura de categorias nem um
quarto GET do carrinho.

## Gates GREEN

| Gate | Resultado |
| --- | --- |
| Spec isolada | 1/1 PASS |
| Guest cart + lifecycle + checkout | 3/3 PASS |
| Spec isolada `--repeat-each=2` | 2/2 PASS |
| Suíte Chromium | 5/5 PASS |
| Suíte Chromium `--repeat-each=2` | 10/10 PASS |
| `npm --prefix frontend run typecheck` | PASS |
| `npm --prefix frontend run lint` | PASS |
| `npm --prefix frontend run build` | PASS |
| `git diff --check 746925c..HEAD` | PASS |

Lint e Playwright foram mantidos sequenciais devido à corrida conhecida sobre
`frontend/test-results`.

## Divergência do plano

A previsão inicial superestimava em uma leitura e tratava a ida final ao
carrinho como nova carga completa. A implementação usa o `emptyCartLink`
visível na confirmação; esse link navega pela SPA, preserva o layout e reutiliza
o cache. A contagem observada e correta é `categories=3`, sem leitura adicional
do carrinho. O plano foi corrigido para registrar essa topologia real.

## Escopo e advertências

- Nenhum arquivo de produto em `frontend/src/**` foi alterado.
- Nenhum arquivo do backend ASP.NET foi alterado.
- `docs/frontend-tasks-v2.md` e o backlog não foram alterados.
- A implementação alterou somente
  `frontend/e2e/support/authApi.ts` e criou
  `frontend/e2e/checkout.spec.ts`.
- O build preservou o warning preexistente de chunk principal acima de 500 kB;
  ele não falhou o gate.
- Este relatório registra evidências; marcar a TASK-120 como `DONE` continua
  sendo responsabilidade do orquestrador após revisão.
