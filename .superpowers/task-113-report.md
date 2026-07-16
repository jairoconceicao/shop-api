# TASK-113 — relatório de implementação

## Base e escopo

- `BASE_COMMIT`: `2373274e87260e2686a33c62cd552c8e480871df`
- Integração real: `frontend/src/features/catalog/catalog.integration.test.tsx`
- Patch de produto: canonicalização por `replace` em `HomePage.tsx`
- Nenhum mock de service, query, `apiClient` ou componente de catálogo.
- MSW global mantido com `onUnhandledRequest: 'error'`.

## TDD

1. O primeiro RED revelou a ausência de `VITE_API_BASE_URL` no listing do
   plano. O teste foi alinhado ao padrão das integrações existentes com
   `vi.stubEnv`.
2. Busca, histórico, endpoint dedicado e produto `404` ficaram verdes sem
   mudança de produto.
3. A canonicalização falhou pelo motivo esperado:
   a URL permaneceu como
   `?page=abc&categoriaId=-2&searchword=%20%20`.
4. Foi aplicado somente o patch literal autorizado para navegar com
   `{ replace: true }`.
5. O teste canônico passou com URL vazia e um único request
   `?page=1&size=20`.

## Comportamentos provados

- Categorias e catálogo iniciam antes da liberação de qualquer response.
- O catálogo geral usa `size=20`.
- Busca e página são serializadas na URL e no request.
- Back restaura URL, searchbox e cache pela query key completa.
- A metadata remota limita a paginação a duas páginas.
- Categoria válida usa uma vez o endpoint dedicado e não chama o geral.
- Filtros inválidos são substituídos pela forma canônica.
- Produto `404` realiza uma chamada, não tenta novamente e deixa a query
  em `error`, sem `data` stale.

## Gates

```text
npm --prefix frontend test -- \
  src/features/catalog/catalog.integration.test.tsx \
  src/features/catalog/pages/HomePage.test.tsx \
  src/features/catalog/pages/ProductDetailPage.test.tsx \
  src/features/catalog/routing/catalogUrl.test.ts \
  src/features/catalog/queries/useCatalogQuery.test.tsx \
  src/features/catalog/queries/useProductsByCategoryQuery.test.ts \
  src/features/catalog/queries/useProductDetailQuery.test.ts \
  --reporter=verbose
```

Resultado: 7 arquivos e 75 testes aprovados, exit code 0.

```text
npm --prefix frontend run typecheck
npm --prefix frontend run lint
git diff --check 2373274..HEAD
```

Resultado: todos com exit code 0 e sem output de erro.

## Commits

- `929444e` — `test(TASK-113): Integrar catálogo com MSW`
- `a06a1b1` — `fix(TASK-113): Canonicalizar filtros inválidos`

O backlog não foi alterado nem marcado como `DONE`; a revisão ainda é
responsabilidade do agente orquestrador.
