# Relatório de implementação da TASK-118

## Escopo

- `BASE_COMMIT`: `2745a4c8993b9b4fb025a881cc1f038fa634ad3f5`
- Branch: `codex/phase-8-hardening`
- Nenhum arquivo de produto, backend ASP.NET ou backlog foi alterado.

## TDD

O RED foi comprovado executando a nova spec antes da extensão do `AuthApi`.
Ela falhou ao acessar `data.product.id`, ainda ausente. O `typecheck` isolado
não inclui as specs Playwright e, por isso, não constitui o RED deste projeto.

Após a implementação mínima do backend em memória, a primeira execução alcançou
o fluxo real e mostrou `cartGet=2`. O diagnóstico confirmou dois requests
distintos:

1. ativação do query do badge após persistir o novo `cartId`;
2. reconciliação explícita após adicionar o item.

A expectativa final exige exatamente dois GETs, sem `waitForTimeout` ou outra
temporização.

## Contratos e contagens finais

- `login=1`
- `categories=1`
- `product=2`
- `cartCreate=1`
- `cartAdd=1`
- `cartGet=2`
- `register=0`
- `profile=0`
- `logout=0`

O POST do item exige `produtoId=42`, `quantidade=3` e
`valorUnitario=3499.9`. Antes e durante o login, os três contadores de carrinho
permanecem em zero.

## Commits

- `d78bc3a` — `test(TASK-118): estender backend E2E para carrinho`
- `fe7ac0e` — `test(TASK-118): cobrir visitante antes de adicionar produto`
- `87e5aa2` — `docs(TASK-118): registrar exploracao e contagem do carrinho`

## Verificações

- Spec isolada com `--repeat-each=2`: 2/2 PASS.
- Suíte Chromium: 3/3 PASS.
- Suíte Chromium com `--repeat-each=2`: 6/6 PASS.
- Typecheck: PASS.
- Lint: PASS.
- Build: PASS.
- `git diff --check 2745a4c..HEAD`: PASS.
- Busca por seletores frágeis e espera temporal na nova spec: nenhuma
  ocorrência.

O build manteve o warning preexistente de chunk principal acima de 500 kB.
