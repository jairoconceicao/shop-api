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
- Catalogo de produtos
- Carrinho
- Pedidos

## Premissas de contrato

- Respostas de sucesso usam `ApiResponse<T>` ou `PagedResponse<T>`.
- Respostas de erro usam `ApiErrorResponse`.
- Rotas protegidas exigem `Authorization: Bearer <token>`.
- Datas sao serializadas em ISO 8601.
- Enums sao serializados como string.

## Pendencias de contrato a resolver antes da implementacao final

- A referencia define `GET /api/v1/produto/{id}` e `GET /api/v1/produto/categoria/{categoriaId}`. O roteamento e os contratos precisam ser mantidos consistentes na implementacao.
- O exemplo de `PUT /api/v1/cliente/{clienteId}/senha` precisa de um contrato de request valido e consistente com a API.
- Os exemplos de produto expostos em catalogo precisam manter `categoria` de forma consistente entre lista e detalhe.

## Tarefas

### 1. Base de contratos e padroes transversais

- [ ] Confirmar e padronizar os contratos compartilhados `ApiResponse<T>`, `PagedResponse<T>` e `ApiErrorResponse`.
- [ ] Definir o formato padrao de erros de validacao e de negocio.
- [ ] Centralizar o mapeamento de erros de dominio para respostas HTTP.
- [ ] Garantir serializacao de enums como string.
- [ ] Garantir serializacao de datas em ISO 8601.
- [ ] Revisar a estrutura de DTOs em `Contracts/Requests` e `Contracts/Responses`.

### 2. Auth

- [ ] Implementar `POST /api/v1/auth/login`.
- [ ] Implementar `POST /api/v1/auth/logout`.
- [ ] Validar email e senha no login.
- [ ] Emitir token, tipo, expiracao e identificadores do usuario no login.
- [ ] Registrar e invalidar `jti` no logout.
- [ ] Criar testes de contrato para login e logout.

### 3. Cliente

- [ ] Implementar `POST /api/v1/cliente` para cadastro.
- [ ] Implementar `GET /api/v1/cliente/{clienteId}`.
- [ ] Implementar `GET /api/v1/cliente/cpf/{cpf}`.
- [ ] Implementar `PUT /api/v1/cliente/{clienteId}` para atualizacao cadastral.
- [ ] Implementar `DELETE /api/v1/cliente/{clienteId}` para cancelamento de conta.
- [ ] Implementar `PUT /api/v1/cliente/{clienteId}/senha` para troca de senha.
- [ ] Validar CPF, email, data de nascimento, endereco e celular.
- [ ] Garantir que a criacao e a atualizacao retornem apenas o contrato previsto na referencia.
- [ ] Cobrir os casos de cliente com testes unitarios e de integracao.

### 4. Catalogo de produtos

- [ ] Implementar `GET /api/v1/produto` com paginação.
- [ ] Implementar `GET /api/v1/produto/{id}` para detalhe do produto.
- [ ] Implementar `GET /api/v1/produto/categoria/{categoriaId}` para listagem de produtos por categoria.
- [ ] Implementar busca textual por `searchword` no catalogo.
- [ ] Expor `categoria` nos contratos de listagem e detalhe de produto.
- [ ] Garantir que a paginação responda com `pages`, `size`, `totalItems` e `data`.
- [ ] Cobrir filtros e mapeamento do catalogo com testes de integracao.

### 5. Carrinho

- [ ] Implementar `GET /api/v1/carrinho/{carrinhoId}`.
- [ ] Implementar `POST /api/v1/carrinho/criar`.
- [ ] Implementar `POST /api/v1/carrinho/items`.
- [ ] Implementar `PATCH /api/v1/carrinho/items/{itemId}`.
- [ ] Implementar `DELETE /api/v1/carrinho/items/{itemId}`.
- [ ] Validar produto, quantidade e valor unitario ao manipular itens.
- [ ] Garantir que as respostas de carrinho e item sigam os contratos da referencia.
- [ ] Cobrir o fluxo completo do carrinho com testes de integracao.

### 6. Pedidos

- [ ] Implementar `POST /api/v1/pedido`.
- [ ] Implementar `GET /api/v1/pedido` com filtros `cpf`, `dataInicio`, `dataFim`, `page` e `size`.
- [ ] Implementar `GET /api/v1/pedido/{pedidoId}`.
- [ ] Implementar `PATCH /api/v1/pedido/{pedidoId}` para cancelamento.
- [ ] Validar forma de pagamento, endereco de entrega e items do pedido.
- [ ] Garantir que a listagem retorne `PagedResponse<T>`.
- [ ] Cobrir criacao, consulta e cancelamento com testes de integracao.

### 7. Validacoes, autorizacao e integridade

- [ ] Garantir que rotas protegidas rejeitem chamadas sem token valido.
- [ ] Garantir autorizacao por cliente quando aplicavel.
- [ ] Aplicar FluentValidation nos requests expostos pela API.
- [ ] Tratar conflito, nao encontrado, validacao e regra de negocio com respostas consistentes.
- [ ] Revisar mensagens de erro para manter linguagem de dominio.

### 8. Testes obrigatorios

- [ ] Criar testes unitarios para regras de dominio novas ou alteradas.
- [ ] Criar fakes para casos de uso quando houver nova orquestracao na Application.
- [ ] Criar testes de contrato para endpoints novos ou alterados.
- [ ] Criar testes de integracao para os fluxos completos da API.
- [ ] Garantir cobertura para os casos de erro relevantes.

### 9. Documentacao e sincronizacao

- [ ] Manter `docs/api-reference.md` sincronizado com o comportamento entregue.
- [ ] Atualizar exemplos de request e response quando os contratos mudarem.
- [ ] Revisar o status de endpoints pendentes somente quando a implementacao existir.
- [ ] Garantir que a documentacao nao prometa rotas ou campos fora do contrato real.

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


