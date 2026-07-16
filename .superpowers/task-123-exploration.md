# TASK-123 — Relatório de exploração

## Base e elegibilidade

- `BASE_COMMIT`: `540ada24adfd4a9c434eec94d2b43e0ce0a03672`.
- A task está `READY`; suas dependências estão concluídas no backlog.
- O escopo é exclusivamente frontend e pede dois caminhos: sessão restaurada já expirada e sessão que expira durante o uso.

## Fatos observados

- `frontend/playwright.config.ts` já fixa `timezoneId: 'America/Sao_Paulo'`, inicia o Vite em modo de produção e começa cada contexto sem estado persistido.
- `frontend/e2e/fixtures.ts` limpa cookies e ambos os storages entre testes e exige a contagem exata de todas as rotas conhecidas ao final.
- `frontend/src/features/auth/store/authStore.ts` restaura auth de `localStorage` ou `sessionStorage`, invalida uma sessão expirada dentro de `onRehydrateStorage` e remove `shop-api:auth` dos dois storages. Nesse ponto a sessão vira `null` antes de `AuthSessionInitializer` executar; portanto, sem uma identidade transitória no store, o cliente expirado é perdido e carrinho/snapshots não podem ser limpos.
- `frontend/src/features/auth/store/AuthSessionInitializer.tsx` agenda a expiração pelo relógio, mas chama somente `clearSession()`.
- `frontend/src/features/auth/routing/ProtectedRoute.tsx` nega renderização sincronamente quando não há sessão ou quando `expiraEm <= Date.now()`, preservando pathname, search e hash como `returnTo`.
- `frontend/src/features/auth/context/UnauthorizedHandlerProvider.tsx` limpa auth e caches privados em `401`, mas não é o caminho usado pela expiração local.
- `frontend/src/shared/query/privateCache.ts` remove queries e mutations marcadas com `meta.private === true`.
- `frontend/src/features/cart/store/cartSessionStore.ts` persiste somente o mapa cliente → carrinho em `shop-api:cart-session`; a API atual remove uma associação por cliente.
- `frontend/src/features/customer/cache/customerPrivateSnapshots.ts` mantém snapshots privados de perfil fora do TanStack Query e expõe limpeza por cliente.
- A limpeza completa existente em cancelamento de conta combina quatro ações separadas: remover carrinho do cliente, limpar auth, limpar Query/Mutation caches privados e limpar snapshots do cliente.
- Não existe hoje uma abstração compartilhada que execute as quatro ações nos dois caminhos de expiração.
- Os E2E existentes usam a API determinística de `frontend/e2e/support/authApi.ts`; qualquer nova rota/contagem precisa continuar estrita. A contagem final dos novos cenários deve ser medida no RED, não presumida.
- O retorno externo já é normalizado no consumo por `getInternalReturnTo`; para esta task, a origem do retorno será uma rota interna protegida com query e hash.

## Decisões de escopo para o plano

- Adicionar ao auth store uma identidade transitória, não persistida, da sessão expirada. `invalidateExpiredSession()` deve capturá-la atomicamente antes de tornar `session` nula; o inicializador consome essa identidade somente depois da limpeza completa.
- Criar uma única rotina de limpeza privada com identidade capturada do cliente, usada apenas pela expiração restaurada e pela expiração em tempo de uso.
- A rotina deve remover auth dos dois storages, associação do carrinho e seu storage persistido, queries/mutations privadas e snapshots privados.
- `ProtectedRoute` continua sendo o bloqueio síncrono; efeitos de limpeza não devem ocorrer durante render.
- Os dois E2E verificarão login/returnTo interno, storages, ausência de conteúdo privado após voltar/recarregar e ledgers calibrados a partir do RED.
- Logout, `401` e cancelamento de conta continuam em seus caminhos próprios; não serão migrados para a rotina nova nesta task.
