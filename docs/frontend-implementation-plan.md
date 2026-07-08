# Plano de implementação do frontend da Shop API

**Tipo de conteúdo:** Reference

Este plano traduz `docs/frontend-specs.md` em tarefas de implementação para o frontend em `/frontend`, agora alinhado com o backend v1 realmente exposto em `aspnet-api`. Ele separa o que já pode ser entregue com as rotas atuais do backend, o que depende de decisões de UX por causa das restrições atuais da API e o que ainda continua como `future`.

## Objetivo

Entregar uma loja virtual mobile first, com base visual consistente, navegação clara e fluxos completos para autenticação, catálogo, produto, carrinho, checkout e área do cliente, sem assumir capacidades que o backend ainda não oferece.

## Público

Este plano é para a implementação do frontend e para a coordenação com o backend. Ele também serve como base para dividir entregas entre UI, integração e testes.

## Escopo do backend disponível

As rotas atuais do backend v1 cobrem estes fluxos:

### Públicas

- `POST /api/v1/auth/login`
- `POST /api/v1/cliente`

### Protegidas por `Authorization: Bearer <token>`

- `POST /api/v1/auth/logout`
- `GET /api/v1/produto?searchword=&page=&size=`
- `GET /api/v1/produto/categoria/{categoriaId}?page=&size=`
- `GET /api/v1/produto/{id}`
- `GET /api/v1/cliente/{clienteId}`
- `GET /api/v1/cliente/cpf/{cpf}`
- `PUT /api/v1/cliente/{clienteId}`
- `PUT /api/v1/cliente/{clienteId}/senha`
- `DELETE /api/v1/cliente/{clienteId}`
- `GET /api/v1/carrinho/{carrinhoId}`
- `POST /api/v1/carrinho/criar`
- `POST /api/v1/carrinho/items`
- `PATCH /api/v1/carrinho/items/{itemId}`
- `DELETE /api/v1/carrinho/items/{itemId}`
- `POST /api/v1/pedido`
- `GET /api/v1/pedido?cpf={cpf}&dataInicio={dataInicio}&dataFim={dataFim}&page=&size=`
- `GET /api/v1/pedido/{pedidoId}`
- `PATCH /api/v1/pedido/{pedidoId}`

## Leitura prática do backend atual

O frontend precisa considerar estas regras de integração desde o começo:

- O catálogo e o detalhe do produto exigem autenticação. A home pública com vitrine real ainda não é suportada pelo backend atual.
- Busca textual já existe em `GET /api/v1/produto` via `searchword`.
- Filtro por categoria já existe em `GET /api/v1/produto/categoria/{categoriaId}`, mas não existe endpoint para listar categorias.
- A categoria vem embutida nas respostas de produto. Isso permite navegação derivada no frontend, mas não um menu de categorias realmente administrável.
- Alteração de senha já existe em `PUT /api/v1/cliente/{clienteId}/senha`.
- `GET /api/v1/pedido` exige `cpf` na query. O frontend precisa obter esse valor do perfil do cliente antes de listar pedidos.
- `POST /api/v1/carrinho/items` não recebe `carrinhoId`. O backend resolve o carrinho pelo `clienteId` autenticado.
- `POST /api/v1/carrinho/criar` ainda exige `clienteId` no payload, mesmo com usuário autenticado.
- Não existe endpoint dedicado para múltiplos endereços salvos. Hoje o endereço do cliente fica embutido no recurso de cliente e o pedido recebe `enderecoEntrega` no payload.

## Mapa de implementação

| Area | Entrega | Rota do backend | Status |
| --- | --- | --- | --- |
| Base visual | Tema Tailwind 4, tokens de cor, tipografia, grid, estados vazios e skeletons | Não depende de rota | now |
| Layout global | Header mobile, header desktop, footer e navegação inferior mobile | Não depende de rota | now |
| Autenticação | Login, logout, persistência de token, guard e interceptor | `POST /api/v1/auth/login`, `POST /api/v1/auth/logout` | now |
| Cadastro de cliente | Tela de criação de conta | `POST /api/v1/cliente` | now |
| Home autenticada | Banner, atalhos e vitrine de produtos após login | `GET /api/v1/produto` | now |
| Busca no catálogo | Campo de busca com `searchword` | `GET /api/v1/produto?searchword={searchword}` | now |
| Categorias derivadas | Chips e atalhos a partir das categorias presentes nos produtos | `GET /api/v1/produto/categoria/{categoriaId}` | now-with-constraint |
| Produto | Página de detalhes, preço, estoque e CTA de compra | `GET /api/v1/produto/{id}` | now |
| Carrinho | Lista de itens, ajuste de quantidade, remoção e resumo | `GET /api/v1/carrinho/{carrinhoId}`, `POST /api/v1/carrinho/criar`, `POST /api/v1/carrinho/items`, `PATCH /api/v1/carrinho/items/{itemId}`, `DELETE /api/v1/carrinho/items/{itemId}` | now |
| Checkout | Criação do pedido a partir do carrinho | `POST /api/v1/pedido` | now |
| Área do cliente | Dados pessoais, edição, exclusão e resumo da conta | `GET /api/v1/cliente/{clienteId}`, `PUT /api/v1/cliente/{clienteId}`, `DELETE /api/v1/cliente/{clienteId}` | now |
| Alterar senha | Formulário e fluxo de troca de senha | `PUT /api/v1/cliente/{clienteId}/senha` | now |
| Meus pedidos | Lista de pedidos, detalhe e cancelamento | `GET /api/v1/pedido`, `GET /api/v1/pedido/{pedidoId}`, `PATCH /api/v1/pedido/{pedidoId}` | now |
| Endereços salvos | Gestão dedicada de múltiplos endereços | Não existe rota dedicada | future |
| Ofertas e promoções | Blocos promocionais dinâmicos e campanhas | Não existe rota específica de ofertas | future |
| Categorias administráveis | Menu de categorias vindo de recurso próprio | Não existe rota dedicada de categorias | future |

## Fase 1: fundação do frontend

Entregue primeiro a base técnica e visual.

- Criar o projeto Angular 22+ em `/frontend`
- Configurar Tailwind CSS v4, Angular CDK e estrutura de tema global
- Definir tokens de cor, espaçamento e estados do design system
- Criar `AppShell`, `PageContainer`, `Header`, `MobileBottomNavigation` e `Footer`
- Centralizar o cliente HTTP, o tratamento de erro e o armazenamento do token
- Implementar `AuthService`, `AuthGuard`, `HttpInterceptor` e `TokenStorageService`
- Definir rotas protegidas e redirecionamentos básicos
- Cobrir a base com testes unitários e testes de integração de componentes

## Fase 2: fluxos suportados pelo backend atual

Entregue as telas e integrações que já têm contrato pronto.

- Implementar a tela de login com validação por schema e estado de erro
- Implementar o cadastro de cliente como criação de conta pública
- Implementar a home autenticada consumindo `GET /api/v1/produto`
- Implementar busca textual no catálogo usando `searchword`
- Implementar navegação por categoria com base em `categoriaId` conhecido
- Construir a página de detalhes do produto
- Construir o carrinho com criação automática quando necessário, atualização de quantidade e remoção de item
- Construir o checkout com criação do pedido
- Construir a área do cliente com edição de dados, alteração de senha e listagem de pedidos
- Integrar todos os fluxos com estados de carregamento, vazio, sucesso e erro

## Fase 3: tarefas marcadas como future

Estas entregas continuam planejadas no frontend, mas dependem de novas rotas ou de expansão do modelo atual do backend.

- Home pública com catálogo real sem exigir login
- Recurso dedicado para listar e ordenar categorias
- Blocos promocionais, campanhas e ofertas relâmpago orientadas por API
- Gestão dedicada de múltiplos endereços salvos
- Recursos de curadoria comercial como coleções, vitrines temáticas e destaques sazonais

## Decisões de integração

- Usar `clienteId`, `usuarioId`, `email`, `token` e `expiraEm` vindos do login para montar a sessão do frontend
- Tratar catálogo, produto, carrinho, pedidos e conta como áreas autenticadas enquanto o backend exigir token nessas rotas
- Buscar os dados do cliente autenticado cedo no fluxo para recuperar o `cpf` necessário na listagem de pedidos
- Derivar categorias a partir dos produtos retornados até existir um recurso próprio de categorias
- Ao adicionar item ao carrinho, não enviar `carrinhoId`; o backend associa o item ao carrinho do cliente autenticado
- Manter o frontend preparado para migrar de bearer token para cookie `HttpOnly` se o backend evoluir esse fluxo

## Critérios de aceite

- O layout segue mobile first e se adapta ao desktop
- O login autentica e protege as rotas privadas
- O cadastro de cliente cria conta sem autenticação prévia
- O catálogo autenticado abre a partir da rota de produtos
- A busca textual usa `searchword` e reflete paginação do backend
- O filtro por categoria funciona quando o frontend já conhece o `categoriaId`
- O detalhe do produto abre por `produtoId`
- O carrinho altera itens sem quebrar o resumo
- O checkout cria pedido com os dados do carrinho e do cliente
- A área do cliente mostra dados reais, permite alterar senha e lista pedidos reais
- As tarefas `future` aparecem documentadas e não bloqueiam a entrega inicial

## Perguntas em aberto

- O catálogo precisa continuar autenticado na primeira versão pública do produto, ou o backend vai liberar leitura pública de produtos?
- O backend vai expor um recurso dedicado para listar categorias, ou o frontend deve manter a derivação local por mais tempo?
- `POST /api/v1/carrinho/criar` vai continuar exigindo `clienteId` no payload mesmo com sessão autenticada?
- O backend vai suportar múltiplos endereços salvos antes da primeira versão pública?
