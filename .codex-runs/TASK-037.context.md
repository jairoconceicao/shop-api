# TASK-037 context

## Objetivo

Aplicar validacoes por schema no formulario de cadastro de cliente, mantendo o
escopo restrito ao frontend e sem antecipar integracao com a API.

## Contexto confirmado

- O formulario de cadastro ja existe em `RegisterFormComponent`.
- Os campos com mascara foram implementados na TASK-036.
- O backend de referencia valida CPF, nome, data de nascimento, email,
  endereco, celular e senha para o cadastro de cliente.
- O backlog em `docs/frontend-backlog.md` deve ser atualizado ao final.

## Plano de implementacao

1. Extrair a validacao do cadastro para um schema local da feature.
2. Exibir os erros do schema no formulario existente.
3. Cobrir o schema e o componente com testes de unidade/componente.
4. Marcar a TASK-037 como concluida no backlog.
