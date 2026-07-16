# TASK-114 — relatório de implementação

## Base e escopo

- `BASE_COMMIT`: `c034c13a244cefe8f16d1ea216eafdb8621fc230`
- Integração real:
  `frontend/src/features/cart/cart.integration.test.tsx`
- Nenhuma mudança de produto.
- Nenhum mock de service, query, `apiClient`, store ou componente.
- MSW global mantido com `onUnhandledRequest: 'error'`.

## Execução

1. O primeiro RED revelou a ausência de `VITE_API_BASE_URL` no listing do
   plano. O harness foi alinhado às integrações existentes com
   `vi.stubEnv`.
2. O RED final do cenário DELETE revelou ambiguidade entre o link do
   header e o link do rodapé. A asserção foi limitada semanticamente à
   navegação `Ações da loja`.
3. Todos os demais comportamentos ficaram verdes sem mudança de produto.

## Comportamentos provados

- A criação envia body vazio antes de adicionar o primeiro item.
- O item é adicionado uma vez com payload estrito e o vínculo local é
  armazenado.
- Um vínculo existente produz um único GET e nenhum POST de criação.
- PATCH atualiza input, subtotal, total e badge com dados confirmados.
- DELETE só ocorre após confirmação, não envia body e converge para
  carrinho e badge vazios.
- Falhas de PATCH e DELETE restauram somente o item 701 e preservam a
  alteração concorrente do item 702.
- Um GET `404` remove apenas o vínculo e o cache do cliente 7, preservando
  cliente 8.
- Toda montagem de `AppRouter` declara o handler de categorias.

## Gates

```text
npm --prefix frontend test -- src/features/cart/cart.integration.test.tsx
```

Resultado: 1 arquivo e 6 testes aprovados, exit code 0.

```text
npm --prefix frontend test -- src/features/cart --run
```

Resultado: 20 arquivos e 139 testes aprovados, exit code 0.

```text
npm --prefix frontend test -- \
  src/App.test.tsx \
  src/app/layouts/Header.test.tsx \
  src/app/layouts/layouts.test.tsx \
  src/features/cart/hooks/useConfirmedCartCount.test.tsx \
  src/features/checkout/mutations/useCreateOrderMutation.test.tsx
```

Resultado: 5 arquivos e 46 testes consumidores aprovados, exit code 0.

```text
npm --prefix frontend run typecheck
npm --prefix frontend run lint
git diff --check
```

Resultado: todos com exit code 0 e sem output de erro.

## Commits

- `a86a77f` — `test(TASK-114): Integrar ciclo do carrinho com MSW`

O backlog não foi alterado nem marcado como `DONE`; a revisão ainda é
responsabilidade do agente orquestrador.
