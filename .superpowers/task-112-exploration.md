# TASK-112 Exploration Report

## Context

- Worktree: `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
- BASE/HEAD verificado: `06b8ce52adcc5cf916295bebb5ff335aac689556`
- Backlog: TASK-112 está `READY`; dependências declaradas estão `DONE` no lote anterior.
- Plano analisado: `docs/superpowers/plans/2026-07-16-task-112-customer-msw.md`.
- Nenhum arquivo de produto ou backlog foi alterado nesta exploração.

## Baseline focada

Comando:

```text
npm --prefix frontend test -- src/features/customer/pages/RegistrationPage.test.tsx src/features/customer/pages/CustomerDataPage.test.tsx src/features/customer/services/registrationService.test.ts src/features/customer/services/customerProfileService.test.ts src/features/customer/queries/useCustomerProfileQuery.test.tsx src/features/customer/mutations/useUpdateCustomerProfileMutation.test.tsx
```

Resultado: `6` arquivos PASS, `44` testes PASS, exit code `0`.

## Confirmações por cenário

### Cadastro `201`

- `registrationService` envia `POST /api/v1/cliente` sem token; portanto o ledger deve registrar `authorization: null`.
- `createCustomerRequestSchema` normaliza com `trim()` nome, e-mail e campos textuais do endereço; CPF e CEP são normalizados pela página; UF é convertida para maiúsculas; celular é separado em DDD/número. O body esperado no plano é compatível.
- A resposta `{ status: true, data: { clienteId: 7 } }` é aceita pelo adapter, e a página navega para `/entrar` com `registrationSucceeded: true`; `LoginPage` já apresenta `Cadastro concluído`.

### Cadastro `409` por CPF duplicado

- `apiClient` preserva `error.message` e `error.details` no `AppError` para `409`.
- O mapper atual da página reconhece `Cpf`, associa a mensagem ao campo e o `FormErrorSummary` também recebe o erro de formulário. Os valores não são resetados e não há navegação/sucesso no catch.
- O cenário do plano é compatível com o comportamento atual.

### Cadastro `422` com CPF, CEP e detalhe desconhecido

- `Cpf` e `Endereco.Cep` são reconhecidos pelo mapper atual porque ele usa o último segmento da propriedade.
- **RED esperado confirmado por inspeção:** `CampoNovo` é descartado por `getRemoteFieldErrors`; como existem erros conhecidos, o fallback com `registrationMutation.error.message` também não é incluído. Assim `Falha futura.` não aparece no resumo.
- O patch literal proposto (`getRemoteErrors` com `fields` e `summary`) corrige exatamente essa perda sem ampliar o escopo.

### Perfil GET/PUT, confirmação e cache

- A rota protegida `/minha-conta/dados` usa a sessão `clienteId: 7`, faz `GET /api/v1/cliente/7` com `Authorization: Bearer token-7` e preenche o formulário pelo adapter real.
- Alterar o CPF abre `CpfChangeDialog`; o PUT só ocorre após `Confirmar alteração` e inclui o request completo e normalizado.
- `useUpdateCustomerProfileMutation` não altera o cache antes de `updateCustomerProfile` resolver. Após resposta válida, grava o perfil enviado e invalida/refaz o GET; portanto o gate deferred do plano prova cache antigo antes e cache confirmado/refetched depois.
- Em erro `409`/`422`, a mutation não executa `setQueryData` nem invalidation; o cache confirmado permanece e `CustomerDataForm` limpa qualquer sucesso antes da tentativa.

## Divergências do plano

1. **O teste parametrizado de falha de perfil, como listado, não passa para `409`.** `mapCustomerProfileError` deliberadamente converte qualquer `409` em `Já existe outro cliente com estes dados.` e não expõe `Perfil recusado`/`CPF recusado.`. Logo `findByText(/recusad/i)` falha no caso `409`. Isto é uma divergência do teste, não um RED de produto. Ajustar a asserção por status ou verificar a mensagem pública mapeada.
2. **No caso `422`, `findByText(/recusad/i)` é ambíguo.** `CPF recusado.` aparece no campo e no resumo, como já comprovado pelo teste unitário que espera duas ocorrências. Usar `findAllByText`, `within(summary)`, ou `toHaveAccessibleDescription`.
3. O tipo de cache usado no listing (`{ cpf; nome }`) é apenas parcial e funciona em runtime, mas o valor real é `CustomerProfile` com `customerId`; preferir tipar como `CustomerProfile` para o teste documentar o contrato real.

## REDs e decisão recomendada

- RED de produto previsto: somente preservação do detalhe desconhecido `CampoNovo` no resumo do cadastro `422`.
- REDs não previstos: as duas asserções `/recusad/i` do teste parametrizado são defeitos do listing e devem ser corrigidas antes de aplicar a regra do plano que bloquearia a task por “RED inesperado”.
- Nenhuma evidência de incompatibilidade em `201`, duplicidade `409`, GET/PUT deferred, confirmação de CPF, reconciliação de cache ou supressão de sucesso.
