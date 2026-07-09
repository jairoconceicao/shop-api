# TASK-012 Context

- Scope: shared frontend UI states for loading, skeleton, empty, success, and error.
- Location: `frontend/src/app/shared/ui/states/`.
- Approach: standalone Angular components with accessible roles, minimal inputs, and content projection for actions.
- Validation target: `npm run build --prefix frontend` and `npm test --prefix frontend`.
