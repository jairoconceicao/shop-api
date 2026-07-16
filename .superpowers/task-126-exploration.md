# TASK-126 — Exploração: persistência e dados privados

## Base e escopo

- `BASE_COMMIT`: `05c79cd039c918ce70b831ad17e0d9e0025bae4f`
- Escopo autorizado: frontend, testes, relatório de auditoria e documentação da TASK-126.
- Esta exploração não altera código de produção.
- Dependências da task estão `DONE`; a TASK-126 está `READY`.

## Inventário exato de persistência

A busca estática por `persist(`, `createJSONStorage`, `localStorage` e
`sessionStorage` encontrou somente duas chaves de produto:

| Chave | Storage | Envelope persistido | Dados permitidos |
|---|---|---|---|
| `shop-api:auth` | exatamente um entre `sessionStorage` e `localStorage`; a cópia no storage oposto é removida | `{"state":{"session":...,"persistence":"session"|"local"},"version":1}` | `session.token`, `session.tipo`, `session.expiraEm`, `session.usuarioId`, `session.clienteId`, `session.email` e a escolha `persistence` |
| `shop-api:cart-session` | `localStorage` | `{"state":{"cartIdsByCustomer":{"<clienteId>":<carrinhoId>}},"version":1}` | somente o mapa cliente → ID do carrinho |

Não existe persistência de CPF, endereço, perfil, itens do carrinho, pedidos,
respostas HTTP, query cache ou mutation cache. Esses dados vivem somente em
memória no React Query ou em snapshots privados registrados por cliente.

Os storages usados pelos testes E2E também contêm apenas essas mesmas chaves;
cookies e dados do backend simulado não são persistência da aplicação.

## Decisão sobre `tipo`

`tipo` não possui leitura direta depois da adaptação do login, mas faz parte do
contrato público `AuthSession`, do schema estrito da resposta e do schema
persistido versionado. Removê-lo do tipo/runtime apenas por ausência de leitura
seria uma mudança de contrato sem relação com a auditoria.

A alternativa de omiti-lo somente no `partialize` exigiria um schema persistido
distinto e uma regra explícita para reconstruí-lo na reidratação. Usar
`"Bearer"` como default seria inventar uma garantia que o contrato atual não
declara; deixar o campo ausente quebraria `AuthSession`. Portanto o plano
documenta `tipo` como metadado necessário para restaurar fielmente a sessão
contratada e não o remove. Uma redução futura depende de decisão de contrato e
migração versionada próprias.

## Limpeza existente e lacunas

`clearPrivateSession(queryClient, customerId)` já:

1. remove a associação do carrinho daquele cliente;
2. limpa auth nos dois storages por meio de `clearSession`;
3. remove queries e mutations marcadas com `meta.private`;
4. limpa snapshots privados daquele cliente.

O fluxo de expiração da TASK-123 já usa essa função. As demais fronteiras ainda
duplicam ou fragmentam a limpeza:

- logout limpa auth e cache, mas não captura `clienteId` antes da limpeza, não
  remove o mapa do carrinho e não limpa snapshots;
- `401` limpa auth e cache, mas não captura a identidade antes de invalidá-la,
  não remove o carrinho e não limpa snapshots;
- cancelamento captura e valida `clienteId + token`, porém repete manualmente a
  rotina; deve reutilizar `clearPrivateSession`;
- `useCreateCartMutation.onSuccess` grava o ID recebido sem verificar se a
  identidade completa que iniciou a request continua ativa. Uma resposta tardia
  pode recriar `shop-api:cart-session` após logout, `401` ou exclusão.

O cancelamento de queries/mutations privadas feito pelo React Query reduz
trabalho tardio, mas não é uma barreira de autorização: promises podem resolver
e callbacks podem executar. A correção obrigatória é um guard de identidade
completa (`clienteId` e `token`) no `onSuccess` de criação do carrinho. Abort é
opcional e não substitui o guard.

## Concorrência a cobrir

- A request de criação começa com cliente A e resolve depois de logout: não
  grava ID, não reconcilia query e não recria storage.
- A request começa com cliente A e resolve depois de um `401`: mesmo resultado.
- A request começa com cliente A e resolve depois da exclusão da conta: mesmo
  resultado.
- A request começa com cliente A e, antes de resolver, existe sessão do mesmo
  `clienteId` com outro token: deve ser rejeitada.
- Uma sessão de cliente B também não autoriza o resultado iniciado por A.
- Resolução normal com o mesmo `clienteId + token` preserva o comportamento.
- Limpeza remove apenas dados privados; queries e mutations públicas continuam
  presentes.

## Logs e bootstrap

O único `console.*` em código de produção está no fallback de
`frontend/src/bootstrap.tsx`. Ele envia o objeto `cause` bruto a
`console.error`; uma falha de MSW pode carregar URL, headers ou texto sensível.
O plano remove esse fallback. A causa continua disponível apenas para um
reporter explicitamente injetado em testes/host; sem reporter, o bootstrap segue
para o render sem emitir a causa ou qualquer mensagem no console.

A busca estática final deve excluir testes, artefatos gerados e dependências e
falhar se código de produção contiver:

- `console.log`, `console.info`, `console.warn`, `console.error` ou `console.debug`;
- mensagens literais ou templates que incluam `token`, `cpf` ou
  `documentoFiscal` (case-insensitive).

Nomes de campos e variáveis necessários ao contrato não são mensagens. A
verificação deve analisar chamadas de erro/log ou usar padrões restritos, para
não confundir `token` no código de autenticação com vazamento textual.

## Arquivos prováveis

- `frontend/src/features/auth/mutations/useLogoutMutation.ts`
- `frontend/src/features/auth/mutations/useLogoutMutation.test.tsx`
- `frontend/src/features/auth/context/UnauthorizedHandlerProvider.tsx`
- `frontend/src/features/auth/context/UnauthorizedHandlerProvider.test.tsx`
- `frontend/src/features/customer/mutations/useDeleteCustomerMutation.ts`
- `frontend/src/features/customer/mutations/useDeleteCustomerMutation.test.tsx`
- `frontend/src/features/cart/mutations/useCreateCartMutation.ts`
- `frontend/src/features/cart/mutations/useCreateCartMutation.test.tsx`
- `frontend/src/features/auth/session/clearPrivateSession.test.ts`
- `frontend/src/features/auth/store/authStore.test.ts`
- `frontend/src/features/cart/store/cartSessionStore.test.ts`
- `frontend/src/bootstrap.tsx`
- `frontend/src/bootstrap.test.tsx`
- `frontend/scripts/audit-private-data.mjs`
- `frontend/package.json`
- `docs/frontend-quality/task-126-private-data-audit.md`

## Fora de escopo

- alterar o contrato de login ou remover `tipo` de `AuthSession`;
- criptografar Web Storage (não protegeria contra código executado na origem);
- persistir React Query;
- trocar Zustand ou React Query;
- adicionar telemetria;
- alterar APIs backend;
- limpar queries/mutations públicas;
- refatorar todas as mutations, além da resposta tardia concretamente vulnerável.
