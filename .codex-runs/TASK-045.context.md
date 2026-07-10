# TASK-045 Context

## Objetivo

Implementar cards de produto com imagem, titulo, preco, estoque e CTA, mantendo
o escopo restrito ao frontend e reaproveitando a home publica atual.

## Contexto confirmado

- A home publica ja consome produtos em destaque via `CatalogService`.
- O card atual estava embutido na `HomePageComponent`.
- O componente deve ser reutilizavel para a home e para fluxos de catalogo
  futuros, sem antecipar rotas ou interacoes nao pedidas.
- O backlog em `docs/frontend-backlog.md` deve ser atualizado ao final.

## Plano de implementacao

1. Extrair o card de produto para um componente compartilhado.
2. Reusar o componente na home publica sem alterar o fluxo de dados.
3. Cobrir o novo componente e a home com testes ajustados.
4. Marcar a tarefa como concluida no backlog.
