# Plano de implementação do frontend da Shop API

**Tipo de conteúdo:** Reference

Este plano traduz `docs/frontend-specs.md` em tarefas de implementação para o frontend em `/frontend`. Ele separa o que já pode ser entregue com as rotas atuais do backend e o que depende de novas rotas, marcado como `future`.

## Objetivo

Entregar uma loja virtual mobile first, com base visual consistente, navegação clara e fluxos completos para login, catálogo, produto, carrinho, checkout e área do cliente.

## Público

Este plano é para a implementação do frontend e para a coordenação com o backend. Ele também serve como base para dividir entregas entre UI, integração e testes.

## Escopo do backend disponível

As rotas atuais do backend cobrem estes fluxos:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/produto`
- `GET /api/v1/produto/{id}`
- `POST /api/v1/cliente`
- `GET /api/v1/cliente/{clienteId}`
- `GET /api/v1/cliente/cpf/{cpf}`
- `PUT /api/v1/cliente/{clienteId}`
- `DELETE /api/v1/cliente/{clienteId}`
- `GET /api/v1/carrinho/{carrinhoId}`
- `POST /api/v1/carrinho/criar`
- `POST /api/v1/carrinho/items`
- `PATCH /api/v1/carrinho/items/{itemId}`
- `DELETE /api/v1/carrinho/items/{itemId}`
- `POST /api/v1/pedido`
- `GET /api/v1/pedido`
- `GET /api/v1/pedido/{pedidoId}`
- `PATCH /api/v1/pedido/{pedidoId}`

## Mapa de implementação

| Area | Entrega | Rota do backend | Status |
| --- | --- | --- | --- |
| Base visual | Tema Tailwind 4, tokens de cor, tipografia, grid, estados vazios e skeletons | Não depende de rota | now |
| Layout global | Header mobile, header desktop, footer e navegação inferior mobile | Não depende de rota | now |
| Autenticação | Login, logout, persistência de token, guard e interceptor | `POST /api/v1/auth/login`, `POST /api/v1/auth/logout` | now |
| Cadastro de cliente | Tela de criação de conta a partir do login | `POST /api/v1/cliente` | now |
| Home | Banner, catálogo em destaque, vitrine de produtos e cards | `GET /api/v1/produto` | now |
| Busca na home | Campo de busca com filtro de catálogo | Não existe rota de busca | future |
| Categorias | Chips, menu e navegação por categoria | Não existe rota de categorias | future |
| Produto | Página de detalhes, galeria, preço, estoque e CTA de compra | `GET /api/v1/produto/{id}` | now |
| Carrinho | Lista de itens, ajuste de quantidade, remoção e resumo | `GET /api/v1/carrinho/{carrinhoId}`, `POST /api/v1/carrinho/criar`, `POST /api/v1/carrinho/items`, `PATCH /api/v1/carrinho/items/{itemId}`, `DELETE /api/v1/carrinho/items/{itemId}` | now |
| Checkout | Criação do pedido a partir do carrinho | `POST /api/v1/pedido` | now |
| Área do cliente | Dados pessoais, edição, exclusão e resumo da conta | `GET /api/v1/cliente/{clienteId}`, `PUT /api/v1/cliente/{clienteId}`, `DELETE /api/v1/cliente/{clienteId}` | now |
| Meus pedidos | Lista de pedidos, detalhe e cancelamento | `GET /api/v1/pedido`, `GET /api/v1/pedido/{pedidoId}`, `PATCH /api/v1/pedido/{pedidoId}` | now |
| Alterar senha | Formulário e fluxo de troca de senha | Não existe rota de senha | future |
| Endereços | Gestão dedicada de endereços salvos | Não existe rota dedicada de endereços | future |
| Ofertas e promoções | Blocos promocionais dinâmicos e campanhas | Não existe rota específica de ofertas | future |

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

Entregue as telas que já têm contrato pronto.

- Implementar a tela de login com validação por schema e estado de erro
- Implementar o cadastro de cliente como caminho de criação de conta
- Construir a home com banner, catálogo e cards de produto
- Construir a página de detalhes do produto
- Construir o carrinho com atualização de quantidade e remoção de item
- Construir o checkout com criação do pedido
- Construir a área do cliente com edição de dados e listagem de pedidos
- Implementar a navegação entre home, produto, carrinho, conta e pedidos
- Integrar todos os fluxos com estados de carregamento, vazio, sucesso e erro

## Fase 3: tarefas marcadas como future

Estas entregas ficam planejadas no frontend, mas dependem de novas rotas no backend.

- Busca textual no catálogo e filtros avançados
- Navegação por categorias com dados reais
- Blocos promocionais, campanhas e ofertas relâmpago
- Troca de senha com fluxo dedicado
- Gestão dedicada de múltiplos endereços

## Decisões de integração

- Usar o `clienteId` vindo do login para resolver a área do cliente
- Buscar o CPF do cliente quando a tela de pedidos precisar chamar `GET /api/v1/pedido`
- Exibir o campo de busca na home desde o começo, mas manter a funcionalidade completa em `future`
- Exibir categorias como navegação visual desde o começo, mas sem prometer dados dinâmicos antes da rota existir
- Preferir cookie `HttpOnly` para autenticação quando o backend suportar o fluxo completo

## Critérios de aceite

- O layout segue mobile first e se adapta ao desktop
- O login autentica e protege rotas privadas
- O catálogo abre a partir da rota de produtos
- O detalhe do produto abre por `produtoId`
- O carrinho altera itens sem quebrar o resumo
- O checkout cria pedido com os dados do carrinho e do cliente
- A área do cliente mostra dados reais e pedidos reais
- As tarefas `future` aparecem documentadas e não bloqueiam a entrega inicial

## Perguntas em aberto

- A home vai usar busca server side ou filtro local até a rota existir?
- O backend vai expor categorias, ou o frontend precisa derivar isso de uma fonte estática?
- O fluxo de senha vai entrar no mesmo domínio de clientes ou em um recurso próprio?
- O backend vai suportar múltiplos endereços antes da primeira versão pública?
