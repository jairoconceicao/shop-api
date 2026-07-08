# Plano de implementação e alinhamento da API v1

**Tipo de conteúdo:** Reference

Este plano consolida a diferença entre o contrato em `openapi.yaml`, a documentação em `docs/api-reference.md` e os endpoints atualmente implementados no backend `aspnet-api/`.

## Objetivo

Trazer contrato, documentação e implementação para o mesmo estado funcional, reduzindo divergência entre o que a API expõe, o que a documentação descreve e o que o frontend pode consumir.

## Base analisada

- `openapi.yaml`
- `docs/api-reference.md`
- Endpoints do backend em `aspnet-api/src/Api/Endpoints/`
- Contratos de request/response em `aspnet-api/src/Api/Contracts/`

## Conclusão executiva

O backend atual cobre a base principal do `openapi.yaml`, mas o documento agora também inclui endpoints futuros alinhados com `docs/api-reference.md`.

Os pontos futuros estão previstos em `openapi.yaml` e `docs/api-reference.md`, mas ainda não existem no backend:

- `PUT /api/v1/cliente/{clienteId}/senha`
- `GET /api/v1/produto/{categoriaId}`
- `GET /api/v1/produto?searchword=...`

Além disso, os exemplos de produto em `docs/api-reference.md` mostram `categoria`, mas os contratos atuais de `ProdutoCatalogoItemResponse` e `ProdutoDetalheResponse` não têm esse campo.

## Estado atual por área

### Auth

Implementado:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`

### Clientes

Implementado:

- `GET /api/v1/cliente/{clienteId}`
- `GET /api/v1/cliente/cpf/{cpf}`
- `POST /api/v1/cliente`
- `PUT /api/v1/cliente/{clienteId}`
- `DELETE /api/v1/cliente/{clienteId}`

Não implementado:

- troca de senha dedicada

### Produtos

Implementado:

- `GET /api/v1/produto`
- `GET /api/v1/produto/{id}`

Não implementado:

- busca textual por `searchword`
- listagem por categoria
- endpoint dedicado de categorias

### Carrinhos

Implementado:

- `GET /api/v1/carrinho/{carrinhoId}`
- `POST /api/v1/carrinho/criar`
- `POST /api/v1/carrinho/items`
- `PATCH /api/v1/carrinho/items/{itemId}`
- `DELETE /api/v1/carrinho/items/{itemId}`

### Pedidos

Implementado:

- `POST /api/v1/pedido`
- `GET /api/v1/pedido`
- `GET /api/v1/pedido/{pedidoId}`
- `PATCH /api/v1/pedido/{pedidoId}`

## Lacunas e ajustes necessários

| Prioridade | Área | Gap | Fonte da divergência | Ação recomendada |
| --- | --- | --- | --- | --- |
| P0 | Documentação | `docs/api-reference.md` descreve rotas que não existem | `docs/api-reference.md` | Marcar como `future` ou remover até a implementação existir |
| P0 | Documentação | Exemplos de produto usam `categoria` que não existe nos contratos | `docs/api-reference.md`, contratos de produto | Ajustar exemplos para refletir o DTO real ou expandir o contrato |
| P0 | OpenAPI | Manter o OpenAPI sincronizado com os endpoints futuros e com os contratos do backend | `openapi.yaml`, `docs/api-reference.md`, backend | Atualizar o OpenAPI junto da implementação e manter os schemas coerentes com o frontend |
| P1 | Backend | Troca de senha não existe | `docs/api-reference.md` | Implementar `PUT /api/v1/cliente/{clienteId}/senha` se esse fluxo for requisito |
| P1 | Backend | Busca textual de produto não existe | `docs/api-reference.md` | Implementar filtro `searchword` no catálogo se esse fluxo for requisito |
| P1 | Backend | Navegação por categoria não existe | `docs/api-reference.md` | Criar endpoint de categoria ou suportar filtro por categoria no catálogo |
| P1 | Contrato | Produto ainda não expõe categoria nos contratos C# | `aspnet-api/src/Api/Contracts/` | Adicionar `categoria` aos DTOs e mapeadores se os endpoints futuros permanecerem no plano |
| P2 | Testes | Falta cobertura explícita para as novas rotas planejadas | backend | Criar testes de integração/contrato para qualquer endpoint novo |

## Plano de implementação

### Fase 1: alinhar documentação ao que já existe

- Atualizar `docs/api-reference.md` para refletir apenas as rotas efetivamente entregues.
- Mover para seção `future` os fluxos ainda não implementados.
- Atualizar os contratos C# e os mapeadores de produto para expor `categoria`, caso os endpoints futuros permaneçam no plano.
- Revisar o texto introdutório do documento, que hoje afirma que os contratos refletem as rotas implementadas, mas mistura rotas reais com rotas planejadas.

### Fase 2: decidir a estratégia para produto e categoria

- Definir se o catálogo vai suportar busca textual no backend.
- Definir se a navegação por categoria será um filtro no catálogo ou um recurso dedicado.
- Se a categoria for parte do produto exibido ao frontend, expandir os contratos e o OpenAPI antes de implementar a UI dependente.

### Fase 3: implementar os itens `future`

- Adicionar endpoint de troca de senha do cliente.
- Adicionar busca no catálogo por texto.
- Adicionar navegação por categoria.
- Garantir validação, mensagens de erro e testes para cada novo endpoint.

### Fase 4: reforçar consistência entre contrato e implementação

- Gerar ou revisar o OpenAPI a partir dos contratos C#.
- Validar status codes e envelopes de resposta contra os métodos reais.
- Garantir que mudanças futuras sejam sempre acompanhadas de atualização do OpenAPI e da referência em `docs/`.

## Itens já prontos para consumo

O frontend já pode depender com segurança destas rotas:

- autenticação
- cadastro e manutenção de cliente
- catálogo básico de produtos
- carrinho
- criação e consulta de pedidos

## Itens que entram no plano como próximas entregas

- alteração de senha
- busca textual de produtos
- navegação por categoria
- qualquer expansão de catálogo que dependa de novos filtros ou recursos

## Critérios de aceite

- `openapi.yaml`, `docs/api-reference.md` e backend descrevem o mesmo subconjunto implementado, com os endpoints futuros explicitamente marcados.
- `docs/api-reference.md` não promete rotas inexistentes sem marcação de `future`.
- Exemplos de request/response batem com os contratos reais.
- Qualquer nova rota planejada vem com testes de integração e contrato.

## Observação final

Se a intenção do projeto for manter `docs/api-reference.md` como fonte de verdade funcional, então as rotas de senha, busca e categoria precisam entrar no backend.
Se a intenção for tratar o backend atual como fonte de verdade, então a documentação deve ser reduzida para o conjunto já implementado e os demais fluxos devem ser explicitamente marcados como futuros.
