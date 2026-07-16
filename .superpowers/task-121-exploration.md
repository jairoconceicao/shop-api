# TASK-121 — Relatório de exploração

## Baseline e elegibilidade

- `BASE_COMMIT`: `9838c65e3e7eef320fada1a252a660bc211ee43d`
- Branch/worktree: `codex/phase-8-hardening`, isolado em `.worktrees/phase-8-hardening`.
- `TASK-111` a `TASK-117`: `DONE`.
- `TASK-121`: `READY`, com todas as dependências concluídas e critérios definidos.
- Worktree limpo antes da exploração.

Baseline executado:

```text
npm run typecheck
PASS

npm run test -- --run \
  src/features/customer/pages/CustomerDataPage.test.tsx \
  src/features/customer/pages/CustomerPasswordPage.test.tsx \
  src/features/customer/components/CpfChangeDialog.test.tsx \
  src/features/customer/components/PasswordRules.test.tsx
PASS — 4 arquivos, 23 testes

npm run test:e2e -- auth.spec.ts --project=chromium
PASS — 1 teste
```

## Infraestrutura a reutilizar

`frontend/e2e/fixtures.ts` já fornece:

- instalação automática de `AuthApi` por teste;
- cookies limpos antes da jornada;
- `authApi.reset()` antes e depois;
- verificação obrigatória de contagens no `finally`;
- limpeza de `localStorage`, `sessionStorage`, cookies e rotas mesmo após falha.

Não há necessidade de alterar a fixture.

`frontend/e2e/support/authApi.ts` já oferece os pontos corretos:

- `seedCustomer()` para autenticação real pela UI, sem injetar sessão;
- `customerSnapshot()` que omite `senha`;
- `expectRequestCounts()` e `assertRequestCounts()` com zero implícito para requests não declarados;
- um único interceptador que bloqueia tráfego desconhecido;
- validação de método, bearer token e JSON determinístico;
- estado mutável `registeredCustomer`, apropriado para persistir perfil e senha entre requests da jornada.

## Alterações necessárias no helper

Adicionar a `RequestName` e ao inicializador de `counts`:

```ts
profileUpdate
passwordUpdate
```

Adicionar tipos exatos:

```ts
type UpdateCustomerRequest = Omit<RegistrationRequest, 'senha'>
type UpdatePasswordRequest = {
  senhaAtual: string
  senhaNova: string
}
```

### Posicionamento dos handlers

1. O handler de `PUT /api/v1/cliente/{id}/senha` deve ficar antes do handler genérico `/api/v1/cliente/{id}`. Embora as comparações atuais sejam por igualdade e não por prefixo, esse posicionamento mantém a rota mais específica protegida de futuras generalizações.
2. O bloco atual de perfil deve passar de GET-only para branches explícitos:
   - `GET`: comportamento atual e incremento de `profile`;
   - `PUT`: incremento de `profileUpdate`, validação integral do body e mutação de `registeredCustomer`;
   - demais métodos: erro explícito.
3. O endpoint de senha deve aceitar exatamente duas tentativas:
   - primeira: body esperado, `422` com `SenhaAtual`, sem mutar senha;
   - segunda: body esperado, `200`, mutando a senha;
   - terceira: erro explícito.
4. `reset()` deve zerar o contador local de tentativas de senha. Os novos request counters serão zerados pelo loop genérico já existente.

O PUT de perfil produzido pelo produto contém exatamente:

```text
cpf, nome, dataNascimento, email, endereco, celular
```

`adaptUpdateCustomerRequest()` normaliza CPF, remove máscara do CEP, aplica trim, converte complemento vazio em `null` e normaliza UF para maiúsculas. Não inclui `clienteId` nem `senha`.

## Jornada e seletores confirmados

Rotas:

- dados: `/minha-conta/dados`;
- senha: `/minha-conta/senha`;
- login: `/entrar`.

Seletores semânticos disponíveis:

- headings: `Meus dados`, `Alterar senha`;
- inputs: `Nome completo`, `CPF`, `E-mail`, `Logradouro`, `Senha atual`, `Nova senha`;
- botões: `Salvar alterações`, `Confirmar alteração`, `Alterar senha`;
- link da navegação da conta: `Trocar senha`;
- dialog nomeado: `Confirmar alteração do CPF`;
- lista nomeada: `Regras da nova senha`;
- sucesso de perfil: `role=status`, texto `Dados atualizados com sucesso.`;
- sucesso de senha: `role=status`, texto `Senha alterada com sucesso.`;
- erros de campo são anunciados pelo controle de formulário e podem ser localizados por `role=alert`.

O dialog mostra `CPF atual` e `Novo CPF`, com ambos formatados, e o PUT somente é disparado após `Confirmar alteração`.

As quatro regras literais são:

1. `Mínimo de oito caracteres`
2. `Uma letra maiúscula`
3. `Um número`
4. `Um caractere especial entre !@#$%`

Cada item também expõe `Atendida` ou `Pendente` como texto acessível.

Com senha nova localmente inválida, o adaptador não é chamado com sucesso e nenhum request HTTP deve ocorrer. Em `422` mapeado para `SenhaAtual`, a senha atual permanece preenchida e a nova é limpa. No sucesso, `reset()` limpa ambas.

## Contagens esperadas

```text
register=0
login=1
categories=3
profile=3
profileUpdate=1
passwordUpdate=2
logout=0
product=0
cartCreate=0
cartAdd=0
cartGet=0
cartUpdate=0
cartDelete=0
orderCreate=0
```

Justificativa:

- `categories=3`: montagem protegida inicial antes do login, remontagem após autenticação e nova carga completa após `page.reload()`. A navegação SPA dados → senha reutiliza o cache.
- `profile=3`: carga inicial autenticada, refetch após PUT aceito e nova carga após reload.
- `profileUpdate=1`: o clique em salvar apenas abre a confirmação; somente o botão do dialog envia.
- `passwordUpdate=2`: tentativa inválida localmente é zero; uma tentativa remota recusada e uma aceita.

## Conclusão

O plano `docs/superpowers/plans/2026-07-16-task-121-account-e2e.md` está coerente com o código no `BASE_COMMIT`. A implementação deve modificar somente:

- `frontend/e2e/support/authApi.ts`;
- criar `frontend/e2e/account.spec.ts`;
- atualizar o link do plano agregado conforme previsto.

Não foi encontrada necessidade de alterar código de produto, fixture, autenticação, store ou componentes da área do cliente.
