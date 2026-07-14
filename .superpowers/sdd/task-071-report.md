# TASK-071 — Página do carrinho

## Resultado

- Implementada a rota protegida `/carrinho` com a página real do carrinho.
- Compostos `useCartQuery` e `useCartProductsQuery` sem chamadas condicionais de hooks.
- Cobertos estados sem vínculo, vazio, carregamento, erro recuperável e hidratação parcial.
- Preservada a ordem confirmada dos itens e os snapshots de preço e quantidade do carrinho.
- Resumo limitado a subtotal e total equivalentes, sem frete ou desconto.
- Layout responsivo em uma coluna e resumo lateral sticky no desktop.
- Corrigido o landmark principal duplicado identificado na revisão.

## TDD

- RED inicial: `CartPage.test.tsx` falhou porque `CartPage` ainda não existia.
- GREEN inicial: 19/19 testes focados passaram após página e integração da rota.
- RED da revisão: `App.test.tsx` encontrou 2 elementos com role `main` na rota real.
- GREEN da revisão: 19/19 testes focados passaram após usar wrapper neutro na página.

## Validação

- Testes focados: 19/19.
- Suíte completa: 409/409 em 66 arquivos.
- Typecheck: PASS.
- Lint: PASS.
- Build: PASS.
- `git diff --check`: PASS.
- Observação: o build mantém o warning preexistente de chunk acima de 500 kB.

## Commits

- `b93df6d` — `feat(TASK-071): Implementar página do carrinho`
- Correção de revisão: `fix(TASK-071): Evitar landmark principal duplicado`

## Findings

- CRITICAL: nenhum.
- IMPORTANT: landmark principal duplicado — corrigido e coberto por integração.
- Pendentes: nenhum.
