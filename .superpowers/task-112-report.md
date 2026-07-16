# TASK-112 Implementation Report

## Context

- Worktree: `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
- Requested base: `aeed2dbdb886332215a9750b56319cab862808b1`
- Exploration: `.superpowers/task-112-exploration.md`
- Backlog remained `READY`; this worker did not mark TASK-112 as `DONE`.

## TDD evidence

1. Registration `201` and `409` initially exposed a plan-listing omission: the
   integration test had to stub `VITE_API_BASE_URL`, as the existing auth
   integration does. Both scenarios then passed against the real router,
   providers, API client, and MSW.
2. Registration `422` failed for the expected product reason:
   `Unable to find an element with the text: Falha futura.` CPF and CEP were
   already mapped, but an unknown remote property was discarded.
3. The literal mapper patch split remote details into known field errors and
   unknown summary messages. The same focused `422` test then passed.
4. Profile GET/PUT revealed two test-listing details: `StoreLayout` also loads
   categories, requiring an explicit MSW handler under strict unhandled-request
   mode; the existing profile form sends the displayed CEP mask. After aligning
   the test with those existing contracts, the deferred PUT and `409`/`422`
   scenarios passed without further product changes.

## Covered behavior

- POST `/api/v1/cliente`: normalized body, no authorization, `201` navigation.
- Registration `409`: CPF message and preserved form values, without success.
- Registration `422`: CPF/CEP field mapping plus unknown detail in the summary.
- GET `/api/v1/cliente/7`: authenticated profile hydration.
- PUT `/api/v1/cliente/7`: CPF confirmation, complete request ledger, old cache
  while pending, and new cache only after response and refetch.
- Profile `409` and `422`: confirmed cache preserved and success suppressed.
- Global MSW setup remains `server.listen({ onUnhandledRequest: 'error' })`.

## Verification

```text
npm test -- src/features/customer/customer.integration.test.tsx \
  src/features/customer/pages/RegistrationPage.test.tsx \
  src/features/customer/pages/CustomerDataPage.test.tsx \
  src/features/customer/services/registrationService.test.ts \
  src/features/customer/services/customerProfileService.test.ts \
  src/features/customer/queries/useCustomerProfileQuery.test.tsx \
  src/features/customer/mutations/useUpdateCustomerProfileMutation.test.tsx
Result: 7 files PASS, 50 tests PASS, exit 0

npm run typecheck
Result: exit 0

npm run lint
Result: exit 0
```

## Commits

- `b12c096` — `test(TASK-112): Integrar cadastro e perfil com MSW`
- Product/report commit: recorded after this report is staged.
