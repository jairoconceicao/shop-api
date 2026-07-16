# TASK-113 — relatório de exploração

## Contexto

- Worktree: `E:/CodeRepo/shop-api/.worktrees/phase-8-hardening`
- `BASE_COMMIT`: `2373274e87260e2686a33c62cd552c8e480871df`
- `HEAD` durante a exploração: `2373274e87260e2686a33c62cd552c8e480871df`
- Checkout limpo no início da exploração.
- Escopo lido: backlog, design da Fase 8, plano específico da TASK-113, `HomePage`, `ProductDetailPage`, layout/header, routing, queries, services, contratos, infraestrutura MSW e testes atuais.

## Baseline reproduzível

Comando:

```powershell
npm --prefix frontend test -- src/features/catalog/pages/HomePage.test.tsx src/features/catalog/pages/ProductDetailPage.test.tsx src/features/catalog/routing/catalogUrl.test.ts src/features/catalog/queries/useCatalogQuery.test.tsx src/features/catalog/queries/useProductsByCategoryQuery.test.ts src/features/catalog/queries/useProductDetailQuery.test.ts --reporter=verbose
```

Resultado:

- exit code `0`
- 6 arquivos aprovados
- 70 testes aprovados
- duração Vitest: 3,89 s

Esse baseline não satisfaz sozinho a TASK-113: `HomePage.test.tsx`, `ProductDetailPage.test.tsx` e `StoreLayout.search.test.tsx` substituem services com `vi.mock`, enquanto a task exige providers, queries, services, `apiClient` e MSW reais.

## Estado por critério

| Critério | Evidência atual | Resultado esperado do teste MSW |
| --- | --- | --- |
| Categorias e catálogo iniciam em paralelo | `StoreLayout` chama `useCategoriesQuery`; `HomePage` também chama a mesma query, deduplicada pela chave; `GeneralCatalog` chama `useCatalogQuery` no mesmo render. O teste unitário já observa ambas as promises antes de resolvê-las. | GREEN |
| Busca e página na URL e request | `CatalogHeader` usa `serializeCatalogUrl`, resetando página para 1; `GeneralCatalog.handlePageChange` preserva busca; `fetchCatalog` produz `?page=N&size=20&searchword=...`. | GREEN |
| Endpoint dedicado de categoria | Categoria válida seleciona `CategoryCatalog`/`useProductsByCategoryQuery`; service chama `/api/v1/produto/categoria/{id}` e o catálogo geral não é montado. | GREEN |
| Metadata de paginação | `CatalogContent` usa `pages`, `size` e `totalItems` adaptados da resposta e não deriva páginas pelo tamanho do array. | GREEN |
| Histórico restaura consulta, UI e cache | URL é a fonte do estado; `CatalogHeader` é recriado por `key={searchParams.toString()}`; query key contém `{ page, size, searchword }`; teste atual cobre back/forward e request restaurado. | GREEN |
| Filtros inválidos são canonicalizados com replace | `parseCatalogUrl` normaliza o estado usado no request, mas `HomePage` nunca substitui a URL original. Ex.: `/?page=abc&categoriaId=-2&searchword=%20%20` consulta corretamente `?page=1&size=20`, porém a barra de endereço continua inválida. | RED esperado |
| Produto 404: estado específico, uma chamada, sem stale | `apiClient` converte 404 em `AppError`; `shouldRetryQuery` não repete 4xx; `ProductDetailPage` renderiza `ProductNotFound`; a chave inclui o id e a falha não grava `data`. | GREEN |

## Divergência funcional confirmada

### URL inválida não é substituída pela forma canônica

Fluxo atual:

1. `useSearchParams` entrega os parâmetros brutos.
2. `parseCatalogUrl` retorna `{ page: 1 }` para os filtros inválidos.
3. `useCatalogQuery` envia somente `page=1&size=20`.
4. Nenhum componente navega para a representação serializada; a URL inválida permanece no histórico.

Portanto, o RED previsto no plano é coerente:

```text
expected '?page=abc&categoriaId=-2&searchword=%20%20' to be ''
```

## Patch canônico autorizado pelo plano

O patch literal proposto é compatível com as interfaces existentes:

- importar `useEffect`;
- obter `navigate` em `HomePage`;
- formar `canonicalSearch` com `serializeCatalogUrl`, usando o `categoryId` já validado;
- comparar com `searchParams.toString()`;
- navegar para `location.pathname` com `{ replace: true }`.

Isso remove parâmetros desconhecidos, página inválida/default, busca vazia e categoria inválida sem criar uma entrada extra no histórico. O request inicial já usa o estado normalizado, então a correção não deve gerar request inválido nem uma segunda query com chave diferente.

## Observações para o implementador

- Criar apenas `frontend/src/features/catalog/catalog.integration.test.tsx` e aplicar o patch literal em `HomePage.tsx`.
- Manter `server.listen({ onUnhandledRequest: 'error' })` e não introduzir `vi.mock`.
- O endpoint geral deve continuar usando `size=20`.
- No teste de paralelismo, afirmar que ambos os handlers começaram antes de liberar qualquer gate.
- No teste de histórico, afirmar URL, valor do searchbox, último request e `catalogQueryKeys.list({ page: 1, size: 20, searchword: 'teclado' })`.
- No teste de categoria, exigir `dedicated === 1` e `general === 0`.
- No 404, a política global já garante zero retry para 404; afirmar uma chamada, query em `error` e `data === undefined`.
- Não alterar retry ou stale time de `useProductDetailQuery`: o comportamento requerido já decorre da política global e da chave por produto.

## Conclusão

A TASK-113 pode seguir para implementação conforme o plano. Há um único RED de produto previsto e autorizado: canonicalização da URL por `replace`. Qualquer RED nos demais cinco comportamentos é divergência inesperada e deve bloquear a task para nova exploração.
