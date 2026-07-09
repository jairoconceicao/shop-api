# Tarefas de implementacao da API v1

**Tipo de conteudo:** Reference

Este documento transforma `docs/api-reference.md` em uma lista de tarefas de backend para a API v1. A referencia em `docs/api-reference.md` e a fonte da verdade para rotas, envelopes e formatos de request/response.

## Objetivo

Entregar a API v1 com contratos consistentes, validacao, erros padronizados e cobertura de testes para todos os fluxos descritos em `docs/api-reference.md`.

## Escopo

Este plano cobre apenas o backend da API.

Fluxos incluidos na referencia:

- Auth
- Cliente
- Categoria de produtos
- Catalogo de produtos
- Carrinho
- Pedidos

## Premissas de contrato

- Respostas de sucesso usam `ApiResponse<T>` ou `PagedResponse<T>`.
- Respostas de erro usam `ApiErrorResponse`.
- Rotas protegidas exigem `Authorization: Bearer <token>`.
- Datas sao serializadas em ISO 8601.
- Enums sao serializados como string.

## Decisoes de contrato resolvidas antes da implementacao final

- `GET /api/v1/produto/{id}` e `GET /api/v1/produto/categoria/{categoriaId}` permanecem como rotas distintas. A rota por categoria continua paginada e nao conflita com a rota de detalhe por id.
- `GET /api/v1/categoria` permanece como contrato dedicado com `ApiResponse<T[]>`, separado da paginacao do catalogo de produtos.
- `PUT /api/v1/cliente/{clienteId}/senha` usa `clienteId` apenas na rota. O body valido do request contem `senhaAtual` e `senhaNova`.
- Os contratos de produto em catalogo e detalhe expoem `categoria` com shape resumido e consistente: `categoriaId` e `titulo`.
- O contrato de `GET /api/v1/categoria` expoe `categoriaId`, `titulo` e `descricao`.

## Tarefas

### 1. Base de contratos e padroes transversais

- [x] Confirmar e padronizar os contratos compartilhados `ApiResponse<T>`, `PagedResponse<T>` e `ApiErrorResponse`.
- [x] Definir o formato padrao de erros de validacao e de negocio.
- [x] Centralizar o mapeamento de erros de dominio para respostas HTTP.
- [x] Garantir serializacao de enums como string.
- [x] Garantir serializacao de datas em ISO 8601.
- [x] Revisar a estrutura de DTOs em `Contracts/Requests` e `Contracts/Responses`.

### 2. Auth

- [x] Implementar `POST /api/v1/auth/login`.
- [x] Implementar `POST /api/v1/auth/logout`.
- [x] Validar email e senha no login.
- [x] Emitir token, tipo, expiracao e identificadores do usuario no login.
- [x] Registrar e invalidar `jti` no logout.
- [x] Criar testes de contrato para login e logout.

### 3. Cliente

- [x] Implementar `POST /api/v1/cliente` para cadastro.
- [x] Implementar `GET /api/v1/cliente/{clienteId}`.
- [x] Implementar `GET /api/v1/cliente/cpf/{cpf}`.
- [x] Implementar `PUT /api/v1/cliente/{clienteId}` para atualizacao cadastral.
- [x] Implementar `DELETE /api/v1/cliente/{clienteId}` para cancelamento de conta.
- [x] Implementar `PUT /api/v1/cliente/{clienteId}/senha` para troca de senha.
- [x] Validar CPF, email, data de nascimento, endereco e celular.
- [x] Garantir que a criacao e a atualizacao retornem apenas o contrato previsto na referencia.
- [x] Cobrir os casos de cliente com testes unitarios e de integracao.

### 4. Catalogo de produtos

- [x] Implementar `GET /api/v1/categoria` para carregamento da lista de categorias.
- [x] Garantir que a resposta de categoria use `ApiResponse<T>` com uma colecao em `data`.
- [x] Cobrir a consulta de categorias com testes de integracao.

- [x] Implementar `GET /api/v1/produto` com paginação.
- [x] Implementar `GET /api/v1/produto/{id}` para detalhe do produto.
- [x] Implementar `GET /api/v1/produto/categoria/{categoriaId}` para listagem de produtos por categoria.
- [x] Implementar busca textual por `searchword` no catalogo.
- [x] Expor `categoria` nos contratos de listagem e detalhe de produto.
- [x] Garantir que a paginação responda com `pages`, `size`, `totalItems` e `data`.
- [x] Cobrir filtros e mapeamento do catalogo com testes de integracao.

### 5. Carrinho

- [x] Implementar `GET /api/v1/carrinho/{carrinhoId}`.
- [x] Implementar `POST /api/v1/carrinho/criar`.
- [x] Implementar `POST /api/v1/carrinho/items`.
- [x] Implementar `PATCH /api/v1/carrinho/items/{itemId}`.
- [x] Implementar `DELETE /api/v1/carrinho/items/{itemId}`.
- [x] Validar produto, quantidade e valor unitario ao manipular itens.
- [x] Garantir que as respostas de carrinho e item sigam os contratos da referencia.
- [x] Cobrir o fluxo completo do carrinho com testes de integracao.

### 6. Pedidos

- [x] Implementar `POST /api/v1/pedido`.
- [x] Implementar `GET /api/v1/pedido` com filtros `cpf`, `dataInicio`, `dataFim`, `page` e `size`.
- [x] Implementar `GET /api/v1/pedido/{pedidoId}`.
- [x] Implementar `PATCH /api/v1/pedido/{pedidoId}` para cancelamento.
- [x] Validar forma de pagamento, endereco de entrega e items do pedido.
- [x] Garantir que a listagem retorne `PagedResponse<T>`.
- [x] Cobrir criacao, consulta e cancelamento com testes de integracao.

### 7. Validacoes, autorizacao e integridade

- [x] Garantir que rotas protegidas rejeitem chamadas sem token valido.
- [x] Garantir autorizacao por cliente quando aplicavel.
- [x] Aplicar FluentValidation nos requests expostos pela API.
- [x] Tratar conflito, nao encontrado, validacao e regra de negocio com respostas consistentes.
- [x] Revisar mensagens de erro para manter linguagem de dominio.

### 8. Testes obrigatorios

- [x] Criar testes unitarios para regras de dominio novas ou alteradas.
- [x] Criar fakes para casos de uso quando houver nova orquestracao na Application.
- [x] Criar testes de contrato para endpoints novos ou alterados.
- [x] Criar testes de integracao para os fluxos completos da API.
- [x] Garantir cobertura para os casos de erro relevantes.

### 9. Documentacao e sincronizacao

- [x] Manter `docs/api-reference.md` sincronizado com o comportamento entregue.
- [x] Atualizar exemplos de request e response quando os contratos mudarem.
- [x] Revisar o status de endpoints pendentes somente quando a implementacao existir.
- [x] Garantir que a documentacao nao prometa rotas ou campos fora do contrato real.

## Ordem sugerida de entrega

1. Base de contratos e padroes transversais
2. Auth
3. Cliente
4. Catalogo de produtos
5. Carrinho
6. Pedidos
7. Testes e refinamento final
8. Documentacao e sincronizacao

## Criterios de aceite

- Todos os endpoints descritos em `docs/api-reference.md` estao implementados ou tiveram sua divergencia explicitamente resolvida no contrato.
- As respostas seguem os envelopes padrao da API.
- As rotas protegidas funcionam com autenticacao valida.
- Os fluxos de cliente, catalogo, categoria, carrinho e pedidos possuem testes de integracao.
- A documentacao reflete o comportamento real da API sem promessas fora do contrato.
