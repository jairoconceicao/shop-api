# Plano de implementação do frontend da Shop API

**Tipo de conteúdo:** Reference

Este plano traduz `docs/frontend-specs.md` em tarefas de implementação para o frontend em `/frontend`, agora alinhado com o backend v1 realmente exposto em `aspnet-api` em 2026-07-08. O código dos endpoints e os contratos em `aspnet-api/src/Api` foram tratados como fonte de verdade prática para o frontend.

## Objetivo

Entregar uma loja virtual mobile first, com base visual consistente, navegação clara e fluxos completos para autenticação, catálogo, produto, carrinho, checkout e área do cliente, sem assumir capacidades que o backend ainda não oferece.

## Público

Este plano é para a implementação do frontend e para a coordenação com o backend. Ele também serve como base para dividir entregas entre UI, integração e testes.

## Escopo do backend disponível

As rotas atuais do backend v1 cobrem estes fluxos.

### Públicas

- `POST /api/v1/auth/login`
- `POST /api/v1/cliente`
- `GET /api/v1/produto?searchword=&page=&size=`
- `GET /api/v1/produto/categoria/{categoriaId}?page=&size=`
- `GET /api/v1/produto/{id}`

### Protegidas por `Authorization: Bearer <token>`

- `POST /api/v1/auth/logout`
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

O frontend precisa considerar estas regras de integração desde o começo.

- O catálogo, a busca por texto, a navegação por categoria e o detalhe de produto agora são públicos. A home pública com vitrine real já é suportada pelo backend atual.
- Não existe endpoint dedicado para listar categorias. O frontend consegue navegar por categoria usando `categoriaId`, mas precisa obter as opções a partir dos produtos retornados ou de configuração local.
- Produto de catálogo e detalhe já retornam `categoria` embutida com `id` e `titulo`.
- As respostas paginadas vêm no formato `pagination.data`, com metadados `pages`, `size` e `totalItems`.
- As respostas não paginadas vêm envelopadas em `data`, com `status` e `message` no nível raiz.
- O login retorna `token`, `tipo`, `expiraEm`, `usuarioId`, `clienteId` e `email`. A sessão do frontend deve ser montada com esses campos.
- `GET /api/v1/pedido` exige `cpf` na query. O frontend precisa obter esse valor do perfil do cliente antes de listar pedidos.
- `POST /api/v1/carrinho/items` não recebe `carrinhoId`. O backend resolve o carrinho pelo cliente autenticado, mas o frontend ainda precisa conhecer o `carrinhoId` para consultar o carrinho depois.
- `POST /api/v1/carrinho/criar` ainda exige `clienteId` no payload, mesmo com usuário autenticado.
- `POST /api/v1/pedido` também exige `clienteId` e `carrinhoId` no payload, além de `enderecoEntrega`, `formaPagamento`, `dataPedido` e `items`.
- `PATCH /api/v1/pedido/{pedidoId}` aceita `UpdatePedidoStatusRequest`, mas o validator atual só permite `status = Cancelado`. No frontend, esse endpoint deve ser tratado como ação de cancelamento, não como edição genérica de status.
- Não existe endpoint dedicado para múltiplos endereços salvos. Hoje o endereço do cliente fica embutido no recurso de cliente e o pedido recebe `enderecoEntrega` no payload.

## Mapa de implementação

| Area | Entrega | Rota do backend | Status |
| --- | --- | --- | --- |
| Base visual | Tema Tailwind 4, tokens de cor, tipografia, grid, estados vazios e skeletons | Não depende de rota | now |
| Layout global | Header mobile, header desktop, footer e navegação inferior mobile | Não depende de rota | now |
| Autenticação | Login, logout, persistência de token, guard e interceptor | `POST /api/v1/auth/login`, `POST /api/v1/auth/logout` | now |
| Cadastro de cliente | Tela de criação de conta | `POST /api/v1/cliente` | now |
| Home pública | Banner, atalhos e vitrine usando catálogo aberto | `GET /api/v1/produto` | now |
| Busca no catálogo | Campo de busca com `searchword` | `GET /api/v1/produto?searchword={searchword}` | now |
| Navegação por categoria | Landing e filtros por `categoriaId` conhecido | `GET /api/v1/produto/categoria/{categoriaId}` | now-with-constraint |
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
- Definir rotas públicas, rotas protegidas e redirecionamentos básicos
- Cobrir a base com testes unitários e testes de integração de componentes

## Fase 2: fluxos suportados pelo backend atual

Entregue as telas e integrações que já têm contrato pronto.

- Implementar a home pública consumindo `GET /api/v1/produto`
- Implementar a tela de login com validação por schema e estado de erro
- Implementar o cadastro de cliente como criação de conta pública
- Implementar busca textual no catálogo usando `searchword`
- Implementar navegação por categoria com base em `categoriaId` e categorias embutidas nos produtos
- Construir a página de detalhes do produto
- Construir o carrinho com criação automática quando necessário, atualização de quantidade e remoção de item
- Construir o checkout enviando os campos obrigatórios reais do backend
- Construir a área do cliente com edição de dados, alteração de senha e listagem de pedidos
- Integrar todos os fluxos com estados de carregamento, vazio, sucesso e erro
- Normalizar no frontend os envelopes `data` e `pagination` para evitar tratamento duplicado por tela

## Fase 3: tarefas marcadas como future

Estas entregas continuam planejadas no frontend, mas dependem de novas rotas ou de expansão do modelo atual do backend.

- Recurso dedicado para listar e ordenar categorias
- Blocos promocionais, campanhas e ofertas relâmpago orientadas por API
- Gestão dedicada de múltiplos endereços salvos
- Recursos de curadoria comercial como coleções, vitrines temáticas e destaques sazonais
- Simplificação dos payloads autenticados para eliminar `clienteId` redundante em carrinho e pedido

## Decisões de integração

- Usar `token`, `tipo`, `expiraEm`, `usuarioId`, `clienteId` e `email` vindos do login para montar a sessão do frontend
- Tratar catálogo, categoria e detalhe de produto como áreas públicas
- Tratar carrinho, checkout, conta, logout e pedidos como áreas autenticadas
- Buscar os dados do cliente autenticado cedo no fluxo privado para recuperar o `cpf` necessário na listagem de pedidos
- Derivar opções de categorias a partir dos produtos retornados até existir um recurso próprio de categorias
- Ao adicionar item ao carrinho, não enviar `carrinhoId`; o backend associa o item ao carrinho do cliente autenticado
- Ao criar pedido, enviar `clienteId`, `carrinhoId`, `enderecoEntrega`, `formaPagamento`, `dataPedido` e `items` exatamente como o backend espera hoje
- Tratar `PATCH /pedido/{pedidoId}` como cancelamento explícito, enviando apenas `status: "Cancelado"`
- Manter o frontend preparado para migrar de bearer token para cookie `HttpOnly` se o backend evoluir esse fluxo

## Critérios de aceite

- O layout segue mobile first e se adapta ao desktop
- O catálogo público abre sem autenticação
- O login autentica e protege apenas as rotas privadas
- O cadastro de cliente cria conta sem autenticação prévia
- A busca textual usa `searchword` e reflete paginação do backend
- O filtro por categoria funciona quando o frontend conhece o `categoriaId`
- O detalhe do produto abre por `produtoId`
- O carrinho altera itens sem quebrar o resumo
- O checkout cria pedido com os campos obrigatórios reais do backend atual
- A área do cliente mostra dados reais, permite alterar senha e lista pedidos reais
- O cancelamento de pedido usa `status = Cancelado`
- As tarefas `future` aparecem documentadas e não bloqueiam a entrega inicial

## Perguntas em aberto

- O backend vai expor um recurso dedicado para listar categorias, ou o frontend deve manter a derivação local por mais tempo?
- `POST /api/v1/carrinho/criar` vai continuar exigindo `clienteId` no payload mesmo com sessão autenticada?
- `POST /api/v1/pedido` também vai manter `clienteId` e `carrinhoId` explícitos no payload na próxima versão?
- O backend vai suportar múltiplos endereços salvos antes da primeira versão pública?
- O `openapi.yaml` será atualizado para refletir que os endpoints de produto agora são públicos?
