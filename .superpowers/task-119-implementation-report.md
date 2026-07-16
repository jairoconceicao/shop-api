# Relatório de implementação da TASK-119

## Identificação

- **BASE_COMMIT:** `c461201caf381f0b1a4a23e27111c969e03316ef`
- **Branch:** `codex/phase-8-hardening`
- **Plano aprovado:** `docs/superpowers/plans/2026-07-16-task-119-cart-lifecycle-e2e.md`
- **Correção do plano:** `314124e9db51705e7f1c66a4a4da27351c8a3296`

## Commits de implementação

- `292557b6686ca1af6b66a22efbad37a764a07150` —
  `test(TASK-119): Tornar carrinho E2E mutável`
- `0b38d98727dc29b6bf143a112bc7238835139cd0` —
  `test(TASK-119): Cobrir ciclo completo do carrinho`

O primeiro commit tornou o backend Playwright em memória mutável e estrito para
POST, PATCH e DELETE. O segundo adicionou a jornada autenticada completa de
adicionar, alterar a quantidade e remover o item.

## Evidência TDD

O typecheck RED previsto no plano não falhou: a tipagem estrutural aceitou as
chaves adicionais no objeto passado a `expectRequestCounts`. A prova RED
comportamental foi executada antes dos handlers de atualização e remoção:

```text
npm --prefix frontend run test:e2e -- cart-lifecycle.spec.ts --project=chromium
Exit code: 1
Error: Unexpected API request: PATCH
http://localhost:5228/api/v1/carrinho/items/43007
```

Essa falha ocorreu no primeiro PATCH, pelo motivo esperado: o backend E2E ainda
não reconhecia a operação. Depois da implementação mínima, a mesma spec passou
1/1.

## Tráfego bruto confirmado

```text
register=0
login=1
categories=3
profile=0
logout=0
product=2
cartCreate=1
cartAdd=1
cartGet=4
cartUpdate=1
cartDelete=1
```

As três leituras de categorias correspondem a:

1. montagem inicial do `StoreLayout` em `/carrinho`, antes do redirect protegido;
2. remontagem após o login retornar a `/carrinho`;
3. nova carga completa ao executar `page.goto(productPath)`.

O retorno do produto ao carrinho é navegação SPA e reutiliza layout e cache.
Essa contagem observada substituiu a previsão inicial de uma leitura e foi
incorporada ao plano no commit `314124e`.

Os quatro GETs do carrinho correspondem à ativação do badge após `setCartId` e
às reconciliações confirmadas após POST, PATCH e DELETE. Cada comando mutável
ocorre exatamente uma vez.

## Gates executados sequencialmente

| Gate | Resultado |
| --- | --- |
| Spec isolada | 1/1 PASS |
| Guest cart + lifecycle | 2/2 PASS |
| Spec isolada `--repeat-each=2` | 2/2 PASS |
| Suíte Chromium | 4/4 PASS |
| Suíte Chromium `--repeat-each=2` | 8/8 PASS |
| `npm --prefix frontend run typecheck` | PASS |
| `npm --prefix frontend run lint` | PASS |
| `npm --prefix frontend run build` | PASS |
| `git diff --check c461201..HEAD` | PASS |

Lint e Playwright foram executados sequencialmente porque a exploração
identificou uma corrida quando ambos manipulam ou percorrem
`frontend/test-results`.

## Escopo e advertências

- Nenhum arquivo de produto em `frontend/src/**` foi alterado.
- Nenhum arquivo do backend ASP.NET foi alterado.
- `docs/frontend-tasks-v2.md` não foi alterado e a TASK-119 não foi marcada
  como `DONE`.
- A implementação alterou somente
  `frontend/e2e/support/authApi.ts` e criou
  `frontend/e2e/cart-lifecycle.spec.ts`.
- O build preservou o warning preexistente de chunk principal acima de 500 kB:
  `index-Dczxt3Xo.js`, 726,61 kB minificado. O warning não falhou o gate.
