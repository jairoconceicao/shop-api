# Tarefas do Frontend

Baseado em [`docs/frontend-plan.md`](./frontend-plan.md) e em [`docs/api-reference.md`](./api-reference.md).

Escopo exclusivo do frontend. O backend já está implementado e disponível em `http://localhost:5228`.

## Frontend

### Fase 1. Base do projeto

- [x] Criar o app SPA em `frontend/` com React e Vite.
- [x] Configurar Tailwind CSS v4 com a paleta `spanish-green`.
- [x] Configurar Zod, Zustand e estrutura de pastas por feature.
- [x] Criar o client HTTP centralizado para a API v1.
- [x] Configurar variáveis de ambiente para base URL e ambiente local.
- [x] Criar o sistema base de rotas e layout global.
- [x] Conectar o frontend ao backend local em `http://localhost:5228`.

### Fase 2. Design system

- [ ] Implementar `Button`, `Input`, `Select`, `Checkbox`, `Card` e `Badge`.
- [ ] Implementar `Modal`, `Toast`, `Pagination`, `Skeleton`, `EmptyState` e `Stepper`.
- [ ] Criar estados de loading, vazio, erro e sucesso para os componentes base.
- [ ] Definir padrões de foco, contraste e responsividade para desktop e mobile.

### Fase 3. Autenticação e sessão

- [x] Implementar schemas Zod para login.
- [x] Criar store de sessão com token JWT e dados do usuário.
- [x] Implementar login e logout.
- [x] Proteger rotas autenticadas.
- [x] Persistir a sessão localmente com expiração controlada.

### Fase 4. Catálogo e produto

- [x] Implementar listagem paginada de produtos.
- [x] Implementar filtro e navegação para o detalhe do produto.
- [x] Implementar página de detalhe do produto.
- [x] Mapear a resposta paginada do catálogo para o formato da UI.
- [x] Exibir estados de carregamento, vazio e erro no catálogo.

### Fase 5. Carrinho e checkout

- [x] Implementar store do carrinho atual.
- [x] Criar schemas Zod para inclusão e alteração de itens.
- [x] Implementar criação do carrinho.
- [x] Implementar inclusão, edição e remoção de itens.
- [x] Implementar tela de checkout com validação de dados.
- [x] Implementar criação de pedido a partir do carrinho.

### Fase 6. Pedidos

- [ ] Criar schemas Zod para filtros de busca de pedidos.
- [ ] Implementar listagem de pedidos por CPF com paginação.
- [ ] Implementar consulta de pedido por ID.
- [ ] Implementar cancelamento de pedido.
- [ ] Traduzir `FormaPagamento` e `PedidoStatus` para textos amigáveis.

### Fase 7. Cliente

- [ ] Criar schemas Zod para cadastro e atualização de cliente.
- [ ] Implementar cadastro de cliente.
- [ ] Implementar consulta de cliente por ID e por CPF.
- [ ] Implementar atualização de cliente.
- [ ] Implementar exclusão de conta do cliente.

### Fase 8. Qualidade e testes

- [ ] Criar testes unitários para schemas Zod.
- [ ] Criar testes unitários para stores Zustand.
- [ ] Criar testes do client HTTP e do mapeamento dos envelopes da API.
- [ ] Criar testes de integração dos fluxos principais.
- [ ] Criar testes E2E para login, catálogo, carrinho, checkout, pedidos e cliente.
- [ ] Revisar acessibilidade, estados de UI e feedback visual em todos os fluxos.

## Ordem sugerida de entrega

1. Base do projeto.
2. Design system.
3. Autenticação e sessão.
4. Catálogo e produto.
5. Carrinho e checkout.
6. Pedidos.
7. Cliente.
8. Testes e ajustes finais.
