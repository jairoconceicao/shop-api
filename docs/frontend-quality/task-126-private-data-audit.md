# TASK-126 — Auditoria de dados privados

Base: `05c79cd039c918ce70b831ad17e0d9e0025bae4f`.

## Persistência permitida

| Chave | Storage | Payload |
|---|---|---|
| `shop-api:auth` | exatamente um entre `sessionStorage` e `localStorage` | sessão contratada (`token`, `tipo`, `expiraEm`, `usuarioId`, `clienteId`, `email`) e modalidade |
| `shop-api:cart-session` | `localStorage` | somente `cartIdsByCustomer` |

`tipo` permanece porque integra `AuthSession` e o payload versionado. Sua
remoção exigiria uma migração contratual independente.

CPF, endereço, perfil, itens, pedidos, respostas HTTP e caches do React Query
não são persistidos. Logout, `401` e cancelamento usam a fronteira idempotente
`clearPrivateSession`, removendo somente o cliente capturado e preservando
queries, mutations, snapshots e carrinhos públicos ou de outros clientes.

Respostas tardias de criação de carrinho só persistem quando `clienteId` e
`token` ainda coincidem com a identidade que iniciou a operação. Logout tardio
também não limpa uma sessão sucessora.

## Reprodução

```powershell
npm run audit:private-data
npm run typecheck
npm run lint
npm test
npm run build
```

O auditor percorre código de produção em `src`, inventaria configurações
`persist`, adapters `StateStorage` e sinks de Web Storage, restringe as chaves à
allowlist acima, proíbe `console.*` e mensagens literais sensíveis. O modo
`--self-test` prova que terceira chave, chave dinâmica, novo `persist.name` e
mensagem sensível são rejeitados.
