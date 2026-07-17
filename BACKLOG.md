# Backlog de Shop-Api

## Status Geral

| Fase | Nome | Status | Tasks | Progresso |
|------|------|--------|-------|-----------|
| 1 | Auth | **DONE** | 6 | 100% |
| 2 | Clientes | **DONE** | 8 | 100% |
| 3 | Catálogo | **DONE** | 6 | 100% |
| 4 | Carrinho | **DONE** | 10 | 100% |
| 5 | Checkout | **DONE** | 8 | 100% |
| 6 | Conta do Cliente | **DONE** | 6 | 100% |
| 7 | Pedidos | **DONE** | 10 | 100% |
| 8 | Testes & Hardening | **DONE** | 14 | 100% |
| 9 | Estoque | **PLANNED** | 8 | 0% |
| 10 | Notificações | **PLANNED** | 14 | 0% |
| 11 | Gestão/Admin | **PLANNED** | 12 | 0% |
| 12 | Segurança & Resiliência | **PLANNED** | 8 | 0% |
| 13 | Experiência do Cliente | **PLANNED** | 14 | 0% |
| 14 | Performance & SEO | **PLANNED** | 10 | 0% |
| 15 | Operações & DevOps | **PLANNED** | 8 | 0% |

---

## Backlog Contínuo

Tasks pequenas e independentes, sem fase específica. Podem ser executadas a qualquer momento.

### Frontend

| ID | Task | Deps | Status |
|----|------|------|--------|
| CONT-FRONT-001 | Na lista horizontal de categorias, destacar a categoria corrente do filtro | — | DONE |
| CONT-FRONT-002 | Hero "Encontre produtos para o seu dia a dia" somente na Home; ocultar ao filtrar por categoria ou searchword | — | DONE |
| CONT-FRONT-003 | Exibir fallback visual quando imagem de produto falha ao carregar (placeholder ou cor de fundo) | — | READY |
| CONT-FRONT-004 | Adicionar skeleton loading nos ProductCards durante carregamento inicial do catálogo | — | READY |
| CONT-FRONT-005 | Melhorar mensagens de erro de rede com sugestão de ação (ex: "Verifique sua conexão e tente novamente") | — | READY |
| CONT-FRONT-006 | Aplicar debounce de 300ms no input de busca do Header para reduzir chamadas | — | READY |

### Backend

| ID | Task | Deps | Status |
|----|------|------|--------|
| CONT-BACK-001 | Adicionar índice GIN com `pg_trgm` no campo `titulo` da tabela `Produtos` para busca textual eficiente | — | READY |
| CONT-BACK-002 | Criar ADR documentando decisão de usar Notification Pattern + Result Object em vez de exceptions | — | READY |
| CONT-BACK-003 | Adicionar validação de Content-Type nos endpoints que recebem JSON | — | READY |
| CONT-BACK-004 | Normalizar retorno de erros de validação: garantir que `ApiErrorResponse.details` sempre contenha o campo que falhou | — | READY |

---

## Fase 9 — Estoque

**Status:** PLANNED
**Objetivo:** Expor API de consulta e movimentação de estoque. As entidades `Estoque` e `MovimentoEstoque` já existem no domínio, mas sem use cases nem endpoints.
**Spec:** `docs/superpowers/specs/2026-07-16-fase-9-estoque-design.md`

### Critérios de Aceite

- GET `/api/v1/estoque/{produtoId}` retorna quantidade disponível e limites (mínimo/máximo)
- POST `/api/v1/estoque/movimentacao` registra entrada ou saída com operação, quantidade e descrição
- GET `/api/v1/estoque/movimentacoes/{produtoId}` retorna histórico paginado de movimentações
- Movimentação de saída não pode exceder quantidade atual (regra de domínio)
- Frontend exibe "Disponível: X unidades" na página de detalhes do produto
- ProductCard mostra indicador visual quando estoque baixo (<= quantidade mínima)

### Tasks Backend

| ID | Task | Deps | Status |
|----|------|------|--------|
| BACK-EST-001 | Enriquecer entidades `Estoque` e `MovimentoEstoque` com factory methods e regras de negócio | — | READY |
| BACK-EST-002 | Criar use cases: `ConsultarEstoqueQuery`, `RegistrarMovimentacaoCommand`, `ListarMovimentacoesQuery` | BACK-EST-001 | READY |
| BACK-EST-003 | Criar endpoints REST para estoque e movimentações | BACK-EST-002 | READY |
| BACK-EST-004 | Testes unitários de domínio para Estoque e MovimentoEstoque | BACK-EST-001 | READY |
| BACK-EST-005 | Testes de aplicação para use cases e validators | BACK-EST-002 | READY |
| BACK-EST-006 | Testes de integração para os endpoints de estoque | BACK-EST-003 | READY |

### Tasks Frontend

| ID | Task | Deps | Status |
|----|------|------|--------|
| FRONT-EST-001 | Exibir indicador de estoque no `ProductCard` e `ProductDetailPage` (quantidade + alerta de baixo estoque) | BACK-EST-003 | READY |
| FRONT-EST-002 | Testes de integração MSW para queries de estoque | FRONT-EST-001 | READY |

---

## Fase 10 — Notificações

**Status:** PLANNED
**Objetivo:** Implementar o domínio de notificações — último contexto do `domain-modeling.md` ainda não iniciado. Notificar clientes sobre eventos do ciclo de vida do pedido.
**Spec:** `docs/superpowers/specs/2026-07-16-fase-10-notificacoes-design.md`

### Critérios de Aceite

- Notificação é disparada automaticamente ao: criar pedido, cancelar pedido
- Cliente pode listar suas notificações com paginação e filtro por status (lida/não lida)
- Cliente pode marcar notificação como lida individualmente ou em lote
- Contador de notificações não lidas visível no header
- Canal de email simulado (log estruturado como prova de conceito, sem envio real)
- Notificações expiram/apagam após 90 dias (política de retenção)

### Tasks Backend

| ID | Task | Deps | Status |
|----|------|------|--------|
| BACK-NOT-001 | Criar entidade `Notificacao` + enums `TipoNotificacao`, `CanalNotificacao`, `StatusNotificacao` | — | READY |
| BACK-NOT-002 | Criar use case `DispararNotificacaoCommand` | BACK-NOT-001 | READY |
| BACK-NOT-003 | Criar use case `ConsultarNotificacoesQuery` (paginado, com filtro por status) | BACK-NOT-001 | READY |
| BACK-NOT-004 | Criar use case `MarcarNotificacaoLidaCommand` (individual + lote) | BACK-NOT-001 | READY |
| BACK-NOT-005 | Criar endpoints REST: GET `/notificacao`, PATCH `/notificacao/{id}/lida`, PATCH `/notificacao/lida` | BACK-NOT-002..004 | READY |
| BACK-NOT-006 | Integrar disparo de notificação nos commands de Pedido (`PedidoCriarCommand`, `PedidoCancelarCommand`) | BACK-NOT-002 | READY |
| BACK-NOT-007 | Implementar canal de email via `IEmailSender` com implementação mock (log) | BACK-NOT-006 | READY |
| BACK-NOT-008 | Testes unitários de domínio | BACK-NOT-001 | READY |
| BACK-NOT-009 | Testes de aplicação (use cases + validators) | BACK-NOT-002..004 | READY |
| BACK-NOT-010 | Testes de integração (API + verificar notificação gerada ao criar/cancelar pedido) | BACK-NOT-005..007 | READY |

### Tasks Frontend

| ID | Task | Deps | Status |
|----|------|------|--------|
| FRONT-NOT-001 | Ícone de notificações no Header com badge contador de não lidas | BACK-NOT-005 | READY |
| FRONT-NOT-002 | Página `/notificacoes` com lista paginada, filtro lida/não lida, ação "marcar como lida" | BACK-NOT-005 | READY |
| FRONT-NOT-003 | Testes de integração MSW | FRONT-NOT-001..002 | READY |
| FRONT-NOT-004 | E2E: verificar notificação gerada após criar e cancelar pedido | FRONT-NOT-002 | READY |

---

## Fase 11 — Gestão/Admin

**Status:** PLANNED
**Objetivo:** CRUD administrativo para produtos, categorias e estoque. Viabiliza operação da loja sem scripts SQL manuais.
**Spec:** `docs/superpowers/specs/2026-07-16-fase-11-gestao-admin-design.md`

### Critérios de Aceite

- Endpoints admin protegidos por role `Admin` (policy de autorização)
- CRUD completo de Produto (criar, editar, excluir)
- CRUD completo de Categoria (criar, editar, excluir — com validação de produtos vinculados)
- CRUD de Estoque (criar registro inicial, editar limites mínimo/máximo)
- Painel admin no frontend com menu lateral: Produtos, Categorias, Estoque
- Formulários com validação (FluentValidation no backend, Zod + react-hook-form no frontend)
- Seed de usuário admin inicial via migration ou script

### Tasks Backend

| ID | Task | Deps | Status |
|----|------|------|--------|
| BACK-ADM-001 | Criar use cases: `CriarProdutoCommand`, `EditarProdutoCommand`, `ExcluirProdutoCommand` | — | READY |
| BACK-ADM-002 | Criar use cases: `CriarCategoriaCommand`, `EditarCategoriaCommand`, `ExcluirCategoriaCommand` | — | READY |
| BACK-ADM-003 | Criar use cases: `CriarEstoqueCommand`, `EditarEstoqueCommand` | — | READY |
| BACK-ADM-004 | Criar endpoints admin: `/admin/produto`, `/admin/categoria`, `/admin/estoque` | BACK-ADM-001..003 | READY |
| BACK-ADM-005 | Criar policy `Admin` e proteger endpoints administrativos | — | READY |
| BACK-ADM-006 | Criar seed de usuário admin inicial | BACK-ADM-005 | READY |
| BACK-ADM-007 | Testes de domínio, aplicação e integração para todos os use cases admin | BACK-ADM-001..004 | READY |

### Tasks Frontend

| ID | Task | Deps | Status |
|----|------|------|--------|
| FRONT-ADM-001 | Criar layout admin com menu lateral e rotas protegidas por role | BACK-ADM-004..005 | READY |
| FRONT-ADM-002 | Página de gestão de produtos: tabela, formulário de criação/edição, exclusão com confirmação | BACK-ADM-004 | READY |
| FRONT-ADM-003 | Página de gestão de categorias: tabela, formulário, exclusão com validação de vínculos | BACK-ADM-004 | READY |
| FRONT-ADM-004 | Página de gestão de estoque: tabela, formulário de criação/edição | BACK-ADM-004 | READY |
| FRONT-ADM-005 | Testes de integração MSW e E2E para fluxos admin | FRONT-ADM-001..004 | READY |

---

## Fase 12 — Segurança & Resiliência

**Status:** PLANNED
**Objetivo:** Preparar a API para ambiente hostil com rate limiting, health checks, telemetria e logs estruturados.
**Spec:** `docs/superpowers/specs/2026-07-16-fase-12-seguranca-resiliencia-design.md`

### Critérios de Aceite

- Rate limiting: 100 req/min por IP em endpoints públicos, 300 req/min por token JWT em endpoints autenticados
- Health checks: `/health` (liveness) e `/health/db` (readiness — verifica conexão PostgreSQL)
- OpenTelemetry tracing com export para Application Insights
- Serilog enriquecido com correlation ID, client IP e user agent em todas as requisições
- Timeout de 30s em chamadas externas (HttpClient)
- CORS restrito a origens explícitas de produção

### Tasks

| ID | Task | Deps | Status |
|----|------|------|--------|
| BACK-SEC-001 | Configurar rate limiting com AspNetCoreRateLimit (IP + JWT policies) | — | READY |
| BACK-SEC-002 | Adicionar health check endpoints (`/health`, `/health/db`) | — | READY |
| BACK-SEC-003 | Configurar OpenTelemetry + Application Insights exporter | — | READY |
| BACK-SEC-004 | Enriquecer Serilog com correlation ID, client IP, user agent | — | READY |
| BACK-SEC-005 | Configurar timeout e retry policies no HttpClient | — | READY |
| BACK-SEC-006 | Revisar e restringir CORS para origens de produção | — | READY |
| BACK-SEC-007 | Adicionar header `X-Content-Type-Options: nosniff` e `X-Frame-Options: DENY` | — | READY |
| BACK-SEC-008 | Testes de integração para health checks e rate limiting | BACK-SEC-001..002 | READY |

---

## Fase 13 — Experiência do Cliente

**Status:** PLANNED
**Objetivo:** Refinamentos de UX que diferenciam o produto: filtros avançados, favoritos, múltiplos endereços, avaliações.
**Spec:** `docs/superpowers/specs/2026-07-16-fase-13-experiencia-cliente-design.md`

### Critérios de Aceite

- Filtros no catálogo: faixa de preço (min-max), ordenação (preço ASC/DESC, nome A-Z/Z-A, mais recentes)
- Lista de desejos: adicionar/remover produtos, página dedicada `/favoritos`
- Múltiplos endereços: CRUD de endereços, seleção no checkout
- Seleção visual de forma de pagamento no checkout
- Timeline visual de status do pedido
- Avaliações: nota 1-5 + comentário, média no produto

### Tasks Backend

| ID | Task | Deps | Status |
|----|------|------|--------|
| BACK-UX-001 | Adicionar parâmetros de ordenação e faixa de preço ao endpoint `GET /produto` | — | READY |
| BACK-UX-002 | Criar entidade `Favorito` + use cases: `AdicionarFavorito`, `RemoverFavorito`, `ListarFavoritos` | — | READY |
| BACK-UX-003 | Criar endpoints de favoritos | BACK-UX-002 | READY |
| BACK-UX-004 | Criar entidade `Avaliacao` + use cases: `CriarAvaliacao`, `ListarAvaliacoesPorProduto` | — | READY |
| BACK-UX-005 | Criar endpoints de avaliações | BACK-UX-004 | READY |
| BACK-UX-006 | Expandir endpoint de cliente para suportar múltiplos endereços (lista) | — | READY |
| BACK-UX-007 | Testes de domínio, aplicação e integração | BACK-UX-001..006 | READY |

### Tasks Frontend

| ID | Task | Deps | Status |
|----|------|------|--------|
| FRONT-UX-001 | Adicionar filtros de ordenação e faixa de preço na página de catálogo | BACK-UX-001 | READY |
| FRONT-UX-002 | Implementar lista de desejos: botão coração no ProductCard, página `/favoritos` | BACK-UX-003 | READY |
| FRONT-UX-003 | Implementar múltiplos endereços: CRUD na área do cliente, seleção no checkout | BACK-UX-006 | READY |
| FRONT-UX-004 | Implementar seleção visual de forma de pagamento no checkout (cards: Pix, Cartão, Boleto) | — | READY |
| FRONT-UX-005 | Implementar timeline visual de status do pedido na página de detalhes | — | READY |
| FRONT-UX-006 | Implementar avaliações: estrelas + formulário de comentário, exibição na ProductDetailPage | BACK-UX-005 | READY |
| FRONT-UX-007 | Testes de integração MSW e E2E | FRONT-UX-001..006 | READY |

---

## Fase 14 — Performance & SEO

**Status:** PLANNED
**Objetivo:** Otimizações técnicas para produção: carregamento rápido, SEO, PWA.
**Spec:** `docs/superpowers/specs/2026-07-16-fase-14-performance-seo-design.md`

### Critérios de Aceite

- Code splitting com lazy loading em todas as rotas pesadas
- Imagens com lazy loading nativo (`loading="lazy"`) e formato WebP
- Meta tags dinâmicas (title, description, og:image) por página
- PWA: service worker, manifest.json, fallback offline
- Cache HTTP na API: ETag e Cache-Control para endpoints de catálogo e categorias
- Análise de bundle: nenhum chunk acima de 250KB (exceto vendors)
- Lighthouse: Performance >= 90, SEO >= 90

### Tasks

| ID | Task | Deps | Status |
|----|------|------|--------|
| FRONT-PERF-001 | Converter rotas restantes para lazy loading (React.lazy + Suspense) | — | READY |
| FRONT-PERF-002 | Otimizar ProductImage com lazy loading nativo, placeholder blur e fallback WebP | — | READY |
| FRONT-PERF-003 | Adicionar meta tags dinâmicas por rota (react-helmet-async) | — | READY |
| FRONT-PERF-004 | Configurar PWA: service worker (vite-plugin-pwa), manifest.json, offline fallback | — | READY |
| FRONT-PERF-005 | Rodar bundle analysis e identificar/eliminar duplicações | — | READY |
| FRONT-PERF-006 | Implementar virtual scrolling na listagem de pedidos (se > 50 itens) | — | READY |
| FRONT-PERF-007 | Adicionar prefetching de links visíveis (categorias no header, links de produto) | — | READY |
| BACK-PERF-001 | Adicionar cache headers (ETag, Cache-Control) nos endpoints de `GET /produto` e `GET /categoria` | — | READY |
| BACK-PERF-002 | Otimizar queries: revisar N+1, adicionar `.AsNoTracking()`, projeções com `.Select()` | — | READY |
| BACK-PERF-003 | Adicionar compressão de resposta (Brotli/Gzip) no pipeline da API | — | READY |

---

## Fase 15 — Operações & DevOps

**Status:** PLANNED
**Objetivo:** Prontidão operacional para produção sustentada: CI/CD, backups, disaster recovery, load testing.
**Spec:** `docs/superpowers/specs/2026-07-16-fase-15-operacoes-devops-design.md`

### Critérios de Aceite

- Pipeline CI/CD no GitHub Actions: build, test, push imagem Docker, deploy no Container App
- Backup automatizado do PostgreSQL (diário, retenção 30 dias)
- Script de disaster recovery documentado e testado
- Load test com k6: 100 usuários simultâneos, p95 < 500ms
- Alertas configurados: erro 5xx > 5%, latência p95 > 1s, DB connection failures
- Documentação de runbook operacional (como escalar, reverter deploy, investigar incidentes)

### Tasks

| ID | Task | Deps | Status |
|----|------|------|--------|
| OPS-001 | Criar workflow GitHub Actions: build + test no PR, build + push + deploy no merge para main | — | READY |
| OPS-002 | Configurar backup automatizado do PostgreSQL (pg_dump + storage account) | — | READY |
| OPS-003 | Criar script de disaster recovery (restore backup, redeploy infra via Bicep) | OPS-002 | READY |
| OPS-004 | Criar cenários de load test com k6 (catálogo, carrinho, checkout, login) | — | READY |
| OPS-005 | Configurar alertas no Azure Monitor (5xx rate, latência, DB failures) | — | READY |
| OPS-006 | Configurar gestão de secrets: referências do Key Vault no Container App | — | READY |
| OPS-007 | Escrever runbook operacional (`docs/runbook.md`) | — | READY |
| OPS-008 | Executar e validar disaster recovery em ambiente de staging | OPS-003 | READY |
