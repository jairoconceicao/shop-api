# TASK-031 Context

## Objetivo

Implementar a tela de login com validacao por schema, mantendo o escopo restrito
ao frontend e sem antecipar estados de loading, erro global ou sucesso.

## Contexto confirmado

- A rota `/login` ja existe e usa `LoginPageComponent`.
- Os componentes base `app-input`, `app-checkbox`, `app-button` e
  `app-form-error` ja estao disponiveis.
- A autenticacao e a persistencia de sessao ja estao preparadas no backend do
  frontend; esta tarefa foca na tela e na validacao do formulario.
- O backlog em `docs/frontend-backlog.md` deve ser atualizado ao final.

## Plano de implementacao

1. Substituir a tela base de login por um formulario controlado.
2. Isolar a regra de validacao em uma schema local da feature.
3. Cobrir a schema e o componente com testes de unidade/componente.
4. Marcar a tarefa como concluida no backlog.
