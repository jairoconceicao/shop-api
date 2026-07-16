# Fase 8 — Lote 2: Integrações MSW Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** executar TASK-111–116 com integrações HTTP reais no browser simulado, MSW estrito, providers reais e reconciliação observável.

**Architecture:** este arquivo é o índice executável do lote. Cada task possui um plano físico autossuficiente com interfaces, código de teste, handlers, fixtures, comandos, commits e gates próprios.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, user-event, TanStack Query 5, React Router 7, MSW 2, Zustand e Zod.

## Global Constraints

- `server.listen({ onUnhandledRequest: 'error' })` permanece inalterado.
- Nenhum service, query, mutation, store, page ou provider recebe `vi.mock`.
- Cada task segue BASE_COMMIT → explorador → implementador → diff → revisor → fix-loop → DONE.
- Um único writer usa o checkout; `CRITICAL` e `IMPORTANT` bloqueiam DONE.
- Cada RED possui falha literal; cada GREEN executa teste focado, typecheck e lint.
- TASK-115 permanece BLOCKED até TASK-114 estar DONE e o backlog registrar TASK-115 READY.

## Ordem e planos autossuficientes

1. [TASK-111 — autenticação](./2026-07-16-task-111-auth-msw.md)
2. [TASK-112 — cadastro e perfil](./2026-07-16-task-112-customer-msw.md)
3. [TASK-113 — catálogo](./2026-07-16-task-113-catalog-msw.md)
4. [TASK-114 — carrinho](./2026-07-16-task-114-cart-msw.md)
5. [TASK-115 — checkout](./2026-07-16-task-115-checkout-msw.md)
6. [TASK-116 — pedidos](./2026-07-16-task-116-orders-msw.md)

## Gate do lote

Depois de TASK-111–116 DONE, execute:

```powershell
npm --prefix frontend test -- src/features/auth/auth.integration.test.tsx src/features/customer/customer.integration.test.tsx src/features/catalog/catalog.integration.test.tsx src/features/cart/cart.integration.test.tsx src/features/checkout/checkout.integration.test.tsx src/features/orders/orders.integration.test.tsx --reporter=verbose
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend test
```

Resultado obrigatório: quatro exit codes `0`, nenhum request não tratado e nenhuma rejeição não tratada. A revisão aprovada do lote libera a transição administrativa de TASK-117.

## Self-review

- Os seis links resolvem para planos físicos.
- Cada plano repete o header, constraints, interfaces, setup/cleanup e workflow completo.
- Endpoints foram conferidos nos services; catálogo usa `size=20`; pedidos usa `size=20`.
- TASK-115 não contém autorização implícita para execução antecipada.

## Execution Handoff

Execute uma task por vez com `superpowers:subagent-driven-development`, usando o plano físico correspondente.
