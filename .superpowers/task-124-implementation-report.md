# TASK-124 Implementation Report

## Scope

- BASE_COMMIT: `6fbac40f1aac9ee806bec103e4cf7110366be237`
- Plan commit present at start: `0320b1e64a00bf71d5a2a1d92853dd754face93b`
- Functional commit: `97b0b15 feat(TASK-124): Estabilizar fallbacks de rotas lazy`
- Changed production behavior only in `frontend/src/app/router/AppRouter.tsx`.
- Changed focused contract only in `frontend/src/app/router/AppRouter.lazy.test.tsx`.
- No `manualChunks`, `chunkSizeWarningLimit`, page, layout, guard, contract, or navigation change.
- Backlog was not changed.

## TDD evidence

Focused RED command:

```powershell
npm --prefix frontend test -- src/app/router/AppRouter.lazy.test.tsx
```

Observed result before production changes:

- 6 tests executed;
- 2 failed and 4 passed;
- checkout status did not have `min-h-96`;
- order confirmation exposed only the status named `Carregando checkout`, so
  `Carregando confirmação do pedido` was absent.

Focused GREEN command:

```powershell
npm --prefix frontend test -- src/app/router/AppRouter.lazy.test.tsx
```

Observed result after the minimal router change:

- 1 test file passed;
- 6/6 tests passed.

## Verification gates

- `npm --prefix frontend test`: PASS, 126 files and 842 tests.
- `npm --prefix frontend run typecheck`: PASS.
- `npm --prefix frontend run lint`: PASS.
- `npm --prefix frontend run build`: PASS, Vite 6.4.3, 388 modules transformed.
- `git diff --check 6fbac40f1aac9ee806bec103e4cf7110366be237..HEAD`: recorded in final verification.
- Worktree cleanliness: recorded in final verification.

## Production build audit

The final build produced exactly one file for every lazy page:

| Route page | Chunk | Raw size (KiB, `Length / 1KB`) |
| --- | --- | ---: |
| Checkout | `CheckoutPage-DRYBN1WT.js` | 15.02 KiB |
| Order confirmation | `OrderConfirmationPage-DcMtXsGg.js` | 4.64 KiB |
| Customer data | `CustomerDataPage-OLy6koeG.js` | 26.58 KiB |
| Customer password | `CustomerPasswordPage-DmBxquFR.js` | 9.10 KiB |
| Orders | `OrdersPage-B4Ml7bLV.js` | 11.33 KiB |
| Order detail | `OrderDetailPage-DdFi9T71.js` | 17.34 KiB |

Entry:

- `index-BZwkBxYl.js`: 711.10 KiB raw (`Length / 1KB`; Vite display:
  728.17 kB decimal, gzip 166.67 kB).
- Build warning: chunks larger than 500 kB after minification.
- The warning is intentionally left for TASK-125; this task did not change the
  chunk strategy or warning limit.

### Exclusive marker audit

The following marker was present in the corresponding lazy chunk and absent
from `index-BZwkBxYl.js`:

| Chunk | Audited marker |
| --- | --- |
| Checkout | `confirmar o pedido` |
| Order confirmation | `Pedido criado` |
| Customer data | `Dados atualizados com sucesso.` |
| Customer password | `Senha alterada com sucesso.` |
| Orders | `Nenhum pedido encontrado` |
| Order detail | `cancelamento n\xE3o foi aceito` |

Audit result:
`initial-entry=index-BZwkBxYl.js;size=711.1 KiB (Length / 1KB);clean`.

The plan's literal accented markers cannot all be searched directly because
Vite/esbuild emits some non-ASCII characters as `\xNN` escapes. The original
customer-data marker `Meus dados` is also present in the eagerly loaded account
navigation and therefore is not exclusive to the page. The audit used the
equivalent build representation for accented text and replaced that unsafe
marker with the page-exclusive success copy.

## Implementation summary

- Checkout now uses an accessible `surface min-h-96 p-6` fallback.
- Order confirmation has its own accessible, polite, stable fallback named
  `Carregando confirmação do pedido`.
- `LazyCheckoutRoute` accepts an optional fallback while retaining checkout as
  its default.
- All six existing dynamic imports remain individual and unchanged.
