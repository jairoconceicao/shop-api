# Tasks do Redesign do Frontend

Baseado em [`docs/frontend-redesign-plan.md`](./frontend-redesign-plan.md) e
focado exclusivamente no frontend existente em `frontend/`.

O objetivo desta lista e transformar a interface atual no novo layout comercial
sem reescrever a aplicacao do zero, preservando os contratos ja disponiveis da
API.

## Frontend

### Fase 1. Fundacao visual e design system

- [x] [T-001] Mapear os tokens visuais do redesign para as variaveis globais do
  Tailwind.
- [x] [T-002] Ajustar cores base de fundo, superficie, texto, borda e destaque
  para a nova identidade.
- [x] [T-003] Revisar tipografia global, pesos, alturas de linha e escalas de
  titulo e corpo.
- [x] [T-004] Padronizar espacamento e densidade dos containers principais.
- [x] [T-005] Revisar radius, sombra e focus ring dos componentes base.
- [x] [T-006] Atualizar `Button` para suportar estados comerciais como destaque,
  outline e loading.
- [x] [T-007] Atualizar `Input`, `Select` e `Checkbox` para a nova linguagem
  visual.
- [x] [T-008] Revisar `Card`, `Badge` e elementos de preco para a vitrine e
  paginas de detalhe.
- [x] [T-009] Consolidar estados globais de loading, vazio, erro e sucesso para
  uso consistente nas telas.
- [x] [T-010] Validar comportamento mobile first para todos os componentes
  reutilizaveis.

### Fase 2. Shell da aplicacao e navegacao

- [x] [T-011] Reestruturar `AppLayout` para refletir o header comercial do
  redesign.
- [x] [T-012] Criar header mobile com logo, busca e acesso rapido ao carrinho.
- [x] [T-013] Criar header desktop com busca central, entrada de conta e
  carrinho.
- [x] [T-014] Incluir faixa superior ou banner de destaque comercial no shell.
- [x] [T-015] Adicionar navegacao inferior no mobile.
- [x] [T-016] Padronizar breadcrumbs, links e CTAs globais para a nova
  nomenclatura.
- [x] [T-017] Garantir que `ToastViewport` e os feedbacks globais permaneçam
  acessiveis.
- [x] [T-018] Criar redirects e aliases entre rotas antigas e novas durante a
  migracao.
- [x] [T-019] Atualizar estados de rota ativa e de navegacao contextual no
  layout.

### Fase 3. Home e catalogo

- [x] [T-020] Transformar a rota `/` em home comercial com banner principal.
- [x] [T-021] Criar bloco de ofertas em destaque para a home.
- [x] [T-022] Criar bloco de categorias em destaque para a home.
- [x] [T-023] Criar bloco de produtos em destaque para a home.
- [ ] [T-024] Reaproveitar a listagem paginada atual como base do catalogo em
  `/products`.
- [ ] [T-025] Refatorar `ProductCard` para exibir imagem, nome e preco de forma
  mais comercial.
- [ ] [T-026] Adicionar avaliacao visual, parcelamento e frete gratis ao
  `ProductCard`.
- [ ] [T-027] Adicionar CTA de compra e navegacao consistente ao card de
  produto.
- [ ] [T-028] Ajustar filtros, busca e paginação para uma navegacao simples no
  mobile.
- [ ] [T-029] Atualizar breadcrumbs, CTAs e links internos para a nova
  nomenclatura de rotas.
- [ ] [T-030] Revisar estados vazios e erros da listagem para refletir o novo
  layout.

### Fase 4. Pagina de produto

- [ ] [T-031] Reorganizar o detalhe do produto em duas colunas no desktop e
  fluxo empilhado no mobile.
- [ ] [T-032] Destacar imagem principal e galeria do produto.
- [ ] [T-033] Destacar preco, parcelamento e disponibilidade de compra.
- [ ] [T-034] Destacar CTAs de compra, quantidade e acao primaria no topo da
  pagina.
- [ ] [T-035] Melhorar a hierarquia visual de breadcrumb, avaliacao e
  informacoes complementares.
- [ ] [T-036] Incluir secoes de especificacoes tecnicas e conteudos de apoio.
- [ ] [T-037] Incluir blocos de confianca e informacoes auxiliares da compra.
- [ ] [T-038] Revisar estados de carregamento, vazio e erro do detalhe do
  produto.

### Fase 5. Carrinho e checkout

- [ ] [T-039] Refatorar a tela de carrinho para um layout mais visual e
  objetivo.
- [ ] [T-040] Melhorar exibicao de itens com imagem, nome, preco e subtotal.
- [ ] [T-041] Manter edicao de quantidade com interacao clara e responsiva.
- [ ] [T-042] Manter remocao de item com confirmacao visual adequada.
- [ ] [T-043] Reforcar o resumo de valores com melhor hierarquia visual.
- [ ] [T-044] Garantir resumo sempre visivel no desktop para carrinho e
  checkout.
- [ ] [T-045] Reestruturar o checkout com stepper de progresso.
- [ ] [T-046] Organizar o checkout em endereco de entrega, pagamento e resumo
  fixo.
- [ ] [T-047] Validar que o fluxo continue usando os endpoints existentes de
  carrinho e pedido.
- [ ] [T-048] Revisar estados de erro e recuperacao no fluxo de finalizacao.

### Fase 6. Conta e pedidos

- [ ] [T-049] Reorganizar a area do cliente em um hub com menu lateral ou
  cards de atalho.
- [ ] [T-050] Criar resumo visual da conta com status e ultimas atividades.
- [ ] [T-051] Reutilizar o fluxo atual de cliente na rota `/account/profile`.
- [ ] [T-052] Revisar a edicao de dados do cliente para o novo layout.
- [ ] [T-053] Reaproveitar a listagem de pedidos para `/account/orders`.
- [ ] [T-054] Reestruturar a exibicao da lista de pedidos com melhor
  escaneabilidade.
- [ ] [T-055] Reestruturar a pagina de detalhe do pedido com mais hierarquia
  visual.
- [ ] [T-056] Exibir logout e status da conta com visual mais comercial.

### Fase 7. Qualidade, acessibilidade e validacao

- [ ] [T-057] Validar consistencia mobile first em todas as telas do redesign.
- [ ] [T-058] Revisar contraste, foco e acessibilidade visual em componentes e
  paginas.
- [ ] [T-059] Revisar telas vazias, erros de API e feedback visual para todos
  os fluxos principais.
- [ ] [T-060] Cobrir os fluxos principais com testes apos a refatoracao.
- [ ] [T-061] Validar consistencia entre rotas antigas e novas durante a
  migracao.

## Tasks Future

As sugestoes abaixo nao possuem rota ou contrato de backend correspondente
hoje e devem ficar como `future`.

- [ ] [T-062][future] Implementar troca de senha em `/account/password`.
- [ ] [T-063][future] Implementar busca global com autocomplete server-side para
  o catalogo.
- [ ] [T-064][future] Implementar menu real de categorias com origem em backend.
- [ ] [T-065][future] Implementar banner promocional e ofertas dinamicas com
  origem em backend.
- [ ] [T-066][future] Implementar avaliacoes, reviews e nota agregada do
  produto.
- [ ] [T-067][future] Implementar estimativa de frete e prazo de entrega por
  CEP.
- [ ] [T-068][future] Implementar gerenciamento separado de enderecos salvos.

## Ordem Sugerida De Entrega

1. [T-001] a [T-010] Fundacao visual e design system.
2. [T-011] a [T-019] Shell da aplicacao e navegacao.
3. [T-020] a [T-030] Home e catalogo.
4. [T-031] a [T-038] Pagina de produto.
5. [T-039] a [T-048] Carrinho e checkout.
6. [T-049] a [T-056] Conta e pedidos.
7. [T-057] a [T-061] Qualidade, acessibilidade e validacao.
8. [T-062] a [T-068] Itens future.

## Critério De Conclusao

O conjunto de tasks fica concluido quando:

- A interface refletir a proposta visual do redesign.
- As rotas principais estiverem alinhadas com a experiencia descrita.
- Os fluxos existentes continuarem funcionando com os contratos atuais da API.
- As sugestoes sem suporte de backend estiverem explicitamente registradas como
  `future`.

