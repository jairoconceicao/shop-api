# Plano de Implementação do Frontend

## Resumo

Este plano cobre a criação de um frontend SPA para o `shop-api` com base em
[`openapi.yaml`](../openapi.yaml) e em [`docs/api-reference.md`](./api-reference.md).

Como não existe frontend ainda no repositório, o trabalho parte do zero e deve
ser organizado como um app separado, seguindo as diretrizes do `AGENTS.md`:
React, Tailwind CSS v4, Zod e Zustand.

O foco principal é a jornada de compra do cliente, com suporte também para
consulta de cliente e pedidos, pois esses fluxos já existem no contrato da API.

## Escopo Funcional

- Autenticação: login e logout.
- Catálogo: listagem paginada de produtos e detalhe de produto.
- Carrinho: criação de carrinho, inclusão, alteração e remoção de itens.
- Checkout: criação de pedido a partir do carrinho.
- Pedidos: consulta por ID, listagem por CPF e cancelamento.
- Cliente: cadastro, consulta, atualização e exclusão de conta.

## Estrutura Proposta

- Criar o app em `frontend/` como SPA sem SSR.
- Organizar por feature, com separação por contexto de negócio:
  - `auth`
  - `catalog`
  - `cart`
  - `checkout`
  - `orders`
  - `customer`
- Criar uma camada de integração HTTP única para consumir o contrato OpenAPI.
- Criar um conjunto de componentes de UI reutilizáveis em Tailwind.
- Definir estado global com Zustand apenas para dados realmente compartilhados.
- Validar formulários e payloads com Zod, antes de enviar para a API.

## Mapeamento da API

O frontend deve cobrir os endpoints abaixo:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/cliente`
- `GET /api/v1/cliente/{clienteId}`
- `GET /api/v1/cliente/cpf/{cpf}`
- `PUT /api/v1/cliente/{clienteId}`
- `DELETE /api/v1/cliente/{clienteId}`
- `GET /api/v1/produto`
- `GET /api/v1/produto/{id}`
- `GET /api/v1/carrinho/{carrinhoId}`
- `POST /api/v1/carrinho/criar`
- `POST /api/v1/carrinho/items`
- `PATCH /api/v1/carrinho/items/{itemId}`
- `DELETE /api/v1/carrinho/items/{itemId}`
- `POST /api/v1/pedido`
- `GET /api/v1/pedido`
- `GET /api/v1/pedido/{pedidoId}`
- `PATCH /api/v1/pedido/{pedidoId}`

## Navegação

Rotas iniciais sugeridas:

- `/login`
- `/cadastro`
- `/catalogo`
- `/produto/:id`
- `/carrinho`
- `/checkout`
- `/pedidos`
- `/pedidos/:id`
- `/cliente`

## Regras de UI

- A identidade visual deve seguir uma linha de e-commerce popular.
- Usar a paleta `spanish-green` definida no `AGENTS.md`.
- Priorizar componentes claros, com contraste alto e bom estado de foco.
- Tratar carregamento, vazio, erro e sucesso como estados explícitos de UI.
- Renderizar enums da API em textos amigáveis:
  - `FormaPagamento`
  - `PedidoStatus`

## Camada de Dados

- Implementar um client HTTP com:
  - base URL configurável para o backend local.
  - suporte ao token JWT via `Authorization: Bearer`.
  - tratamento consistente de `ApiResponse<T>`, `PagedResponse<T>` e `ApiErrorResponse`.
- Normalizar datas em ISO 8601.
- Centralizar parsing de erros para exibir mensagens previsíveis ao usuário.
- Evitar espalhar lógica de contrato dentro dos componentes.

## Estado e Validação

- `Zustand` para:
  - sessão do usuário.
  - token JWT.
  - carrinho atual.
  - filtros de catálogo e pedidos.
  - estado de UI compartilhado.
- `Zod` para:
  - login.
  - cadastro e atualização de cliente.
  - manipulação de item de carrinho.
  - criação de pedido.
  - filtros de busca de pedidos.

## Design System

Criar uma base mínima de componentes reutilizáveis:

- `Button`
- `Input`
- `Select`
- `Checkbox`
- `Modal`
- `Toast`
- `Card`
- `Badge`
- `Pagination`
- `Skeleton`
- `EmptyState`
- `Stepper`

## Ordem de Entrega

1. Criar o esqueleto do app e a configuração base do projeto.
2. Implementar layout, tema e componentes de UI básicos.
3. Implementar autenticação e proteção de rotas.
4. Implementar catálogo e detalhe de produto.
5. Implementar carrinho e checkout.
6. Implementar pedidos.
7. Implementar cliente.
8. Adicionar testes unitários, de integração e E2E dos fluxos críticos.

## Plano de Testes

- Testes unitários de schemas Zod.
- Testes de stores Zustand.
- Testes do client HTTP e do mapeamento dos envelopes da API.
- Testes E2E dos fluxos:
  - login.
  - navegação no catálogo.
  - adicionar item ao carrinho.
  - finalizar pedido.
  - consultar pedido.
  - cadastrar e atualizar cliente.

## Assumptions

- O frontend será customer-facing por padrão, com suporte a consulta de cliente e
  pedidos por CPF porque isso já está exposto no OpenAPI.
- O app será novo e separado da API, sem reaproveitar estrutura existente.
- A persistência inicial do login será local, com proteção de rotas no cliente.
- O backend permanece como fonte de verdade para regras de negócio e validações
  definitivas.
