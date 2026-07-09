# Backlog de tarefas do frontend da Shop API

**Tipo de conteudo:** Backlog

Este backlog transforma `docs/frontend-implementation-plan.md` em uma lista
acionavel de tarefas para implementar o frontend em `/frontend`. As tarefas
seguem as guidelines de `AGENTS.md`, `docs/frontend-specs.md` e os contratos
descritos em `docs/api-reference.md`, considerando o backend v1 atual como
limite pratico de integracao.

## Objetivo

Entregar uma loja virtual mobile first em Angular 22+, TypeScript, Tailwind CSS
v4 e Angular CDK, com fluxos completos para catalogo, autenticacao, carrinho,
checkout e area do cliente.

## Status atual

Implementacao ja identificada em `/frontend`:

- Fundacao do projeto Angular criada e operacional.
- Tailwind CSS v4, Angular CDK, ESLint, Prettier, Husky, lint-staged,
  Testing Library Angular e Playwright configurados.
- Tema global, `AppShell`, `Header`, `Footer`, `MobileBottomNavigation`,
  `PageContainer` e paginas placeholder criados.
- Rotas base para `/`, `/login`, `/products`, `/cart` e `/account` criadas.
- Home visual inicial, tela-base de login e um smoke test de componente/e2e
  implementados.

Ainda pendente no frontend atual:

- Integracoes reais com a API.
- Autenticacao, sessao, guard, interceptor e stores de dominio.
- Formularios com schema, mascaras e estados completos.
- Catalogo, detalhe de produto, carrinho, checkout, conta e pedidos com
  comportamento funcional.

## Escopo

Este backlog cobre apenas o frontend.

Entregas incluidas:

- Fundacao tecnica e visual do projeto Angular em `/frontend`.
- UI mobile first inspirada em e-commerces como Mercado Livre, Kabum e Magazine
  Luiza, usando identidade propria da Shop API.
- Integracao com os endpoints publicos de catalogo, categoria, produto, login e
  cadastro.
- Integracao autenticada para carrinho, checkout, dados do cliente, troca de
  senha e pedidos.
- Testes unitarios, testes de componentes e testes end-to-end dos fluxos
  principais.

Fora do escopo inicial:

- Gestao dedicada de multiplos enderecos salvos.
- Blocos promocionais dinamicos orientados por API.
- Curadoria administrativa de categorias.

## Premissas de implementacao

- O catalogo, as categorias e o detalhe de produto sao publicos.
- Carrinho, checkout, conta, logout e pedidos exigem autenticacao.
- O login retorna `token`, `tipo`, `expiraEm`, `usuarioId`, `clienteId` e
  `email`; esses campos formam a sessao do frontend.
- A preferencia de longo prazo e cookie `HttpOnly`, mas a v1 atual usa bearer
  token.
- Respostas simples usam envelope `data`; respostas paginadas usam envelope
  `pagination.data`.
- O frontend deve normalizar os envelopes da API em uma camada compartilhada.
- A listagem de pedidos exige `cpf`; o frontend deve carregar o perfil do
  cliente antes de buscar pedidos.
- Ao criar carrinho, adicionar item ao carrinho e criar pedido, o frontend deve
  seguir o comportamento atual descrito em `docs/frontend-implementation-plan.md`:
  o backend deriva dados do cliente autenticado pela sessao.
- `PATCH /api/v1/pedido/{pedidoId}` deve ser tratado apenas como cancelamento,
  enviando `status: "Cancelado"`.

## Backend

Nenhuma tarefa de backend faz parte da entrega inicial deste backlog.

Dependencias futuras para evolucao do frontend:

[ ] DEP-01: Expor rotas para multiplos enderecos salvos.
[ ] DEP-02: Expor rotas para ofertas, campanhas e promocoes dinamicas.
[ ] DEP-03: Expor rotas administrativas para ordenar e curar categorias.
[ ] DEP-04: Evoluir autenticacao para cookie `HttpOnly`, se definido como direcao do produto.

## Frontend

### 1. Fundacao do projeto

[x] TASK-001: Criar o projeto Angular 22+ em `/frontend`.
[x] TASK-002: Configurar TypeScript, estrutura de paths e organizacao por dominio.
[x] TASK-003: Configurar Tailwind CSS v4 com tokens globais da Shop API.
[x] TASK-004: Configurar Angular CDK.
[x] TASK-005: Configurar ESLint, Prettier, Husky e lint-staged.
[x] TASK-006: Configurar Jest ou Vitest para testes unitarios.
[x] TASK-007: Configurar Testing Library Angular para testes de componentes.
[x] TASK-008: Configurar Playwright para testes end-to-end.
[x] TASK-009: Criar scripts de `lint`, `test`, `build` e `e2e`.

### 2. Design system e componentes base

Entregue ate aqui:

- Tokens globais do tema.
- Layout base com `AppShell`, `PageContainer`, `Header`,
  `MobileBottomNavigation` e `Footer`.
- Estrutura responsiva inicial para mobile e desktop.

[x] TASK-010: Definir tokens de cor, tipografia, espacamento, bordas e sombras.
[x] TASK-011: Criar componentes base de `Button`, `Input`, `Checkbox`, `Alert` e `FormError`.
[x] TASK-012: Criar estados padrao de loading, skeleton, vazio, sucesso e erro.
[x] TASK-013: Criar componentes de layout `AppShell`, `PageContainer`, `Header`, `MobileBottomNavigation` e `Footer`.
[x] TASK-014: Garantir layout mobile first e adaptacao para desktop.
[x] TASK-015: Garantir busca e carrinho sempre acessiveis no header.
[x] TASK-016: Criar testes de componentes para os elementos base.

### 3. Camada HTTP e contratos da API

Observacao: `provideHttpClient(withFetch())` ja foi registrado na composicao da
aplicacao, mas ainda nao existe uma camada HTTP compartilhada com contratos,
normalizadores e tratamento padrao de erros.

[x] TASK-017: Definir modelos TypeScript para envelopes `ApiResponse<T>` e `PagedResponse<T>`.
[x] TASK-018: Definir modelos TypeScript para auth, cliente, categoria, produto, carrinho e pedido.
[x] TASK-019: Implementar cliente HTTP centralizado.
[x] TASK-020: Implementar normalizadores para `data` e `pagination.data`.
[x] TASK-021: Implementar tratamento padrao de erros da API.
[x] TASK-022: Implementar configuracao de URL base por ambiente.
[x] TASK-023: Criar testes unitarios para normalizacao de respostas e erros.

### 4. Autenticacao e sessao

Observacao: existe apenas a tela visual base de `/login`; a autenticacao ainda
nao foi conectada ao backend e nao ha sessao, guard ou interceptor.

[ ] TASK-024: Implementar `TokenStorageService`.
[ ] TASK-025: Implementar `AuthService` com login e logout.
[ ] TASK-026: Implementar `HttpInterceptor` para `Authorization: Bearer <token>`.
[ ] TASK-027: Implementar `AuthGuard` para rotas privadas.
[ ] TASK-028: Persistir dados de sessao com `token`, `tipo`, `expiraEm`, `usuarioId`, `clienteId` e `email`.
[ ] TASK-029: Tratar expiracao de token e redirecionamento para login.
[ ] TASK-030: Preparar a abstracao para migracao futura para cookie `HttpOnly`.
[ ] TASK-031: Implementar tela de login com validacao por schema.
[ ] TASK-032: Implementar estados de erro, carregamento e sucesso no login.
[ ] TASK-033: Criar testes unitarios e de componente para login e sessao.

### 5. Cadastro de cliente

[ ] TASK-034: Implementar tela publica de criacao de conta.
[ ] TASK-035: Implementar formulario com dados pessoais, endereco e celular.
[ ] TASK-036: Aplicar mascaras para CPF, CEP, DDD e telefone com `ngx-mask`.
[ ] TASK-037: Aplicar validacoes por schema.
[ ] TASK-038: Integrar `POST /api/v1/cliente`.
[ ] TASK-039: Tratar erros de validacao e conflitos retornados pela API.
[ ] TASK-040: Redirecionar para login ou iniciar fluxo definido apos cadastro.
[ ] TASK-041: Criar testes de componente e integracao do formulario.

### 6. Home publica

Observacao: a home visual inicial ja existe, mas ainda usa conteudo estatico e
nao consome categorias nem produtos da API.

[ ] TASK-042: Implementar home mobile first com banner, atalhos, categorias e vitrine.
[ ] TASK-043: Carregar produtos publicos via `GET /api/v1/produto`.
[ ] TASK-044: Carregar categorias via `GET /api/v1/categoria`.
[ ] TASK-045: Implementar cards de produto com imagem, titulo, preco, estoque e CTA.
[ ] TASK-046: Implementar estados de loading, vazio e erro.
[ ] TASK-047: Implementar paginacao ou carregamento incremental conforme UX definida.
[ ] TASK-048: Criar testes de componente para home, vitrine e card de produto.

### 7. Catalogo, busca e categorias

Observacao: a rota `/products` ja existe como placeholder dentro do shell, mas
o catalogo funcional ainda nao foi implementado.

[ ] TASK-049: Implementar rota `/products`.
[ ] TASK-050: Implementar campo de busca usando query `searchword`.
[ ] TASK-051: Implementar filtro por categoria usando `GET /api/v1/categoria`.
[ ] TASK-052: Integrar listagem por categoria com `GET /api/v1/produto/categoria/{categoriaId}`.
[ ] TASK-053: Refletir pagina, tamanho e total de itens retornados pelo backend.
[ ] TASK-054: Preservar filtros e busca na URL.
[ ] TASK-055: Implementar estados de resultado vazio e erro recuperavel.
[ ] TASK-056: Criar testes de integracao para busca e filtro por categoria.

### 8. Detalhe do produto

[ ] TASK-057: Implementar rota `/products/:id`.
[ ] TASK-058: Integrar `GET /api/v1/produto/{id}`.
[ ] TASK-059: Exibir imagem, titulo, descricao, modelo, categoria, preco e estoque.
[ ] TASK-060: Exibir CTA de comprar agora e adicionar ao carrinho.
[ ] TASK-061: Tratar produto indisponivel ou sem estoque.
[ ] TASK-062: Redirecionar usuarios nao autenticados para login ao iniciar compra.
[ ] TASK-063: Criar testes de componente e fluxo para detalhe de produto.

### 9. Carrinho

Observacao: a rota `/cart` ja existe como placeholder, sem store nem
integracao com a API.

[ ] TASK-064: Criar store de dominio `Cart` com NgRx SignalStore.
[ ] TASK-065: Implementar criacao automatica de carrinho quando necessario.
[ ] TASK-066: Integrar `POST /api/v1/carrinho/criar`.
[ ] TASK-067: Integrar `GET /api/v1/carrinho/{carrinhoId}`.
[ ] TASK-068: Integrar `POST /api/v1/carrinho/items` sem enviar `carrinhoId`.
[ ] TASK-069: Integrar `PATCH /api/v1/carrinho/items/{itemId}` para quantidade.
[ ] TASK-070: Integrar `DELETE /api/v1/carrinho/items/{itemId}` para remocao.
[ ] TASK-071: Implementar rota `/cart`.
[ ] TASK-072: Implementar componentes `CartButton`, `CartItem`, `CartSummary` e `QuantitySelector`.
[ ] TASK-073: Manter resumo de valores consistente apos alteracoes.
[ ] TASK-074: Criar testes unitarios da store e testes de fluxo do carrinho.

### 10. Checkout

[ ] TASK-075: Implementar rota protegida de checkout.
[ ] TASK-076: Reutilizar dados do carrinho ativo.
[ ] TASK-077: Carregar perfil do cliente para preencher endereco base.
[ ] TASK-078: Permitir edicao explicita de `enderecoEntrega` no checkout.
[ ] TASK-079: Implementar selecao de `formaPagamento`.
[ ] TASK-080: Integrar `POST /api/v1/pedido`.
[ ] TASK-081: Enviar somente os campos suportados pelo backend atual.
[ ] TASK-082: Tratar sucesso com confirmacao do pedido.
[ ] TASK-083: Tratar erro de carrinho vazio, produto indisponivel e falha de validacao.
[ ] TASK-084: Criar teste end-to-end do fluxo adicionar ao carrinho e finalizar pedido.

### 11. Area do cliente

Observacao: a rota `/account` ja existe como placeholder, sem fluxo funcional
de perfil.

[ ] TASK-085: Criar store de dominio `Customer` com NgRx SignalStore.
[ ] TASK-086: Implementar rota `/account`.
[ ] TASK-087: Implementar rota `/account/profile`.
[ ] TASK-088: Integrar `GET /api/v1/cliente/{clienteId}`.
[ ] TASK-089: Integrar `PUT /api/v1/cliente/{clienteId}`.
[ ] TASK-090: Integrar `DELETE /api/v1/cliente/{clienteId}` para cancelamento de conta.
[ ] TASK-091: Implementar menu lateral no desktop e navegacao simples no mobile.
[ ] TASK-092: Criar formulario de perfil com validacao por schema.
[ ] TASK-093: Criar confirmacao explicita antes de cancelar conta.
[ ] TASK-094: Criar testes de componente e integracao da area do cliente.

### 12. Alteracao de senha

[ ] TASK-095: Implementar rota `/account/password`.
[ ] TASK-096: Criar formulario com senha atual, nova senha e confirmacao.
[ ] TASK-097: Aplicar validacoes por schema.
[ ] TASK-098: Integrar `PUT /api/v1/cliente/{clienteId}/senha`.
[ ] TASK-099: Exibir estados de sucesso, erro de validacao e erro de senha atual.
[ ] TASK-100: Criar testes do formulario de alteracao de senha.

### 13. Pedidos

[ ] TASK-101: Criar store de dominio `Checkout` ou `Orders`, conforme organizacao final.
[ ] TASK-102: Implementar rota `/account/orders`.
[ ] TASK-103: Antes da listagem, garantir que o perfil do cliente com `cpf` foi carregado.
[ ] TASK-104: Integrar `GET /api/v1/pedido?cpf={cpf}&page=&size=`.
[ ] TASK-105: Implementar filtros opcionais por `dataInicio` e `dataFim`.
[ ] TASK-106: Implementar detalhe de pedido com `GET /api/v1/pedido/{pedidoId}`.
[ ] TASK-107: Implementar cancelamento com `PATCH /api/v1/pedido/{pedidoId}` enviando `status: "Cancelado"`.
[ ] TASK-108: Exibir status com `OrderStatusBadge`.
[ ] TASK-109: Criar testes de listagem, detalhe e cancelamento de pedido.

### 14. Roteamento e stores de dominio

Entregue ate aqui:

- Shell com rotas publicas base para `/`, `/login`, `/products`, `/cart` e
  `/account`.
- Separacao inicial por `core`, `shared` e `domains`.

[ ] TASK-110: Definir rotas publicas: `/`, `/login`, `/products`, `/products/:id` e cadastro.
[ ] TASK-111: Definir rotas protegidas: `/cart`, checkout, `/account`, `/account/profile`, `/account/password` e `/account/orders`.
[ ] TASK-112: Criar stores por dominio: `Auth`, `Cart`, `Catalog`, `Customer` e `Checkout`.
[ ] TASK-113: Garantir que stores nao dupliquem normalizacao de envelope HTTP.
[ ] TASK-114: Garantir redirecionamentos coerentes apos login, logout e expiracao de sessao.
[ ] TASK-115: Criar testes unitarios dos reducers/actions/metodos de store.

### 15. Acessibilidade, responsividade e qualidade visual

[ ] TASK-116: Validar navegacao por teclado nos fluxos principais.
[ ] TASK-117: Garantir labels, descricoes de erro e foco visivel nos formularios.
[ ] TASK-118: Garantir contraste adequado para tokens do tema.
[ ] TASK-119: Validar layout em mobile pequeno, mobile grande, tablet e desktop.
[ ] TASK-120: Evitar sobreposicao de textos e componentes em breakpoints suportados.
[ ] TASK-121: Garantir que botoes e alvos de toque sejam confortaveis no mobile.
[ ] TASK-122: Revisar consistencia visual com `docs/frontend-specs.md`.

### 16. Testes end-to-end e aceite

Observacao: existe um e2e inicial de smoke test para a home, mas os fluxos de
negocio ainda nao estao cobertos.

[ ] TASK-123: Criar e2e para catalogo publico sem autenticacao.
[ ] TASK-124: Criar e2e para login e acesso a rota protegida.
[ ] TASK-125: Criar e2e para cadastro de cliente.
[ ] TASK-126: Criar e2e para busca textual e filtro por categoria.
[ ] TASK-127: Criar e2e para detalhe do produto e adicionar ao carrinho.
[ ] TASK-128: Criar e2e para alterar quantidade e remover item do carrinho.
[ ] TASK-129: Criar e2e para checkout com criacao de pedido.
[ ] TASK-130: Criar e2e para area do cliente e alteracao de senha.
[ ] TASK-131: Criar e2e para listagem, detalhe e cancelamento de pedido.
[ ] TASK-132: Garantir que `lint`, `test`, `build` e `e2e` passam antes da entrega.

## Ordem sugerida de entrega

1. Fundacao do projeto e configuracao de qualidade.
2. Design system, layout global e camada HTTP.
3. Autenticacao, sessao, rotas e guards.
4. Catalogo publico, busca, categorias e detalhe de produto.
5. Cadastro de cliente.
6. Carrinho e checkout.
7. Area do cliente, senha e pedidos.
8. Testes end-to-end, acessibilidade e refinamento visual.

## Criterios de aceite da entrega inicial

- O projeto existe em `/frontend` com Angular 22+, TypeScript, Tailwind CSS v4
  e Angular CDK configurados.
- O layout e mobile first e adapta corretamente para desktop.
- O catalogo publico abre sem autenticacao.
- Login, logout, guard e interceptor funcionam com bearer token.
- Cadastro de cliente funciona sem autenticacao previa.
- Busca textual e filtro por categoria usam as rotas publicas da API v1.
- Detalhe de produto abre por `produtoId`.
- Carrinho permite criar, consultar, adicionar, alterar quantidade e remover
  itens.
- Checkout cria pedido com os campos suportados pelo backend atual.
- Area do cliente permite consultar e editar dados, alterar senha e listar
  pedidos.
- Cancelamento de pedido envia apenas `status: "Cancelado"`.
- Estados de loading, vazio, erro e sucesso estao implementados nos fluxos
  principais.
- Testes unitarios, de componentes e e2e cobrem os comportamentos alterados.
- Funcionalidades futuras ficam documentadas sem bloquear a entrega inicial.
