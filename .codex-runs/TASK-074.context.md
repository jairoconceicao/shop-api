# TASK-074 Context

## Objetivo

Cobrir a store de carrinho com testes unitarios e validar os fluxos de carrinho
com testes focados nos contextos de criacao e leitura, sem alterar o
comportamento atual do dominio.

## Contexto confirmado

- A store `CartStore` ja existe em `frontend/src/app/domains/cart/cart.store.ts`.
- Os fluxos de orquestracao do carrinho estao isolados em
  `cart-create.context.ts` e `cart-read.context.ts`.
- Existe cobertura inicial para a store e para a pagina do carrinho, mas os
  fluxos de criacao e leitura ainda nao estao cobertos por spec dedicada.
- O backlog em `docs/frontend-backlog.md` deve ser atualizado ao final.

## Plano de implementacao

1. Revisar a cobertura atual da store e dos contextos do carrinho.
2. Acrescentar testes unitarios para comportamentos relevantes e bordas.
3. Adicionar testes de fluxo para criacao e leitura do carrinho.
4. Marcar a tarefa como concluida no backlog.
