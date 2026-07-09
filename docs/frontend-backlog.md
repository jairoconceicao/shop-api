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

- [ ] Expor rotas para multiplos enderecos salvos.
- [ ] Expor rotas para ofertas, campanhas e promocoes dinamicas.
- [ ] Expor rotas administrativas para ordenar e curar categorias.
- [ ] Evoluir autenticacao para cookie `HttpOnly`, se definido como direcao do
      produto.

## Frontend

### 1. Fundacao do projeto

- [ ] Criar o projeto Angular 22+ em `/frontend`.
- [ ] Configurar TypeScript, estrutura de paths e organizacao por dominio.
- [ ] Configurar Tailwind CSS v4 com tokens globais da Shop API.
- [ ] Configurar Angular CDK.
- [ ] Configurar ESLint, Prettier, Husky e lint-staged.
- [ ] Configurar Jest ou Vitest para testes unitarios.
- [ ] Configurar Testing Library Angular para testes de componentes.
- [ ] Configurar Playwright para testes end-to-end.
- [ ] Criar scripts de `lint`, `test`, `build` e `e2e`.

### 2. Design system e componentes base

- [ ] Definir tokens de cor, tipografia, espacamento, bordas e sombras.
- [ ] Criar componentes base de `Button`, `Input`, `Checkbox`, `Alert` e
      `FormError`.
- [ ] Criar estados padrao de loading, skeleton, vazio, sucesso e erro.
- [ ] Criar componentes de layout `AppShell`, `PageContainer`, `Header`,
      `MobileBottomNavigation` e `Footer`.
- [ ] Garantir layout mobile first e adaptacao para desktop.
- [ ] Garantir busca e carrinho sempre acessiveis no header.
- [ ] Criar testes de componentes para os elementos base.

### 3. Camada HTTP e contratos da API

- [ ] Definir modelos TypeScript para envelopes `ApiResponse<T>` e
      `PagedResponse<T>`.
- [ ] Definir modelos TypeScript para auth, cliente, categoria, produto,
      carrinho e pedido.
- [ ] Implementar cliente HTTP centralizado.
- [ ] Implementar normalizadores para `data` e `pagination.data`.
- [ ] Implementar tratamento padrao de erros da API.
- [ ] Implementar configuracao de URL base por ambiente.
- [ ] Criar testes unitarios para normalizacao de respostas e erros.

### 4. Autenticacao e sessao

- [ ] Implementar `TokenStorageService`.
- [ ] Implementar `AuthService` com login e logout.
- [ ] Implementar `HttpInterceptor` para `Authorization: Bearer <token>`.
- [ ] Implementar `AuthGuard` para rotas privadas.
- [ ] Persistir dados de sessao com `token`, `tipo`, `expiraEm`, `usuarioId`,
      `clienteId` e `email`.
- [ ] Tratar expiracao de token e redirecionamento para login.
- [ ] Preparar a abstracao para migracao futura para cookie `HttpOnly`.
- [ ] Implementar tela de login com validacao por schema.
- [ ] Implementar estados de erro, carregamento e sucesso no login.
- [ ] Criar testes unitarios e de componente para login e sessao.

### 5. Cadastro de cliente

- [ ] Implementar tela publica de criacao de conta.
- [ ] Implementar formulario com dados pessoais, endereco e celular.
- [ ] Aplicar mascaras para CPF, CEP, DDD e telefone com `ngx-mask`.
- [ ] Aplicar validacoes por schema.
- [ ] Integrar `POST /api/v1/cliente`.
- [ ] Tratar erros de validacao e conflitos retornados pela API.
- [ ] Redirecionar para login ou iniciar fluxo definido apos cadastro.
- [ ] Criar testes de componente e integracao do formulario.

### 6. Home publica

- [ ] Implementar home mobile first com banner, atalhos, categorias e vitrine.
- [ ] Carregar produtos publicos via `GET /api/v1/produto`.
- [ ] Carregar categorias via `GET /api/v1/categoria`.
- [ ] Implementar cards de produto com imagem, titulo, preco, estoque e CTA.
- [ ] Implementar estados de loading, vazio e erro.
- [ ] Implementar paginacao ou carregamento incremental conforme UX definida.
- [ ] Criar testes de componente para home, vitrine e card de produto.

### 7. Catalogo, busca e categorias

- [ ] Implementar rota `/products`.
- [ ] Implementar campo de busca usando query `searchword`.
- [ ] Implementar filtro por categoria usando `GET /api/v1/categoria`.
- [ ] Integrar listagem por categoria com
      `GET /api/v1/produto/categoria/{categoriaId}`.
- [ ] Refletir pagina, tamanho e total de itens retornados pelo backend.
- [ ] Preservar filtros e busca na URL.
- [ ] Implementar estados de resultado vazio e erro recuperavel.
- [ ] Criar testes de integracao para busca e filtro por categoria.

### 8. Detalhe do produto

- [ ] Implementar rota `/products/:id`.
- [ ] Integrar `GET /api/v1/produto/{id}`.
- [ ] Exibir imagem, titulo, descricao, modelo, categoria, preco e estoque.
- [ ] Exibir CTA de comprar agora e adicionar ao carrinho.
- [ ] Tratar produto indisponivel ou sem estoque.
- [ ] Redirecionar usuarios nao autenticados para login ao iniciar compra.
- [ ] Criar testes de componente e fluxo para detalhe de produto.

### 9. Carrinho

- [ ] Criar store de dominio `Cart` com NgRx SignalStore.
- [ ] Implementar criacao automatica de carrinho quando necessario.
- [ ] Integrar `POST /api/v1/carrinho/criar`.
- [ ] Integrar `GET /api/v1/carrinho/{carrinhoId}`.
- [ ] Integrar `POST /api/v1/carrinho/items` sem enviar `carrinhoId`.
- [ ] Integrar `PATCH /api/v1/carrinho/items/{itemId}` para quantidade.
- [ ] Integrar `DELETE /api/v1/carrinho/items/{itemId}` para remocao.
- [ ] Implementar rota `/cart`.
- [ ] Implementar componentes `CartButton`, `CartItem`, `CartSummary` e
      `QuantitySelector`.
- [ ] Manter resumo de valores consistente apos alteracoes.
- [ ] Criar testes unitarios da store e testes de fluxo do carrinho.

### 10. Checkout

- [ ] Implementar rota protegida de checkout.
- [ ] Reutilizar dados do carrinho ativo.
- [ ] Carregar perfil do cliente para preencher endereco base.
- [ ] Permitir edicao explicita de `enderecoEntrega` no checkout.
- [ ] Implementar selecao de `formaPagamento`.
- [ ] Integrar `POST /api/v1/pedido`.
- [ ] Enviar somente os campos suportados pelo backend atual.
- [ ] Tratar sucesso com confirmacao do pedido.
- [ ] Tratar erro de carrinho vazio, produto indisponivel e falha de validacao.
- [ ] Criar teste end-to-end do fluxo adicionar ao carrinho e finalizar pedido.

### 11. Area do cliente

- [ ] Criar store de dominio `Customer` com NgRx SignalStore.
- [ ] Implementar rota `/account`.
- [ ] Implementar rota `/account/profile`.
- [ ] Integrar `GET /api/v1/cliente/{clienteId}`.
- [ ] Integrar `PUT /api/v1/cliente/{clienteId}`.
- [ ] Integrar `DELETE /api/v1/cliente/{clienteId}` para cancelamento de conta.
- [ ] Implementar menu lateral no desktop e navegacao simples no mobile.
- [ ] Criar formulario de perfil com validacao por schema.
- [ ] Criar confirmacao explicita antes de cancelar conta.
- [ ] Criar testes de componente e integracao da area do cliente.

### 12. Alteracao de senha

- [ ] Implementar rota `/account/password`.
- [ ] Criar formulario com senha atual, nova senha e confirmacao.
- [ ] Aplicar validacoes por schema.
- [ ] Integrar `PUT /api/v1/cliente/{clienteId}/senha`.
- [ ] Exibir estados de sucesso, erro de validacao e erro de senha atual.
- [ ] Criar testes do formulario de alteracao de senha.

### 13. Pedidos

- [ ] Criar store de dominio `Checkout` ou `Orders`, conforme organizacao final.
- [ ] Implementar rota `/account/orders`.
- [ ] Antes da listagem, garantir que o perfil do cliente com `cpf` foi
      carregado.
- [ ] Integrar `GET /api/v1/pedido?cpf={cpf}&page=&size=`.
- [ ] Implementar filtros opcionais por `dataInicio` e `dataFim`.
- [ ] Implementar detalhe de pedido com `GET /api/v1/pedido/{pedidoId}`.
- [ ] Implementar cancelamento com `PATCH /api/v1/pedido/{pedidoId}` enviando
      `status: "Cancelado"`.
- [ ] Exibir status com `OrderStatusBadge`.
- [ ] Criar testes de listagem, detalhe e cancelamento de pedido.

### 14. Roteamento e stores de dominio

- [ ] Definir rotas publicas: `/`, `/login`, `/products`, `/products/:id` e
      cadastro.
- [ ] Definir rotas protegidas: `/cart`, checkout, `/account`,
      `/account/profile`, `/account/password` e `/account/orders`.
- [ ] Criar stores por dominio: `Auth`, `Cart`, `Catalog`, `Customer` e
      `Checkout`.
- [ ] Garantir que stores nao dupliquem normalizacao de envelope HTTP.
- [ ] Garantir redirecionamentos coerentes apos login, logout e expiracao de
      sessao.
- [ ] Criar testes unitarios dos reducers/actions/metodos de store.

### 15. Acessibilidade, responsividade e qualidade visual

- [ ] Validar navegacao por teclado nos fluxos principais.
- [ ] Garantir labels, descricoes de erro e foco visivel nos formularios.
- [ ] Garantir contraste adequado para tokens do tema.
- [ ] Validar layout em mobile pequeno, mobile grande, tablet e desktop.
- [ ] Evitar sobreposicao de textos e componentes em breakpoints suportados.
- [ ] Garantir que botoes e alvos de toque sejam confortaveis no mobile.
- [ ] Revisar consistencia visual com `docs/frontend-specs.md`.

### 16. Testes end-to-end e aceite

- [ ] Criar e2e para catalogo publico sem autenticacao.
- [ ] Criar e2e para login e acesso a rota protegida.
- [ ] Criar e2e para cadastro de cliente.
- [ ] Criar e2e para busca textual e filtro por categoria.
- [ ] Criar e2e para detalhe do produto e adicionar ao carrinho.
- [ ] Criar e2e para alterar quantidade e remover item do carrinho.
- [ ] Criar e2e para checkout com criacao de pedido.
- [ ] Criar e2e para area do cliente e alteracao de senha.
- [ ] Criar e2e para listagem, detalhe e cancelamento de pedido.
- [ ] Garantir que `lint`, `test`, `build` e `e2e` passam antes da entrega.

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
