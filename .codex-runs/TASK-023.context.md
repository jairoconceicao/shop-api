# TASK-023 Context

- Scope: unit tests for shared API response and error normalizers in `frontend/src/app/shared/api/`.
- Location: `frontend/src/app/shared/api/api-response.normalizers.spec.ts` and `frontend/src/app/shared/api/api-error.normalizers.spec.ts`.
- Approach: cover pass-through behavior for response envelopes, direct and wrapped API errors, and fallback normalization by HTTP status.
- Validation target: `npm run build --prefix frontend` and `npm test --prefix frontend`.
