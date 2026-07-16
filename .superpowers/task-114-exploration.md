# TASK-114 — Relatório de exploração

## Contexto e baseline

- Worktree: `E:/CodeRepo/shop-api/.worktrees/phase-8-hardening`
- `BASE_COMMIT`: `07f24d9a9c5cb6edd3dc04c25fd52f70b64c6428`
- Branch: `codex/phase-8-hardening`
- Backlog: TASK-114 está `BLOCKED` no commit base; o orquestrador deve confirmar dependências e promover para `READY` antes de escrita de produto/teste.
- Baseline executada:
  - `npm --prefix frontend test -- src/features/cart --run`
  - Resultado: **19 arquivos / 133 testes PASS**, exit code `0`.
- O checkout estava limpo antes da criação deste relatório.

## Fluxos confirmados nas fontes

### Primeiro item: POST create vazio e POST item uma vez

- `createCartService.ts` chama `POST /api/v1/carrinho/criar` sem `body`; portanto `await request.text()` deve ser `''`.
- `useAddProductToCart.ts`:
  1. consulta o vínculo local;
  2. cria o carrinho quando ausente;
  3. usa o ID retornado para adicionar o item;
  4. possui `pendingRef`, impedindo uma segunda cadeia concorrente.
- `useCreateCartMutation.ts` grava o vínculo após a resposta adaptada.
- `useAddCartItemMutation.ts` consulta primeiro o produto confirmado e envia uma vez:
  `{"produtoId":42,"quantidade":1,"valorUnitario":199.9}`.
- Divergência do texto do plano: o primeiro teste não realiza GET de carrinho e não prova “converges from confirmed GET”; ele prova somente ordem/quantidade dos dois POSTs e vínculo local.

### Leitura do carrinho existente

- `useCartQuery.ts` lê `cartIdsByCustomer[clienteId]` e chama `GET /api/v1/carrinho/:cartId`.
- `CartPage` e `StoreLayout/useConfirmedCartCount` compartilham a mesma query key
  `['cart','detail',customerId,cartId]`; TanStack Query deduplica a leitura ativa.
- O teste planejado é adequado para provar ausência de POST create, um GET e badge confirmado com 3 itens.

### PATCH, input, subtotal, total e badge

- `QuantityInput` responde a `ArrowUp`, previne o default e chama `onChange(3)`.
- `useUpdateCartItemMutation` envia PATCH estrito `{"quantidade":3}`, aplica quantidade otimista somente ao item alvo e reconcilia por GET ativo.
- `CartSummary`, `CartItem` e `useConfirmedCartCount` derivam seus valores do mesmo cache confirmado.
- Os seletores planejados existem:
  - `spinbutton` com nome `Quantidade de Teclado Mecânico`;
  - `complementary` com nome `Resumo do carrinho`;
  - link `Carrinho com 3 itens`.
- `getByText('Subtotal').nextElementSibling` funciona na estrutura atual, mas é estruturalmente frágil. Preferível limitar a asserção ao `dl`/linha ou usar o texto monetário dentro do `aside`.

### DELETE somente após confirmação

- O botão de item apenas abre o dialog.
- O DELETE só é emitido pelo botão `Remover item` do dialog.
- `submittingRemovalRef` e `isPending` impedem submissão duplicada.
- `deleteCartItemService.ts` não envia body, logo o ledger esperado é `['DELETE', '']`.
- Os seletores do plano correspondem à UI:
  - botão `Remover Teclado Mecânico`;
  - dialog `Remover item do carrinho?`;
  - botão interno `Remover item`.

### Rollback somente do alvo com mudança concorrente

- PATCH salva somente `previousItem` e o restaura por ID.
- DELETE salva item, posição e vizinhos e reinsere apenas o item removido.
- Ambos usam `updateExistingCart`, preservando modificações concorrentes nos outros itens.
- O harness planejado, alterando literalmente o item 702 para quantidade 4 enquanto a resposta do item 701 está pendente, testa corretamente este contrato para PATCH e DELETE.

### Carrinho 404

- `useCartQuery` remove o vínculo somente quando:
  - o erro é `AppError` HTTP 404;
  - o vínculo atual ainda aponta para o mesmo cart ID.
- Em seguida remove somente a query exata do cliente/carrinho alvo.
- O teste planejado preserva corretamente cliente 8 e seu cache.

## REDs e divergências obrigatórias no plano

### 1. Falta handler de categorias em todos os testes que renderizam `AppRouter`

`StoreLayout` sempre monta `useCategoriesQuery`, que chama `GET /api/v1/categoria`.
Os três testes planejados com `AppRouter` não registram esse handler. Com
`server.listen({ onUnhandledRequest: 'error' })`, isso gera request não tratado e torna o
harness incompleto, mesmo que a rejeição da query de categorias não derrube imediatamente
uma asserção do carrinho.

Correção mínima no fixture comum ou em cada teste de rota:

```tsx
http.get('*/api/v1/categoria', () =>
  HttpResponse.json({ status: true, data: [] }),
)
```

### 2. O teste de criação promete convergência que não observa

O teste `creates an empty-body cart before first item and converges from confirmed GET`
não registra `GET /api/v1/carrinho/70`, não monta consumidor ativo dessa query, não
inspeciona QueryClient e não verifica lista ou badge. `reconcileActiveCart` também retorna
`false` sem query ativa.

Opções coerentes:

- renomear o teste para refletir apenas create/add/vínculo e deixar convergência aos testes
  de rota; ou
- preferível pelo critério de aceite: montar um harness que também consuma
  `useCartQuery`/`useConfirmedCartCount`, adicionar o GET confirmado após os POSTs e
  verificar cache e badge/lista.

O critério “criar carrinho sem body antes do primeiro item” continua coberto pelo ledger,
mas o plano deve evitar alegar GET confirmado onde ele não existe.

### 3. Asserção do badge após DELETE tem uma corrida

`useDeleteCartItemMutation.onSuccess` aguarda o GET de reconciliação. Enquanto a mutation
ainda está `pending`, `useConfirmedCartCount` reconstrói a contagem confirmada anterior
para não exibir o DELETE otimista. Portanto o cache pode já conter `items: []` antes de a
mutation sair de `pending` e antes do badge mudar de `Carrinho com 3 itens` para
`Carrinho`.

O plano atualmente aguarda somente o cache vazio e depois usa uma asserção síncrona no
badge. Ajuste para:

```tsx
await waitFor(() =>
  expect(screen.getByRole('link', { name: 'Carrinho' })).toBeInTheDocument(),
)
```

Isso prova a convergência final em vez de depender da ordem de commits/renderizações.

### 4. A primeira jornada não comprova “POST item once” contra clique duplicado

O ledger com dois POSTs comprova uma execução simples, não o guard de duplicidade. O
critério literal pode ser satisfeito pela contagem atual, porém o mecanismo de
`pendingRef` só seria provado com dois cliques enquanto create/add está bloqueado.
Não é bloqueante se TASK-114 pretende somente quantidade esperada de requests na jornada,
mas deve ser documentado como limite de cobertura.

## Responses do MSW

As responses literais do plano são compatíveis com os adapters estritos atuais:

- create: `{ status, data: { carrinhoId, dataCarrinho } }`;
- add: `{ status, data: { itemId } }`;
- PATCH/DELETE: `{ status, data: { itemId, produtoId } }`;
- GET: inclui exatamente `clienteId`, `carrinhoId`, `dataCarrinho` e `items`;
- produto: inclui exatamente os campos exigidos, categoria aninhada e `foto: null`.

O response de erro `{ error: { message: 'falha controlada' } }` é suficiente para
`mapHttpError` em status 500. O 404 também é convertido em `AppError` HTTP e aciona a
limpeza esperada.

## Recomendação ao implementador

1. Adicionar handler determinístico de categoria a toda renderização do `AppRouter`.
2. Corrigir o nome/escopo do primeiro teste ou efetivamente incluir GET/cache/badge.
3. Aguardar semanticamente o badge vazio após DELETE.
4. Manter o harness de rollback exatamente por item; ele está alinhado à implementação.
5. Rodar cada filtro do plano, o arquivo completo, typecheck e lint. Qualquer RED restante
   deve bloquear TASK-114, pois o plano declara que não há mudança de produto prevista.

