# TASK-116 — Relatório de exploração

## Contexto

- Worktree: `E:/CodeRepo/shop-api/.worktrees/phase-8-hardening`
- `BASE_COMMIT`: `518ed7086d9abc8ec1cbbaa4506c6c8af44bf33e`
- Backlog: TASK-116 está `READY`; TASK-106, TASK-107 e as demais dependências
  declaradas estão `DONE`.
- Escopo analisado: plano TASK-116, páginas de lista e detalhe, queries,
  services, mutation, query keys, contratos, componentes, infraestrutura MSW
  e testes existentes de pedidos.

## Baseline

- `npm test -- --run src/features/orders`: PASS, 17 arquivos e 107 testes.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `git diff --check 518ed70`: PASS.
- Worktree limpo no início da exploração.

## Confirmação dos critérios

### Lista: CPF, período e paginação

O fluxo real atende ao critério:

1. `useOrdersQuery` carrega o perfil confirmado de `clienteId: 7`.
2. O CPF é normalizado e enviado por `listOrders`, sem entrar na query key.
3. `OrdersPage` converte datas civis em limites locais de início e fim do dia.
4. `listOrders` serializa `cpf`, `dataInicio`, `dataFim`, `page` e `size`.
5. O tamanho é fixado em `20`, e a página vem da URL.

O primeiro teste planejado usa corretamente o perfil `7`, CPF
`12345678901`, página `2`, limites locais e `Authorization: Bearer token-7`.
Com `pages: 2`, a ausência do botão `Página 3` também está correta.

### Detalhe: cliente, pedido e produtos únicos

- A sessão captura `clienteId: 7`; o perfil usa `GET /api/v1/cliente/7`.
- A rota `/pedidos/900` é validada por `parseOrderId` e produz
  `GET /api/v1/pedido/900`.
- A chave de detalhe começa com `orderQueryKeys.detail(7, 900)`.
- `useOrderProductsQuery` deduplica e ordena os IDs com `Set`, portanto os
  dois itens de produto `42` produzem somente um
  `GET /api/v1/produto/42`.
- A chave agregada de produtos é literalmente
  `['orders', 'products', [42]]`.

As duas ocorrências visuais de `Teclado Mecânico` correspondem aos dois itens,
enquanto o contador de rede igual a um prova a deduplicação.

### PATCH estrito e cancelamento recusado

- `createCancelOrderRequest()` retorna somente `{ status: 'Cancelado' }`.
- `cancelOrder` envia esse objeto por PATCH para `/api/v1/pedido/900`.
- Um `AppError` HTTP 422 é convertido em `{ kind: 'cancel-rejected' }`.
- Antes de retornar a recusa, a mutation invalida o detalhe capturado.
- A página fecha o diálogo, anuncia `O cancelamento não foi aceito` e mantém
  o status vindo do refetch confirmado.

O handler que sempre devolve o detalhe `Criado` permite provar que a recusa
não aplica estado otimista e que houve uma segunda leitura.

### Cancelamento bem-sucedido

No sucesso, a mutation:

- atualiza as queries de detalhe pelo prefixo do cliente/pedido capturado;
- invalida o detalhe para reconciliar com o servidor;
- invalida somente o prefixo `orderQueryKeys.lists(7)`;
- não invalida listas privadas do cliente `8`.

O segundo GET do detalhe devolvendo `Cancelado` é adequado para provar a
reconciliação confirmada, e as listas canônicas sem `sessionScope` semeadas
para clientes `7` e `8` permitem observar precisamente o limite da
invalidação.

## RED e lacunas de produto

Não foi encontrada lacuna de produto. Os quatro comportamentos requeridos já
estão implementados e possuem cobertura isolada; a TASK-116 deve acrescentar
somente a prova integrada com router, providers reais e MSW.

Entretanto, o listing literal possui um RED determinístico de teste:

- `useOrderDetailQuery` acrescenta um `sessionScope` à chave quando usado pela
  página real.
- Portanto, o detalhe carregado fica em
  `[..., clienteId, pedidoId, sessionScope]`, não na chave canônica exata
  `orderQueryKeys.detail(7, 900)`.
- Os asserts
  `queryClient.getQueryData(orderQueryKeys.detail(7, 900))` dos testes de
  detalhe, 422 e sucesso retornarão `undefined`, embora o produto esteja
  correto.

Isso é uma divergência do plano, não autorização para patch de produto. O
implementador deve ajustar a observação do cache na spec antes de executar os
passos GREEN.

## Divergências e ajustes recomendados no listing

1. **Consultar detalhes por prefixo.** Substituir os três
   `getQueryData(orderQueryKeys.detail(7, 900))` por
   `getQueriesData({ queryKey: orderQueryKeys.detail(7, 900) })` e verificar
   que existe exatamente uma entrada cujo dado tem o status esperado. Isso
   preserva o isolamento por sessão que a aplicação implementa.
2. **Tornar cliente/pedido capturados explícitos.** Os paths exatos dos
   handlers já provam cliente `7` e pedido `900`, mas ledgers de pathname e
   `authorization` para GET detalhe e PATCH deixariam o critério inequívoco.
3. **Fortalecer a paginação sem acoplar ao componente.** Além de ausência de
   `Página 3`, manter os asserts de `page=2` e `size=20`; opcionalmente
   verificar `Página 1` e `Página 2` para demonstrar consumo de `pages: 2`.
4. **A cópia 422 está correta, mas o matcher é frágil.** O texto concatenado
   de `role="alert"` funciona no DOM atual. É mais claro verificar título e
   descrição separadamente com `within(alert)`.
5. **Fixtures e seletores são compatíveis.** Os envelopes de perfil, pedido,
   cancelamento e produto satisfazem os schemas estritos. Os roles/names
   `Pedido 900`, `Cancelar pedido`, dialog e alert correspondem ao produto
   atual. `findAllByText('Teclado Mecânico')` deve encontrar os dois itens.
6. **As chaves de listas do teste de sucesso estão corretas.** Como são
   semeadas explicitamente sem `sessionScope`, `invalidateQueries` pelo
   prefixo de cliente `7` deve marcá-las inválidas, preservando cliente `8`.

## Recomendação ao implementador

Criar somente
`frontend/src/features/orders/orders.integration.test.tsx`. Manter fixtures,
requests, cópias e asserts de listas do plano; observar os detalhes com
`getQueriesData` pelo prefixo canônico e, preferencialmente, registrar path e
Authorization nos handlers de detalhe/PATCH. Se surgir qualquer outro RED,
bloquear TASK-116 e retornar à análise antes de alterar produto.
