# TASK-033 Context

## Objetivo

Cobrir com testes o fluxo de login e a persistencia de sessao do frontend,
mantendo o escopo restrito aos arquivos da feature de autenticacao.

## Contexto confirmado

- A tela `LoginPageComponent` ja existe e possui validacao por schema.
- A camada de sessao `LocalStorageAuthSessionStorageService` ja trata
  persistencia, compatibilidade com chave legada e expiracao.
- Os testes existentes cobrem os fluxos principais, mas nao exercitam todos os
  ramos relevantes de login e sessao.
- O backlog em `docs/frontend-backlog.md` deve ser atualizado ao final.

## Plano de implementacao

1. Adicionar um teste de componente que valide o envio de `lembrarMe` no login.
2. Adicionar um teste unitario para atualizar o token quando ja existe sessao
   persistida.
3. Marcar a TASK-033 como concluida no backlog.
