# TASK-048 Catalog Query Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide a tested TanStack Query integration for the paginated public catalog using `page`, `size`, and `searchword`.

**Architecture:** A focused service owns HTTP query-string construction and transport adaptation. A focused query module owns parameterized cache keys and connects TanStack Query cancellation to the service.

**Tech Stack:** React 19, TypeScript, TanStack Query 5, Vitest, Testing Library, Zod adapters, existing `apiClient`.

## Global Constraints

- Implement only TASK-048.
- Always send `page` and `size`; send `searchword` only when supplied.
- Do not implement URL state, category product queries, UI, or later backlog tasks.
- Do not create a git commit.

---

### Task 1: Catalog HTTP service

**Files:**
- Create: `frontend/src/features/catalog/services/catalogService.test.ts`
- Create: `frontend/src/features/catalog/services/catalogService.ts`

**Interfaces:**
- Consumes: `apiClient.request`, `adaptCatalogResponse`, `mapContractError`.
- Produces: `CatalogQueryParams` and `fetchCatalog(params, signal, client): Promise<CatalogPage>`.

- [ ] **Step 1: Write failing service tests**

Cover an adapted response requested through `/api/v1/produto?page=2&size=20&searchword=teclado+mec%C3%A2nico`, omission of an absent `searchword`, invalid-body mapping to `kind: 'contract'`, and preservation of an existing `AppError`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/features/catalog/services/catalogService.test.ts`

Expected: FAIL because `catalogService` does not exist.

- [ ] **Step 3: Implement the minimal service**

Define:

```ts
export type CatalogQueryParams = {
  page: number
  size: number
  searchword?: string
}

export async function fetchCatalog(
  params: CatalogQueryParams,
  signal: AbortSignal,
  client: CatalogApiClient = apiClient,
): Promise<CatalogPage>
```

Build parameters with `URLSearchParams`, request the endpoint with `{ signal }`, adapt successful data, and map only adapter failures.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/features/catalog/services/catalogService.test.ts`

Expected: PASS.

### Task 2: Parameterized catalog query

**Files:**
- Create: `frontend/src/features/catalog/queries/useCatalogQuery.test.tsx`
- Create: `frontend/src/features/catalog/queries/useCatalogQuery.ts`

**Interfaces:**
- Consumes: `CatalogQueryParams`, `fetchCatalog`.
- Produces: `catalogQueryKeys`, `catalogQueryOptions(params)`, and `useCatalogQuery(params)`.

- [ ] **Step 1: Write failing query tests**

Verify the cache key is `['catalog', 'products', params]`, two consumers with equal values share one request, changed parameters issue a separate request, and the hook passes parameters plus an `AbortSignal` to the service.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/features/catalog/queries/useCatalogQuery.test.tsx`

Expected: FAIL because `useCatalogQuery` does not exist.

- [ ] **Step 3: Implement the minimal query module**

Define a key factory with an immutable parameter snapshot, create options through `queryOptions`, forward `{ signal }` to `fetchCatalog`, and expose the `useQuery` hook.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/features/catalog/queries/useCatalogQuery.test.tsx`

Expected: PASS.

### Task 3: Backlog and verification

**Files:**
- Modify: `docs/frontend-tasks-v2.md`

**Interfaces:**
- Produces: TASK-048 marked `[x]` after behavior is verified.

- [ ] **Step 1: Run all catalog tests**

Run: `npm test -- src/features/catalog`

Expected: PASS.

- [ ] **Step 2: Run frontend quality gates**

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` from `frontend`.

Expected: all exit with code 0.

- [ ] **Step 3: Mark TASK-048 complete**

Change only `[ ] TASK-048` to `[x] TASK-048` in `docs/frontend-tasks-v2.md`.

- [ ] **Step 4: Inspect final diff**

Run `git diff --check` and `git status --short`. Confirm no TASK-049+ implementation and no commit.
