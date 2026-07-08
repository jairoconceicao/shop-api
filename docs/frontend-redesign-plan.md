# Plano de Refatoracao do Frontend

## Objetivo

Refatorar o frontend existente em `frontend/` para seguir a proposta visual e de
experiencia descrita em [`docs/frontend-redesign-ui.md`](./frontend-redesign-ui.md),
sem reescrever a aplicacao do zero.

O foco e alinhar a UI da loja com um padrao de e-commerce mais comercial,
mobile first e consistente, preservando os contratos ja existentes da API.

## Contexto Atual

O frontend atual ja possui:

- Autenticacao com JWT.
- Catalogo e detalhe de produto.
- Carrinho.
- Checkout.
- Lista e detalhe de pedidos.
- Fluxo de cliente.

Por isso, este plano e de refatoracao visual e estrutural, com ajuste de
navegacao, layout, componentes compartilhados e consolidacao das rotas.

## Rotas E Contratos Ja Disponiveis

Backend ja atendido pelo frontend:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/produto`
- `GET /api/v1/produto/{id}`
- `POST /api/v1/carrinho/criar`
- `GET /api/v1/carrinho/{carrinhoId}`
- `POST /api/v1/carrinho/items`
- `PATCH /api/v1/carrinho/items/{itemId}`
- `DELETE /api/v1/carrinho/items/{itemId}`
- `POST /api/v1/pedido`
- `GET /api/v1/pedido`
- `GET /api/v1/pedido/{pedidoId}`
- `PATCH /api/v1/pedido/{pedidoId}`
- `POST /api/v1/cliente`
- `GET /api/v1/cliente/{clienteId}`
- `GET /api/v1/cliente/cpf/{cpf}`
- `PUT /api/v1/cliente/{clienteId}`
- `DELETE /api/v1/cliente/{clienteId}`

## Mapa De Rotas Do Redesign

Rotas alvo para a refatoracao:

| Rota proposta | Status | Observacao |
| --- | --- | --- |
| `/` | implementar | Home comercial com ofertas, categorias e vitrine. |
| `/login` | refatorar | Manter autenticacao, mas atualizar layout para o novo tema. |
| `/products` | refatorar | Pode coexistir com `catalogo` por meio de redirect durante a migracao. |
| `/products/:id` | refatorar | Mapeia para o detalhe de produto existente. |
| `/cart` | refatorar | Mapeia para o carrinho atual. |
| `/account` | refatorar | Hub da conta, reaproveitando o fluxo atual de cliente. |
| `/account/profile` | refatorar | E o mesmo cadastro/edicao do cliente atual. |
| `/account/orders` | refatorar | Reaproveita a listagem de pedidos ja existente. |
| `/account/password` | future | Nao existe rota/contrato de backend para troca de senha. |

## Escopo Da Refatoracao

### 1. Fundacao visual

- Trocar o tema global para os tokens do redesign (`shop-primary`,
  `shop-secondary`, `shop-background`, `shop-surface` etc).
- Ajustar background, card, borda, foco, sombras e raio dos componentes base.
- Revisar tipografia, espacamento e densidade para manter o visual de loja real.
- Padronizar estados de loading, vazio, erro e sucesso para todas as telas.

### 2. Shell da aplicacao

- Reestruturar o `AppLayout` para refletir a navegacao do redesign.
- Garantir header mobile com busca sempre visivel e acesso rapido ao carrinho.
- Garantir header desktop com busca central, categorias e acesso a conta/carrinho.
- Adicionar navegacao inferior no mobile.
- Incluir banner superior ou faixa de destaque comercial.
- Manter `ToastViewport` e feedback global acessiveis.

### 3. Home e catalogo

- Transformar a home em vitrine comercial com:
  - banner principal;
  - ofertas da semana;
  - categorias;
  - produtos em destaque.
- Reaproveitar a listagem paginada atual como base do catalogo.
- Reestruturar o `ProductCard` para exibir:
  - imagem;
  - nome;
  - avaliacao visual;
  - preco;
  - parcelamento;
  - frete gratis;
  - CTA de compra.
- Ajustar filtros, busca e paginação para manter a navegacao simples no mobile.

### 4. Pagina de produto

- Reorganizar o detalhe do produto em duas colunas no desktop.
- Destacar imagem, preco, parcelamento e CTAs de compra.
- Melhorar a hierarquia visual de breadcrumb, avaliacao e disponibilidade.
- Incluir blocos de especificacoes e informacoes complementares.

### 5. Carrinho e checkout

- Refatorar o carrinho para ficar mais visual e objetivo.
- Manter edicao de quantidade, remocao de item e resumo de valores.
- Aplicar o layout com resumo sempre visivel no desktop.
- No checkout, manter:
  - stepper de progresso;
  - endereco de entrega;
  - pagamento;
  - resumo fixo do pedido.
- Garantir que os fluxos atuais continuem usando os endpoints existentes de carrinho e pedido.

### 6. Conta E Pedidos

- Reorganizar a area do cliente em um hub com menu lateral ou cards de atalho.
- Reutilizar a edicao de dados do cliente para a rota `/account/profile`.
- Reaproveitar a listagem de pedidos para `/account/orders`.
- Exibir logout, status da conta e ultimos pedidos de forma mais comercial.

### 7. Ajustes de navegacao

- Criar aliases ou redirects entre as rotas antigas e as novas rotas do redesign.
- Manter a navegacao atual funcional durante a migracao.
- Atualizar links internos, CTAs e breadcrumbs para a nova nomenclatura.

### 8. Qualidade

- Garantir consistencia mobile first.
- Validar acessibilidade visual, contraste e foco.
- Revisar telas vazias, erros de API e feedback visual.
- Cobrir os fluxos principais com testes depois da refatoracao.

## Tarefas Future

As seguintes sugestoes do redesign nao possuem rota de backend correspondente
hoje e devem ficar como `future`:

- `[future]` Troca de senha em `/account/password`.
- `[future]` Busca global com autocomplete server-side para o catalogo.
- `[future]` Menu real de categorias com origem em backend.
- `[future]` Banner promocional e ofertas dinamicas com origem em backend.
- `[future]` Avaliacoes, reviews e nota agregada do produto.
- `[future]` Estimativa de frete e prazo de entrega baseada em CEP.
- `[future]` Gerenciamento separado de enderecos salvos.

## Ordem Sugerida

1. Atualizar tema global e componentes base.
2. Refatorar `AppLayout` e navegacao responsiva.
3. Recriar home e catalogo visualmente.
4. Ajustar pagina de produto.
5. Ajustar carrinho e checkout.
6. Ajustar conta e pedidos.
7. Consolidar rotas e redirects.
8. Executar testes e validacoes finais.

## Critério De Conclusao

O plano fica concluido quando:

- A interface refletir a proposta visual do redesign.
- As rotas principais estiverem alinhadas com a experiencia descrita.
- Os fluxos existentes continuarem funcionando com os contratos atuais da API.
- As sugestoes sem suporte de backend estiverem explicitamente registradas como
  `future`.

