# Fase 8 — Testes e Hardening: índice de orquestração

> **Para agentes orquestradores:** este arquivo não é um plano de implementação. Somente o plano detalhado do lote cujo backlog está `READY` é executável. Use `superpowers:subagent-driven-development` e cumpra o workflow de `AGENTS.md` por task.

**Objetivo:** ordenar `TASK-106` a `TASK-130` sem permitir que instruções resumidas substituam um plano detalhado, revisão ou gates.

**Arquitetura:** os cinco lotes são sequenciais. O agente principal apenas orquestra; cada task passa por explorador, implementador e revisor, com um único writer por checkout.

**Tech Stack:** React 19, TypeScript 5.7, Vitest 4, Testing Library, MSW 2, Playwright 1.61, Vite 6.

## Planos por lote

| Ordem | Tasks | Estado | Plano executável |
| --- | --- | --- | --- |
| 1 | `TASK-106`–`TASK-110` | `READY` | `docs/superpowers/plans/2026-07-15-fase-8-lote-1-cobertura-deterministica.md` |
| 2 | `TASK-111`–`TASK-116` | `DONE` | [plano detalhado de integrações MSW](./2026-07-16-fase-8-lote-2-integracoes-msw.md) |
| 3 | `TASK-117`–`TASK-123` | `TASK-117` `DONE`; `TASK-118` `READY`; demais bloqueadas por dependências | `TASK-117`: [autenticação E2E](./2026-07-16-task-117-auth-e2e.md); `TASK-118`: [visitante e carrinho E2E](./2026-07-16-task-118-guest-cart-e2e.md); criar planos de `TASK-119`–`TASK-123` após desbloqueio |
| 4 | `TASK-124`–`TASK-129` | `BLOCKED` até lote 3 `DONE` | criar após desbloqueio |
| 5 | `TASK-130` | `BLOCKED` até `TASK-106`–`TASK-129` `DONE` | criar após desbloqueio |

Instruções resumidas, a especificação e linhas do backlog não autorizam implementação. Antes de cada lote, seu plano detalhado deve conter paths literais, interfaces inspecionadas, código completo, comandos, RED/GREEN, gates e commits por task.

## Gates obrigatórios

1. Elegibilidade: status `READY`, todas as `Depends on` em `DONE`, critérios definidos e nenhum writer concorrente nos mesmos componentes.
2. Task: registrar `BASE_COMMIT`; delegar exploração; aguardar relatório; delegar implementação/testes; gerar `git diff BASE_COMMIT..HEAD`; delegar revisão.
3. Findings: todo `CRITICAL` ou `IMPORTANT` volta ao implementador, repete testes e retorna ao revisor.
4. Qualidade: teste focado, `npm --prefix frontend run typecheck` e `npm --prefix frontend run lint` com exit code `0`; gates adicionais constam no plano do lote.
5. Conclusão: somente após aprovação do implementador e do revisor atualizar backlog para `DONE`, registrar evidências/commits e criar commit final pendente.
6. Lote: todas as tasks do lote devem estar `DONE`, checkout limpo e relatório final deve listar concluídas, bloqueadas, commits, testes, findings e mudanças no backlog.
7. Sequenciamento: nenhum writer simultâneo no checkout compartilhado; lote posterior continua bloqueado até o gate anterior.
