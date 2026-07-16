# TASK-116 — Relatório de implementação

## Resultado

- Criada a integração real de pedidos com `AppRouter`, providers e MSW.
- Nenhuma mudança de produto foi necessária.
- O detalhe foi observado por prefixo com `getQueriesData`, incluindo a chave
  privada com `sessionScope`.

## Cobertura adicionada

- Lista com CPF confirmado, limites locais do período, página `2`, tamanho
  `20` e autorização da sessão.
- Detalhe com cliente `7`, pedido `900`, autorização e uma única consulta ao
  produto `42`, embora ele apareça em dois itens.
- Cancelamento recusado com PATCH estrito `{ "status": "Cancelado" }`,
  anúncio acessível, status `Criado` preservado e refetch confirmado.
- Cancelamento bem-sucedido com detalhe reconciliado para `Cancelado`,
  invalidação das listas do cliente `7` e preservação das listas do cliente
  `8`.

## Ajustes literais ao plano

- Adicionado handler vazio para `/api/v1/categoria`, consumido pelo
  `StoreLayout` real.
- Configurado `VITE_API_BASE_URL` no teste, seguindo as integrações existentes.
- O matcher da lista foi restringido ao heading `Pedido 900` para evitar a
  ambiguidade com o link `Ver pedido 900`.

## Verificação

- `npm --prefix frontend test -- src/features/orders`: 18 arquivos e 111
  testes PASS.
- `npm --prefix frontend test -- src/App.test.tsx
  src/app/router/AppRouter.lazy.test.tsx`: 2 arquivos e 18 testes PASS.
- `npm --prefix frontend run typecheck`: PASS.
- `npm --prefix frontend run lint`: PASS.
- `git diff --check 26bb032`: PASS.

## Commit de implementação

- `361d5e9` — `test(TASK-116): Integrar pedidos com MSW`
