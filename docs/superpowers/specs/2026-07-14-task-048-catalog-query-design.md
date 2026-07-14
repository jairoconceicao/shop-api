# TASK-048 Catalog Query Design

## Scope

Implement only the public paginated catalog query for `GET /api/v1/produto`, using the request parameters `page`, `size`, and `searchword`. URL state, category filtering, catalog UI, and pagination controls remain outside this task.

## Architecture

Add a catalog service beside the existing category service. It will build the endpoint query string, forward the request cancellation signal, adapt the unknown transport response through `adaptCatalogResponse`, and normalize contract failures through the existing application error mapping.

Add a TanStack Query hook beside `useCategoriesQuery`. Its cache key will include `page`, `size`, and `searchword`, so identical requests share cache while any parameter change identifies a distinct catalog result. The query function will forward TanStack Query's `AbortSignal` to the service.

## Request Rules

- Always send `page` and `size` to `GET /api/v1/produto`.
- Send `searchword` when the caller supplies it.
- Encode query values with `URLSearchParams`.
- Preserve the caller's search term; URL parsing and normalization belong to TASK-050.

## Error Handling

HTTP and network errors normalized by `apiClient` pass through unchanged. Invalid successful response bodies are converted to the existing `contract` application error by the service.

## Testing

Use test-driven development:

1. Service tests verify the exact endpoint, encoded parameters, cancellation signal, adapted catalog page, contract-error mapping, and preservation of normalized request errors.
2. Query tests verify the parameterized key, request sharing for identical parameters, distinct requests when parameters differ, and service invocation through the hook.
3. Run focused tests first, then the full frontend test, typecheck, lint, and build validations.

## Files

- Create `frontend/src/features/catalog/services/catalogService.ts`.
- Create `frontend/src/features/catalog/services/catalogService.test.ts`.
- Create `frontend/src/features/catalog/queries/useCatalogQuery.ts`.
- Create `frontend/src/features/catalog/queries/useCatalogQuery.test.tsx`.
- Update `docs/frontend-tasks-v2.md` only after implementation and validation succeed.

## Constraints

- Do not implement TASK-049 or later catalog tasks.
- Do not change visual components or URL routing.
- Do not create a git commit.
