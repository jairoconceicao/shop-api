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
- `2a63572` —
  `test(TASK-120): Estabilizar contagem E2E do checkout`

O primeiro commit adicionou ao backend Playwright o contrato estrito de pedido,
snapshot defensivo do cliente, confirmação determinística e consumo do item. O
segundo criou a jornada UI de carrinho, checkout, confirmação e carrinho vazio.
O terceiro removeu a corrida do redirect inicial e registrou o catálogo da home
no ledger estrito.

**Range atualizado da TASK-120:** `746925c..2a63572`.

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
categories=2
catalog=1
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

As duas leituras de categorias correspondem à home pós-login e à carga completa
iniciada por `page.goto` no produto. A única leitura de catálogo corresponde à
home e usa a query exata `?page=1&size=20`. As duas leituras do carrinho
correspondem à ativação após criar o vínculo e à reconciliação do item
adicionado; o checkout reutiliza o cache confirmado.

Ao final, `emptyCartLink` executa uma navegação SPA para `/carrinho` e reutiliza
layout e cache. Por isso não ocorre uma terceira leitura de categorias nem um
novo GET do carrinho.

## Reabertura e estabilização

Após a conclusão inicial, `--repeat-each=20` reabriu a task ao produzir 5
falhas com `categories: expected 3, received 2`. A causa raiz era a entrada por
`/carrinho`: `StoreLayout` iniciava categorias, enquanto `ProtectedRoute`
redirecionava para `/entrar`, tornando a contabilização dependente do
cancelamento da requisição.

A jornada agora inicia diretamente em `/entrar`, espera categorias e catálogo
da home no ledger estrito, confirma `/` após autenticar pela UI e segue por
carga completa ao produto. Isso remove a requisição cancelável sem relaxar o
ledger exato; as contagens estáveis passam a `categories=2` e `catalog=1`.

## Gates GREEN

| Gate | Resultado |
| --- | --- |
| Spec isolada | 1/1 PASS |
| Guest cart + lifecycle + checkout | 3/3 PASS |
| Spec isolada `--repeat-each=2` | 2/2 PASS |
| Suíte Chromium | 5/5 PASS |
| Suíte Chromium `--repeat-each=2` | 10/10 PASS |
| Estabilização `checkout.spec.ts --repeat-each=20` | 20/20 PASS |
| Suíte Chromium atual `--repeat-each=2` | 12/12 PASS |
| `npm --prefix frontend run typecheck` | PASS |
| `npm --prefix frontend run lint` | PASS |
| `npm --prefix frontend run build` | PASS |
| `git diff --check` da estabilização | PASS |

Lint e Playwright foram mantidos sequenciais devido à corrida conhecida sobre
`frontend/test-results`.

## Divergência do plano

A previsão inicial dependia de uma consulta iniciada durante o redirect
protegido e, portanto, não era determinística. A jornada corrigida usa
`/entrar` como entrada pública, mantém o `emptyCartLink` final pela SPA e
registra a topologia estável `categories=2`, sem leitura adicional do carrinho.

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
