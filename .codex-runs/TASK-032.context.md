# TASK-032 Context

## Objetivo

Implementar os estados de erro, carregamento e sucesso no login, mantendo o
escopo restrito a `frontend/src/app/domains/auth/login-page.component.ts` e aos
testes da mesma feature.

## Contexto confirmado

- A tela de login ja existe e faz validacao por schema.
- Os componentes compartilhados `app-loading-state`, `app-error-state` e
  `app-success-state` ja estao disponiveis.
- `AuthService.login()` ja retorna a sessao autenticada e persiste o token.
- O backlog em `docs/frontend-backlog.md` precisa ser atualizado ao final.

## Plano de implementacao

1. Adicionar estado interno para `loading`, `error` e `success` no login.
2. Exibir os componentes de estado compartilhados conforme a resposta da
   autenticacao.
3. Cobrir o fluxo com testes de componente para validacao, carregamento, erro e
   sucesso.
4. Marcar a TASK-032 como concluida no backlog.
