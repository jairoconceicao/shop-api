# Projetar o ProductCard com dados do catálogo

Esta especificação define o `ProductCard` da TASK-051. O componente apresenta somente dados disponíveis no contrato `CatalogProduct` e leva à página de detalhes por um link explícito.

## Objetivo e escopo

Criar um componente de apresentação reutilizável para listas de produtos. O componente recebe um `CatalogProduct`, renderiza seus dados suportados e não executa ações de compra.

## Contrato de entrada

O componente recebe uma propriedade `product` com o tipo existente `CatalogProduct`:

```typescript
type CatalogProduct = {
  id: number
  title: string
  thumbnail: string | null
  price: number
  stock: number
  category: {
    id: number
    title: string
  }
}
```

O `ProductCard` não busca nem adapta dados. O componente que renderiza a lista fornece o objeto já adaptado pelo contrato do catálogo.

## Composição e conteúdo

Compor o `ProductCard` com os componentes compartilhados existentes:

- `Card` organiza a superfície do produto
- `ProductImage` exibe `thumbnail` e aplica seu fallback quando a imagem estiver ausente ou falhar
- `Badge` informa a disponibilidade derivada de `stock`
- `LinkButton` exibe “Ver detalhes”

Exibir somente estes dados:

- categoria em `category.title`
- título em `title`
- imagem em `thumbnail`, com fallback do `ProductImage`
- preço atual em `price`, formatado em reais brasileiros
- “Em estoque” quando `stock >= 1`
- “Esgotado” quando `stock < 1`

Não exibir controles de compra, quantidade, avaliação, promoção, preço anterior, Pix, parcelamento ou frete. Também não exibir modelo, descrição ou SKU, pois esses campos não pertencem ao `CatalogProduct`.

## Navegação aprovada

O usuário aprovou um link explícito, em vez de tornar o card inteiro clicável. O `LinkButton` “Ver detalhes” navega para `/produtos/{id}` pelo roteador da aplicação, sem recarregar a página.

## Acessibilidade e responsividade

O título identifica o produto e a imagem usa esse título como texto alternativo. O badge comunica a disponibilidade por texto, sem depender apenas de cor. O link mantém o nome acessível “Ver detalhes” e recebe foco pelo teclado.

O conteúdo se ajusta à largura oferecida pelo grid. Textos longos não podem ampliar o card nem sobrepor preço, disponibilidade ou link.

## Fluxo de dados

1. A lista recebe produtos já adaptados como `CatalogProduct`.
2. A lista fornece um produto ao `ProductCard`.
3. O componente deriva a disponibilidade de `stock` e formata `price` em reais brasileiros.
4. `ProductImage` resolve a imagem ou seu fallback.
5. O link navega para a rota de detalhes formada com `id`.

## Erros e fallback

O `ProductCard` não trata erros de rede ou de contrato. A camada que carrega o catálogo trata esses erros antes da renderização.

Quando `thumbnail` for `null` ou a imagem falhar, `ProductImage` apresenta seu fallback. O componente não inventa imagem, preço, disponibilidade ou dados comerciais.

## Testes orientados por comportamento

Implementar com desenvolvimento orientado a testes:

1. Escrever testes que falham para conteúdo, disponibilidade, fallback e navegação.
2. Implementar o mínimo necessário para os testes passarem.
3. Refatorar sem ampliar o escopo.

Os testes do componente devem verificar:

- categoria, título, imagem e preço em reais brasileiros
- estados “Em estoque” e “Esgotado” nos limites de `stock`
- fallback para imagem ausente e imagem com falha
- link “Ver detalhes” com destino `/produtos/{id}` e navegação sem reload
- nome acessível da imagem, do status e do link
- ausência dos dados e controles excluídos desta task

## Arquivos previstos

- Criar `frontend/src/features/catalog/components/ProductCard.tsx`
- Criar `frontend/src/features/catalog/components/ProductCard.test.tsx`
- Atualizar `docs/frontend-tasks-v2.md` somente após implementação, revisão e validação

Esta task não altera contratos, serviços, queries, páginas, grid ou rotas.
