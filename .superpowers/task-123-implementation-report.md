# TASK-123 Implementation Report

## Scope and commits

- BASE_COMMIT: `540ada24adfd4a9c434eec94d2b43e0ce0a03672`
- Plan commits already present at implementation start: `ca333a1`, `b02e2d9`
- `0e48f78` — centralized idempotent private-session cleanup
- `ee735e6` — transient expired identity, atomic consumption, scheduled cleanup and synchronous guard coverage
- `e3b2080` — deterministic Playwright journeys and strict sequential login expirations
- `a7be7f1` — made TASK-122 reauthentication boundary explicit by removing both auth storages before its second login

The backlog was not changed by the implementation agent.

## TDD evidence

### Central cleanup

RED:

- `npx vitest run src/features/auth/session/clearPrivateSession.test.ts`
- Failed during import because `clearPrivateSession.ts` did not exist.

GREEN:

- `clearPrivateSession.test.ts`, `privateCache.test.ts`, `customerPrivateSnapshots.test.ts` and `cartSessionStore.test.ts`
- 4 files, 15 tests passed.

The test writes a real local auth session, a stale session-storage copy, cart associations for customers 7 and 8, explicitly private/public queries and mutations, and a registered customer snapshot. Only customer 7 private state is removed.

### Atomic hydration identity

RED:

- `npx vitest run src/features/auth/store/authStore.test.ts`
- The restored expired session was already denied (`session === null`), but `expiredSessionIdentity` was `undefined` instead of `{ clienteId: 20 }`.

GREEN:

- 22 auth-store tests passed.
- The identity is captured in the same state update that nulls the session, consumed once, reset by a new session and excluded by `partialize`.
- Non-persistence is proven after a real `setSession` write by parsing the stored wrapper and checking that it contains only `session` and `persistence`.

### Initializer and synchronous guard

RED:

- `AuthSessionInitializer.test.tsx` failed because the restored identity remained unconsumed and the timed expiration left cart/cache/snapshot state intact.
- `ProtectedRoute.test.tsx` additionally proves the private component is never mounted for an expired session.

GREEN:

- 5 focused auth files, 36 tests passed.
- The initializer consumes the captured identity through `clearPrivateSession`.
- Timed expiration calls `invalidateExpiredSession`; the following effect consumes the identity.
- `ProtectedRoute` remains a synchronous denial and preserves the internal pathname, query and hash.
- The existing `401` provider and auth integration tests passed without semantic changes.
- Review correction RED: sessions introduced through the public `setSession` API with
  an invalid `expiraEm` or an empty token remained active because the scheduler
  compared `NaN <= 0` and otherwise scheduled from the date alone.
- Review correction GREEN: the initializer now reuses
  `isAuthSessionExpired(session)` before scheduling. Both malformed variants are
  invalidated, private state is cleared once, and advancing another minute does not
  repeat snapshot cleanup.

### Playwright

Initial RED:

- Both tests failed because `authApi.setLoginExpirations` did not exist.

Calibration RED:

- The first isolated execution exposed the real request counts.
- The first repeat run exposed a test race: advancing the clock after only observing the heading could cancel an orders request, alternating `ordersList` between 0/1 or 1/2.
- Root cause was the heading mounting before the private query started. The tests now wait for the exact profile/orders request count before advancing the clock.

Regression RED:

- The full Chromium suite showed TASK-122 depended implicitly on a valid local session disappearing before its deliberate second login.
- Its test now removes both auth storages explicitly before that navigation, preserving the intended reauthentication boundary without changing production behavior.

GREEN:

- Isolated expired-session spec: 2/2.
- `--repeat-each=20 --workers=1`: 40/40.
- Full Chromium suite: 9/9.
- Full Chromium suite `--repeat-each=2`: 18/18.

## Exact E2E ledgers

Restored expired session, including the later successful login:

```text
register=0 login=1 categories=2 catalog=0 profile=1
profileUpdate=0 passwordUpdate=0 logout=0 product=0
cartCreate=0 cartAdd=0 cartGet=0 cartUpdate=0 cartDelete=0
orderCreate=0 ordersList=1 orderDetail=0 orderProduct=0 orderCancel=0
```

Two sessions expiring during use:

```text
register=0 login=2 categories=2 catalog=0 profile=2
profileUpdate=0 passwordUpdate=0 logout=0 product=0
cartCreate=0 cartAdd=0 cartGet=0 cartUpdate=0 cartDelete=0
orderCreate=0 ordersList=2 orderDetail=0 orderProduct=0 orderCancel=0
```

Before the first login in the restored-session scenario, the test synchronously
captures the fixture ledger and requires `login=0`, `profile=0`, `cartGet=0`,
`ordersList=0`, `orderDetail=0`, `orderProduct=0` and `orderCancel=0`. After login
it separately observes the transition to `login=1`, `profile=1` and
`ordersList=1`; therefore a private request occurring before authentication fails
at the pre-login boundary instead of being hidden by the final aggregate.

`setLoginExpirations` is mandatory for these journeys: every login consumes exactly one configured ISO, extra logins fail immediately, unconsumed expirations fail teardown, and `reset()` clears the queue. Existing specs retain the 2099 default when no queue is configured.

## Acceptance evidence

- Auth is removed from localStorage and sessionStorage.
- Only the expired customer's cart association is removed and persisted; another customer's cart survives unit coverage.
- Private queries and mutations are removed while explicitly public entries survive.
- Registered customer snapshots are cleared.
- The restored expired identity is transient, atomic, consumable once and never persisted.
- A restored expired session never mounts “Meus pedidos” and makes no private request before authentication.
- A timed expiration removes the protected heading and all private client state.
- Return targets are internal and preserve pathname, query and hash.
- History traversal and reload remain on login and never remount private content.
- Only restored and clock-based expiration use the centralized routine. Logout, `401` and account cancellation remain in their existing flows.

## Gates

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm test`: PASS — 126 files, 839 tests
- `npx playwright test --project=chromium`: PASS — 9/9
- `npx playwright test --project=chromium --repeat-each=2`: PASS — 18/18
- `npm run build`: PASS
- Build warning: main minified chunk is 727.73 kB, an existing out-of-scope chunk-size warning.
- `git diff --check 540ada24adfd4a9c434eec94d2b43e0ce0a03672..HEAD`: PASS
